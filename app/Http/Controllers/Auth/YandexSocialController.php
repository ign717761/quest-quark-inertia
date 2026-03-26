<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Auth;
use Str;

class YandexSocialController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('yandex')->redirect();
    }

    public function callback()
    {
        $socialUser = Socialite::driver('yandex')->user();

        $user = User::where('provider', 'yandex')
            ->where('provider_id', $socialUser->getId())
            ->first();

        if (!$user && $socialUser->getEmail()) {
            $user = User::where('email', $socialUser->getEmail())->first();
        }

        if (!$user) {
            $user = new User();
            $user->name = $socialUser->getName() ?: $socialUser->getNickname() ?: 'Yandex User';
            $user->email = $socialUser->getEmail();
            $user->password = Str::random(40);
        }

        $user->provider = 'yandex';
        $user->provider_id = $socialUser->getId();

        if (!$user->name) {
            $user->name = $socialUser->getName() ?: $socialUser->getNickname() ?: 'Yandex User';
        }

        if (!$user->email && $socialUser->getEmail()) {
            $user->email = $socialUser->getEmail();
        }

        $user->save();

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
