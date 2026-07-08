import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useVisitorTracking() {
    useEffect(() => {
        const trackVisit = async () => {
            try {
                // Get current page
                const page = window.location.pathname;
                const referrer = document.referrer;
                const userAgent = navigator.userAgent;

                // Get device type
                const deviceType = /mobile|android|iphone|ipad|phone/i.test(userAgent) ? 'mobile' : 'desktop';

                // Try to get IP from API (free service)
                let ipAddress = 'unknown';
                let country = 'unknown';
                let city = 'unknown';

                try {
                    const response = await fetch('https://ipapi.co/json/');
                    if (response.ok) {
                        const data = await response.json();
                        ipAddress = data.ip || 'unknown';
                        country = data.country_name || 'unknown';
                        city = data.city || 'unknown';
                    }
                } catch (error) {
                    // Silently fail - no IP needed
                }

                // Insert visitor record
                await supabase.from('visitors').insert({
                    page,
                    referrer: referrer || null,
                    user_agent: userAgent,
                    ip_address: ipAddress,
                    country,
                    city,
                    device_type: deviceType,
                });
            } catch (error) {
                // Silently fail - tracking errors shouldn't break the app
                console.error('Tracking error:', error);
            }
        };

        trackVisit();
    }, []);
}
