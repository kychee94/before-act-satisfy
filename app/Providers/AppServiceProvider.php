<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;

use Validator;
use Log;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // handle session prefix
        $this->app->extend('session', function ($service, $app) {
            // Prefix all session keys with 'myapp_'
            $service->extend('file', function ($app) use ($service) {
                $handler = $service->driver('file');
                $handler->getHandler()->setPrefix(env('SESSION_PREFIX')); // Set your custom prefix

                return $handler;
            });

            return $service;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        Validator::extend('without_spaces', function($attr, $value){
            return preg_match('/^\S*$/u', $value);
        });

        Inertia::share([
            'userInfo' => fn () => getUserInfo(),
        ]);
    }
}
