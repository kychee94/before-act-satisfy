<?php

namespace App\Http\Controllers\Auth\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Helpers\Helper;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

use App\Models\User;

use Auth;
use Log;
use Validator;
use DB;

class LoginController extends Controller
{
    public function login(Request $request)
    {
    }

    public function logout(Request $request)
    {
    }
}
