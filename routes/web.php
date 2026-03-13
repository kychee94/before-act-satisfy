<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\LoginController;

Route::get('/', function(){ 
    return Inertia::render('auth/Login');
})->name('login');

Route::controller(LoginController::class)->group(function () {
    Route::post('/', 'login')->name('login.post');
});
