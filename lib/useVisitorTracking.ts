import { useEffect, useRef } from 'react';

export function useVisitorTracking(pathname: string | null) {
    // Tránh gửi trùng 2 lần cho cùng 1 trang khi React StrictMode chạy effect 2 lần ở dev.
    const lastTracked = useRef<string | null>(null);

    useEffect(() => {
        if (!pathname) return; // null = đang ở route bị bỏ qua (admin)
        if (lastTracked.current === pathname) return;
        lastTracked.current = pathname;

        const trackVisit = async () => {
            try {
                const referrer = document.referrer;
                const userAgent = navigator.userAgent;

                // Get device type
                const deviceType = /mobile|android|iphone|ipad|phone/i.test(userAgent) ? 'mobile' : 'desktop';

                // Gửi qua API route phía server — IP thật lấy từ header
                // x-forwarded-for của Vercel, không phụ thuộc dịch vụ ngoài
                // hay bị ad-blocker chặn như khi gọi thẳng từ trình duyệt.
                const response = await fetch('/api/track-visit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        page: pathname,
                        referrer: referrer || null,
                        user_agent: userAgent,
                        device_type: deviceType,
                    }),
                });
                if (!response.ok) {
                    const data = await response.json().catch(() => null);
                    console.error('[Tracking] Không ghi được lượt truy cập:', data?.error || response.statusText);
                }
            } catch (error) {
                // Silently fail - tracking errors shouldn't break the app
                console.error('Tracking error:', error);
            }
        };

        trackVisit();
    }, [pathname]);
}