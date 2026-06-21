import { useEffect, useState, useRef } from 'react';
import { organismEventBus, OrganismEventType } from '../services/organismEventBus';

/**
 * Hook to automatically synchronize the calling component with organism-wide events.
 * Returns a sequential integer 'syncKey' that increments with each event, which can 
 * be used as a key or trigger to force re-render or re-fetch data.
 * 
 * @param events Optional list of specific events to list to. If omitted, listens to all events.
 * @param onEventChange Optional custom callback to trigger upon receiving an event
 */
export function useOrganismSync(
  events?: OrganismEventType[],
  onEventChange?: (event: OrganismEventType, data?: any) => void
) {
  const [syncKey, setSyncKey] = useState(0);
  
  // Stable refs to avoid infinite reactive re-subscribing loops
  const onEventChangeRef = useRef(onEventChange);
  onEventChangeRef.current = onEventChange;

  // Serialize events to array elements string to compare without array reference issues in dependency arrays
  const eventsKey = events ? events.slice().sort().join(',') : 'all';

  useEffect(() => {
    const handleEvent = (payload?: any) => {
      setSyncKey(prev => prev + 1);
      
      if (onEventChangeRef.current) {
        if (payload && typeof payload === 'object' && 'event' in payload) {
          onEventChangeRef.current(payload.event, payload.data);
        } else {
          // Fallback if direct subscription
          onEventChangeRef.current('cognitiveChanged', payload);
        }
      }
    };

    if (events && events.length > 0) {
      const unsubs = events.map(evt => 
        organismEventBus.subscribe(evt, (data) => handleEvent({ event: evt, data }))
      );
      return () => {
        unsubs.forEach(unsub => unsub());
      };
    } else {
      const unsubAll = organismEventBus.subscribeAll((evtPayload) => {
        handleEvent(evtPayload);
      });
      return () => {
        unsubAll();
      };
    }
  }, [eventsKey]);

  return syncKey;
}
