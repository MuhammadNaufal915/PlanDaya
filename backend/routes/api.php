<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FirebaseTestController;

Route::get('/firebase-test', [FirebaseTestController::class, 'test']);