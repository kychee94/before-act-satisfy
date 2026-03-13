<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

use App\Models\Customer;
use App\Models\Announcement;
use App\Models\CustomerAnnouncement;

use Log;

class Q1Seeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate tables
        Announcement::truncate();
        Customer::truncate();
        CustomerAnnouncement::truncate();

        // Create 5 announcements
        for($i=1; $i<=5; $i++){
            Announcement::create([
                'uuid' => Str::uuid()->toString(),
                'title' => 'Announcement '.$i,
                'content' => 'This is announcement '.$i,
                'status' => Announcement::CODE_STATUS_ACTIVE
            ]);
        }

        // Create 2 customer
        Customer::create([
            'name'      => 'Customer A',
            'username'  => 'customera',
            'password'  => bcrypt(123456),
            'status'    => Customer::CODE_STATUS_ACTIVE
        ]);
        Customer::create([
            'name'      => 'Customer B',
            'username'  => 'customerb',
            'password'  => bcrypt(123456),
            'status'    => Customer::CODE_STATUS_ACTIVE
        ]);

        // Assigning announcements to customers
        $announcements = Announcement::active()->get();
        $customers = Customer::active()->get();
        foreach($announcements as $announcement){
            foreach($customers as $customer){
                CustomerAnnouncement::create([
                    'announcement_id' => $announcement->id,
                    'customer_id' => $customer->id,
                    'is_read' => false,
                    'status' => CustomerAnnouncement::CODE_STATUS_ACTIVE
                ]);
            }
        }

        // Mark FIRST announcement as 'READ' by FIRST customer
        $first_announcement = Announcement::active()->first();
        $first_customer = Customer::active()->first();
        CustomerAnnouncement::where('customer_id', $first_customer->id)
                            ->where('announcement_id', $first_announcement->id)
                            ->update([
                                'is_read' => true
                            ]);
    }
}
