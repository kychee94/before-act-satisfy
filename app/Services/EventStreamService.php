<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class EventStreamService
{
    private const CACHE_KEY = 'sse_events';
    private const EVENT_TTL = 60; // seconds

    /**
     * Push event to cache for SSE consumption
     */
    public function pushEvent(string $eventType, array $data, ?int $userId = null): void
    {
        $event = [
            'id' => uniqid('event_', true),
            'type' => $eventType,
            'data' => $data,
            'timestamp' => now()->toISOString(),
            'userId' => $userId,
        ];
        
        // Store each event type in its own cache key
        $cacheKey = self::CACHE_KEY . ":{$eventType}";
        Cache::put($cacheKey, $event, self::EVENT_TTL);
    }

    /**
     * Get events since last check
     */
    public function getEventsSince(?string $lastEventId = null, ?int $userId = null): array
    {
        // Get all event type keys from cache
        $eventTypes = ['initial', 'order']; // Define your event types
        $events = [];
        
        foreach ($eventTypes as $type) {
            $cacheKey = self::CACHE_KEY . ":{$type}";
            $event = Cache::get($cacheKey);
            
            if ($event && 
                ($event['userId'] === null || $event['userId'] === $userId) &&
                (!$lastEventId || $event['id'] !== $lastEventId)) {
                $events[] = $event;
            }
        }
        
        return $events;
    }

    /**
     * Clear old events
     */
    public function clearEvents(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}