<?php

namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes; 
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

use Log;
use DB;

class Customer extends Authenticatable
{
    protected $table = 'customer';
    
    protected $guarded = [];

    use SoftDeletes;
    
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
    ];

    const
        CODE_STATUS_ACTIVE = 1,
        CODE_STATUS_INACTIVE = 2
    ;

    public function scopeActive($query)
    {
        return $query->where('status', self::CODE_STATUS_ACTIVE);
    }
}
