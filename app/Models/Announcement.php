<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes; 
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

use Log;
use DB;

class Announcement extends Model
{
    protected $table = 'announcement';
    
    protected $guarded = [];

    use SoftDeletes;

    const
        CODE_STATUS_ACTIVE = 1,
        CODE_STATUS_INACTIVE = 2
    ;

    public function scopeActive($query)
    {
        return $query->where('status', self::CODE_STATUS_ACTIVE);
    }
}
