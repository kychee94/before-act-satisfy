<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            UserSeeder::class,
        ]);
    }
}
