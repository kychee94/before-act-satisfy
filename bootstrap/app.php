<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
        
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            if (! app()->environment(['local', 'testing']) && in_array($response->getStatusCode(), [500, 503, 401, 403, 404, 405])) {
                $status = $response->getStatusCode();

                if ($request->is('admin/*')) {
                    return redirect()->route('admin.'.$status);
                } else if($request->is('api/*')){
                    $status = 500;
                    $message = 'Server Error.';

                    // Identify common HTTP exceptions
                    switch (true) {
                        case $exception instanceof NotFoundHttpException:
                            $status = 404;
                            $message = 'Invalid API route.';
                            break;

                        case $exception instanceof MethodNotAllowedHttpException:
                            $status = 405;
                            $message = 'HTTP method not allowed for this endpoint.';
                            break;
                    }

                    // Return unified JSON response
                    if (in_array($status, [404, 405, 500])) {
                        return response()->json([
                            'code' => $status,
                            'message' => $message,
                        ], $status);
                    }
                } else {
                    return redirect()->route($status);
                }
            } elseif ($response->getStatusCode() === 419) {
                return back()->with([
                    'message' => 'The page expired, please try again.',
                ]);
            }

            return $response;
        });
    })->create();
