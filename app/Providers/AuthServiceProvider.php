<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

use App\Models\UserAccess;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Setting::class => SettingPolicy::class,
        User::class => UserPolicy::class,
    ];

    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Define Gates for non-model features
        Gate::define('delete-transaction', function (User $user, UserAccess $user_access) {
            return $user->hasAccess('delete-transaction', UserAccess::CODE_ACCESS_WRITE);
        });
    }
}
