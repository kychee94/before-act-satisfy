<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

use App\Models\CustomerAnnouncement;

use Log;

class ReadAnnouncement extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'read:announcement {--A|AnnouncementID=} {--C|CustomerID=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark announcement as read fopr specific customer using Announcement ID and Customer ID';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $announcement_id = $this->option('AnnouncementID');
        $customer_id = $this->option('CustomerID');

        if(!$announcement_id){
            $announcement_id = $this->ask('Please enter Announcement ID');
        }

        if(!$customer_id){
            $customer_id = $this->ask('Please enter Customer ID');
        }

        // Validation
        $validator = Validator::make([
                'announcement_id' => $announcement_id,
                'customer_id' => $customer_id,
            ],
            [
                'announcement_id' => 'required|integer',
                'customer_id' => 'required|integer',
            ]
        );
     
        if($validator->fails()){
            $this->error('Invalid Input');
            return Command::FAILURE;
        }

        // Update database
        CustomerAnnouncement::where('announcement_id', $announcement_id)
                            ->where('customer_id', $customer_id)
                            ->update([
                                'is_read' => true
                            ]);

        $this->info("Operation Success");

        return Command::SUCCESS;
    }
}
