import { NextRequest, NextResponse } from "next/server";

// Route này chạy trên server (Vercel), nên đọc được IP thật của khách qua
// header x-forwarded-for — đáng tin cậy hơn nhiều so với gọi ipapi.co từ
// trình duyệt (dễ bị ad-blocker / trình duyệt chặn, và lộ luôn IP người
// dùng ra cho một bên thứ ba trực tiếp từ client).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page, referrer, user_agent, device_type } = body || {};

    if (!page) {
      return NextResponse.json({ error: "Thiếu 'page'" }, { status: 400 });
    }

    // Vercel tự thêm header này với địa chỉ IP thật của khách truy cập.
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    let country = "unknown";
    let city = "unknown";

    // Vercel cũng tự đính kèm geo header sẵn (miễn phí, không cần gọi ra ngoài).
    const geoCountry = req.headers.get("x-vercel-ip-country");
    const geoCity = req.headers.get("x-vercel-ip-city");
    if (geoCountry) country = geoCountry;
    if (geoCity) city = decodeURIComponent(geoCity);

    // Fallback: nếu không chạy trên Vercel (geo header trống) và có IP hợp lệ,
    // thử tra cứu qua ipapi.co từ server (không bị ad-blocker chặn vì server-to-server).
    if ((country === "unknown" || city === "unknown") && ip !== "unknown") {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
          signal: AbortSignal.timeout(2500),
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          country = geoData.country_name || country;
          city = geoData.city || city;
        }
      } catch {
        // Bỏ qua, giữ giá trị 'unknown' — không để lỗi geo làm hỏng việc ghi log.
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase chưa được cấu hình trên server" }, { status: 500 });
    }

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/visitors`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        page,
        referrer: referrer || null,
        user_agent: user_agent || req.headers.get("user-agent") || "unknown",
        ip_address: ip,
        country,
        city,
        device_type: device_type || "desktop",
      }),
    });

    if (!insertRes.ok) {
      const text = await insertRes.text();
      return NextResponse.json({ error: text || "Ghi visitor thất bại" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Lỗi không xác định" }, { status: 500 });
  }
}