<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;

use Log;

class Handler extends ExceptionHandler
{
    protected $dontReport = [];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $exception)
    {
        // For Inertia
        if ($request->header('X-Inertia')) {
            $status = 500;

            if ($exception instanceof HttpExceptionInterface) {
                $status = $exception->getStatusCode();
            }

            // Detect 500 error
            $status = $this->isHttpException($exception) ? $exception->getStatusCode() : 500;

            if ($request->is('admin/*')) {
                return Inertia::render('errors/admin/' . $status)
                    ->toResponse($request)
                    ->setStatusCode($status);
            } else {
                return Inertia::render('errors/' . $status)
                    ->toResponse($request)
                    ->setStatusCode($status);
            }

        }

        if ($request->is('api/*')) {
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
                    'success' => false,
                    'error' => $message,
                ], $status);
            }
        }

        return parent::render($request, $exception);
    }

    protected function unauthenticated($request, AuthenticationException $exception)
    {
        // If it's an Inertia request
        if ($request->is('admin/*')) {
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return redirect()->route('admin');
            }
        }else{
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return redirect()->route('home');
            }
        }

        return parent::unauthenticated($request, $exception);
    }
}
