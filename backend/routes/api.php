<?php
use App\Http\Controllers\Api\RecolteController;
use App\Http\Controllers\Api\IntrantController;
use App\Http\Controllers\Api\CultureController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ParcelleController;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées : jeton Sanctum obligatoire
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::apiResource('parcelles', ParcelleController::class);
    Route::apiResource('cultures', CultureController::class);
    Route::apiResource('intrants', IntrantController::class);
    Route::apiResource('recoltes', RecolteController::class);
});