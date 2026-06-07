<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\FirebaseService;
use Mockery;
use Mockery\MockInterface;

class SecurityTest extends TestCase
{
    protected FirebaseService|MockInterface $firebaseMock;

    protected function setUp(): void
    {
        parent::setUp();

        // Mock the FirebaseService to avoid making real network calls to Firebase RTDB in tests
        $this->firebaseMock = $this->mock(FirebaseService::class);

        // Allow security_events writes by default since many security events trigger this
        $this->firebaseMock->shouldReceive('createDocument')
            ->byDefault()
            ->with('security_events', Mockery::any())
            ->andReturn([]);
    }

    /**
     * Test XSS detection in input sanitization middleware.
     */
    public function test_xss_payload_is_blocked_by_sanitize_middleware(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Doe <script>alert(1)</script>',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Request contains potentially malicious content.'
            ]);
    }

    /**
     * Test SQL injection pattern in login is blocked by sanitize middleware.
     */
    public function test_sqli_payload_is_blocked_by_sanitize_middleware(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => "admin' OR 1=1--",
            'password' => 'anything'
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Request contains potentially malicious content.'
            ]);
    }

    /**
     * Test that guest endpoints work when correct values are sent.
     */
    public function test_registration_with_clean_data_passes_middleware(): void
    {
        // Mock checking duplicate emails and creating documents
        $this->firebaseMock->shouldReceive('getDocuments')
            ->once()
            ->with('users')
            ->andReturn([]);

        $this->firebaseMock->shouldReceive('createDocument')
            ->once()
            ->with('users', Mockery::any())
            ->andReturn([
                'id' => 'mocked-user-id',
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'role' => 'user'
            ]);

        $this->firebaseMock->shouldReceive('createDocument')
            ->once()
            ->with('activity_logs', Mockery::any())
            ->andReturn([]);

        $this->firebaseMock->shouldReceive('createDocument')
            ->once()
            ->with('user_tokens', Mockery::any())
            ->andReturn([]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Registration successful.'
            ]);
    }

    /**
     * Test access to protected route without a token.
     */
    public function test_protected_route_requires_token(): void
    {
        $response = $this->getJson('/api/devices');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated. No token provided.'
            ]);
    }

    /**
     * Test access to protected route with invalid token.
     */
    public function test_protected_route_blocks_invalid_token(): void
    {
        $this->firebaseMock->shouldReceive('getDocuments')
            ->once()
            ->with('user_tokens')
            ->andReturn([
                [
                    'id' => 'token-1',
                    'user_id' => 'user-123',
                    'token_hash' => hash('sha256', 'valid-token')
                ]
            ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid-token'
        ])->getJson('/api/devices');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated. Invalid token.'
            ]);
    }

    /**
     * Test that user is blocked from admin routes if they are not admin.
     */
    public function test_non_admin_cannot_access_admin_endpoints(): void
    {
        $this->firebaseMock->shouldReceive('getDocuments')
            ->once()
            ->with('user_tokens')
            ->andReturn([
                [
                    'id' => 'token-1',
                    'user_id' => 'user-123',
                    'token_hash' => hash('sha256', 'some-token'),
                    'expires_at' => now()->addHour()->toDateTimeString()
                ]
            ]);

        $this->firebaseMock->shouldReceive('getDocument')
            ->once()
            ->with('users', 'user-123')
            ->andReturn([
                'id' => 'user-123',
                'name' => 'Regular User',
                'email' => 'regular@test.com',
                'role' => 'user',
                'is_active' => true
            ]);

        // Mock the SecurityLogger firebase write call
        $this->firebaseMock->shouldReceive('createDocument')
            ->once()
            ->with('security_events', Mockery::any())
            ->andReturn([]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer some-token'
        ])->getJson('/api/admin/users');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Forbidden. Insufficient permissions.'
            ]);
    }

    /**
     * Test that 429 is returned after exceeding the login rate limit (brute-force).
     * Route has throttle:10,1 so the 11th request within a minute should be blocked.
     */
    public function test_brute_force_login_triggers_rate_limit(): void
    {
        // Allow any number of createDocument calls for login_attempts + security_events
        $this->firebaseMock->shouldReceive('createDocument')
            ->byDefault()
            ->andReturn([]);

        // Simulate users lookup returning empty (fast path — no user found)
        $this->firebaseMock->shouldReceive('getDocuments')
            ->byDefault()
            ->with('users')
            ->andReturn([]);

        $payload = ['email' => 'hacker@evil.com', 'password' => 'wrongpassword'];

        // Send 11 requests; the first 10 pass the throttle, the 11th must return 429
        $lastResponse = null;
        for ($i = 0; $i < 11; $i++) {
            $lastResponse = $this->postJson('/api/auth/login', $payload);
        }

        $lastResponse->assertStatus(429)
            ->assertJson([
                'success' => false,
                'message' => 'Too many requests. Please slow down.',
            ]);
    }
}
