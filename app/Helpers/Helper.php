<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

if (! function_exists('getUserInfo')) {
    function getUserInfo()
    {
        $data = null;

        if(auth()->check()){
            $user = auth()->user();
            $data = [
                'id' => $user->id,
                'name' => $user->name,
            ];
        }

        return $data;
    }
}
