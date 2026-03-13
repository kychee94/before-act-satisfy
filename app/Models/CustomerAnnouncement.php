<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes; 
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

use App\Models\Announcement;
use App\Models\Customer;

use Log;
use DB;

class CustomerAnnouncement extends Model
{
    protected $table = 'customer_announcement';
    
    protected $guarded = [];

    use SoftDeletes;

    const
        CODE_STATUS_ACTIVE = 1,
        CODE_STATUS_INACTIVE = 2
    ;

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function announcement()
    {
        return $this->belongsTo(Announcement::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::CODE_STATUS_ACTIVE);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
