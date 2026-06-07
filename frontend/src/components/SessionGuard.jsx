import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Clock, X } from 'lucide-react';

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

/**
 * SessionGuard — auto-logout on inactivity.
 * @param {number} timeoutMinutes  - Total idle time before logout (default 15min)
 * @param {number} warningMinutes  - Show warning this many minutes before logout (default 2min)
 */
export default function SessionGuard({ timeoutMinutes = 15, warningMinutes = 2 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const warnRef  = useRef(null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(warningMinutes * 60);
  const countdownRef = useRef(null);

  const TIMEOUT_MS = timeoutMinutes * 60 * 1000;
  const WARN_MS    = warningMinutes * 60 * 1000;

  const doLogout = useCallback(async () => {
    clearTimeout(timerRef.current);
    clearTimeout(warnRef.current);
    clearInterval(countdownRef.current);
    setShowWarning(false);
    await logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const resetTimers = useCallback(() => {
    if (!user) return;

    // Clear existing timers
    clearTimeout(timerRef.current);
    clearTimeout(warnRef.current);
    clearInterval(countdownRef.current);
    setShowWarning(false);
    setCountdown(warningMinutes * 60);

    // Set warning timer
    warnRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(warningMinutes * 60);
      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }, TIMEOUT_MS - WARN_MS);

    // Set logout timer
    timerRef.current = setTimeout(doLogout, TIMEOUT_MS);
  }, [user, doLogout, TIMEOUT_MS, WARN_MS, warningMinutes]);

  // Attach/detach activity listeners
  useEffect(() => {
    if (!user) return;

    resetTimers();
    EVENTS.forEach(e => window.addEventListener(e, resetTimers, { passive: true }));

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(warnRef.current);
      clearInterval(countdownRef.current);
      EVENTS.forEach(e => window.removeEventListener(e, resetTimers));
    };
  }, [user, resetTimers]);

  if (!showWarning) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = String(countdown % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-[999] flex items-center justify-center p-4">
      <div
        className="animate-scale-in bg-elevated rounded-[24px] px-8 py-9 max-w-[380px] w-full text-center"
        style={{
          boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
        }}
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-[20px] bg-danger/10 flex items-center justify-center mx-auto mb-5">
          <Clock size={28} className="text-danger" />
        </div>

        <h3 className="font-display font-bold text-[20px] text-text-primary mb-2">
          Sesi Hampir Berakhir
        </h3>
        <p className="text-sm text-text-muted leading-[1.6] mb-5">
          Anda tidak aktif. Sesi akan berakhir otomatis dalam:
        </p>

        {/* Countdown display */}
        <div className="inline-flex items-center gap-1 px-6 py-[10px] rounded-2xl bg-danger/10 border border-danger/20 mb-7">
          <span className="font-display font-extrabold text-[32px] text-danger tracking-[-0.02em] leading-none">
            {minutes > 0 ? `${minutes}:${seconds}` : `0:${seconds}`}
          </span>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={doLogout}
            className="flex-1 flex items-center justify-center gap-1.5 py-[11px] px-4 rounded-xl bg-base border-[1.5px] border-border-default text-text-muted text-sm font-medium cursor-pointer"
          >
            <LogOut size={15} /> Logout Sekarang
          </button>
          <button
            onClick={resetTimers}
            className="flex-1 flex items-center justify-center gap-1.5 py-[11px] px-4 rounded-xl bg-primary text-white text-sm font-semibold cursor-pointer"
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.22)',
            }}
          >
            <X size={15} /> Tetap Aktif
          </button>
        </div>

        <p className="mt-[14px] text-xs text-text-placeholder">
          Gerakkan mouse atau tekan tombol apapun untuk tetap aktif
        </p>
      </div>
    </div>
  );
}
