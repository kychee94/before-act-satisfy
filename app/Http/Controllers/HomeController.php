<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Helpers\Helper;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

use App\Models\Announcement;
use App\Models\CustomerAnnouncement;

use Auth;
use Log;
use Validator;
use DB;

class HomeController extends Controller
{
    // Access to route /
    public function index(Request $request)
    {
        return Inertia::render('home');
    }

    public function announcement(Request $request)
    {
        $user = auth::guard('customer')->user();

        $query = CustomerAnnouncement::select('announcement.uuid as uuid', 'announcement.title as title', 'announcement.content as content', 'customer_announcement.is_read as read', 'customer_announcement.created_at as inserted_date')
                                    ->join('announcement', 'announcement.id', '=', 'customer_announcement.announcement_id')
                                    ->where('customer_id', $user->id)
                                    ->where('is_read', false)
                                    ->where('customer_announcement.status', CustomerAnnouncement::CODE_STATUS_ACTIVE);

        if ($request->sortBy) {
            $query->orderBy($request->sortBy, $request->orderBy ?? 'desc');
        }else{
            $query->orderBy('customer_announcement.created_at', 'desc');
        }

        $totalRecords = $query->get()->count();

        $data['announcements']['data'] = $query->paginate($request->itemsPerPage ?? config('app.pagination_per_page'))
                                 ->appends($request->only(['q', 'sortBy', 'orderBy', 'itemsPerPage']))
                                 ->toArray();
        $data['announcements']['totalRecords'] = $totalRecords;

        return response()->json($data, 200);
    }

    public function announcementDetails(Request $request, $uuid)
    {
        $user = auth::guard('customer')->user();

        $announcement = Announcement::where('uuid', $uuid)
                                    ->first();

        if(!$announcement){
            return response()->json('Invalid Data', 422);
        }

        // update announcement as read
        CustomerAnnouncement::where('announcement_id', $announcement->id)
                            ->where('customer_id', $user->id)
                            ->where('is_read', false)
                            ->update(['is_read' => true]);

        // return view
        $data = [
            'title' => $announcement->title,
            'content' => $announcement->content,
        ];

        return response()->json($data, 200);
    }
}
