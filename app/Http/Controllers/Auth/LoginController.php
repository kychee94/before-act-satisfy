<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
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
    public function login(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(),
            [
                'username' => 'required|email',
                'password' => 'required',
            ]
        );
     
        if($validator->fails()){
            return back()->with('msg-class', 'error')->with('msg', $validator->errors()->all());
        }

        $credentials['username'] = $request->username;
        $credentials['password'] = $request->password;

        $ip = $request->ip();

        //attemps login
        if (Auth::attempt($credentials) == false) {
            return back()->with('msg-class', 'error')->withErrors(['username' => trans('Invalid username or password')])->with('msg', trans('string.Invalid username or password'));
        }

        $request->session()->regenerate();

        $user = Auth::user();

        DB::beginTransaction();
        $token = md5(date('Y-m-d H:i:s')) . uniqid();

        // save uniqueid
        User::where('id', $user->id)
            ->update([
                'uniqueid' => $token,
                'last_login' => date('Y-m-d H:i:s')
            ]);
        
        DB::commit();

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
