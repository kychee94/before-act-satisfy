<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = bcrypt('trial123');

        User::insert([
            'uuid' => Str::uuid()->toString(),
            'user_first_name' => 'Demo',
            'user_last_name' => 'demo',
            'user_code' => '',
            'user_gender' => '',
            'user_dob' => '1992-10-14',
            'user_role' => 1,
            'username' => 'demo',
            'password' => $password,
            'user_email' => 'demo123@demo.com',
            'user_template' => '1',
            'user_country' => ','.env('MY_COUNTRY').',',
            'user_status' => '1',
        ]);
    }
}
