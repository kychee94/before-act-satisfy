<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\HomeController;

Route::get('/', function(){ 
    return Inertia::render('auth/Login');
})->name('login');

Route::controller(LoginController::class)->group(function () {
    Route::post('/', 'login')->name('login.post');
});

Route::middleware(['auth:customer'])->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::get('/announcement', [HomeController::class, 'announcement'])->name('announcement');
    Route::get('/announcement/details/{uuid}', [HomeController::class, 'announcementDetails'])->name('announcement.details');
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
});

