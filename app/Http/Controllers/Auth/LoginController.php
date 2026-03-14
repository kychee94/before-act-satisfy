<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Helpers\Helper;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

use App\Models\Customer;

use Auth;
use Log;
use Validator;
use DB;

class LoginController extends Controller
{
    public function login(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(),
            [
                'username' => 'required',
                'password' => 'required',
            ]
        );
     
        if($validator->fails()){
            return back()->with('msg-class', 'error')->with('msg', $validator->errors()->all());
        }

        $credentials['username'] = $request->username;
        $credentials['password'] = $request->password;

        $ip = $request->ip();

        // attempt login
        if (Auth::guard('customer')->attempt($credentials) == false) {
            return back()->with('msg-class', 'error')->withErrors(['username' => trans('Invalid username or password')])->with('msg', trans('string.Invalid username or password'));
        }

        $request->session()->regenerate();

        return redirect()->intended(route('home'));
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
