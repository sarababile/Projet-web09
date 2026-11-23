<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (\Illuminate\Http\Request $request) => $request->is('api/*')
        );
                 // Erreurs HTTP de l'API (403, 404…) : message court, sans trace technique
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpExceptionInterface $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                $message = $e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
                    ? 'Ressource introuvable.'
                    : ($e->getMessage() ?: 'Erreur.');

                return response()->json(['message' => $message], $e->getStatusCode());
            }
        });
    })->create();
