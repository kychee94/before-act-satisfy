<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Helpers\Helper;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

use Auth;
use Log;
use Validator;
use DB;

class HomeController extends Controller
{
    // Access to route /
    public function index(Request $request)
    {
        return Inertia::render('welcome');
    }
}
