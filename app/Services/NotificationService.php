<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

use Log;

class NotificationService
{
    public function __construct(
        private EventStreamService $eventStreamService
    ) {}

    /**
     * Get all notification counts
     */
    public function getCounts(): array
    {
        // return Cache::remember('notification_counts', 60, function () {

        //     /* =====================================================
        //      *  For event stream + pinia store.
        //         Initialization notification count upon page reload uses helper. 
        //         Files to modify:
        //         Helper. (Initial Page Reload)
        //         NotificationService.php (Event Stream)
        //      * ===================================================== */
        //     $orders = Order::whereIn('status', [
        //                                 Order::CODE_STATUS_ACTIVE,
        //                                 Order::CODE_STATUS_PROCESSING,
        //                                 Order::CODE_STATUS_SHIPPED
        //                             ])
        //                     ->count();
        //     return [
        //         'count' => $orders,
        //         'timestamp' => now()->toISOString(),
        //     ];
        // });
    }

    /**
     * Broadcast event to all admins
     */
    private function broadcastToAdmins(string $eventType, array $data): void
    {
        $this->eventStreamService->pushEvent($eventType, $data);
        $this->clearCountsCache();
    }

    /**
     * Broadcast event to specific user
     */
    private function broadcastToUser(int $userId, string $eventType, array $data): void
    {
        $this->eventStreamService->pushEvent($eventType, $data, $userId);
    }

    /**
     * Clear counts cache
     */
    private function clearCountsCache(): void
    {
        Cache::forget('notification_counts');
    }

    /**
     * Broadcast order
     */
    public function broadcastOrderNotification(): void
    {
        $counts = $this->getCounts();

        $this->broadcastToAdmins('order', $counts);
    }

    /**
     * Broadcast custom notification to user
     */
    public function notifyUser(int $userId, string $title, string $message, array $data = []): void
    {
        $this->broadcastToUser($userId, 'private-notification', [
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }
}