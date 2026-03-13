<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\ApiController;
use App\Services\NotificationService;

Route::fallback(function (Request $request) {
    return response()->json([
        'success' => false,
        'error' => 'Invalid API route.',
    ], 404);
});