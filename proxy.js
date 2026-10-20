import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Hanya lindungi rute /admin, kecuali /admin/login
  const adalahRuteAdmin =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const adalahHalamanLogin = pathname === "/admin/login";

  if (!adalahRuteAdmin || adalahHalamanLogin) {
    return NextResponse.next();
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  // Buat response awal — akan di-replace jika cookie perlu di-set ulang
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Set di request supaya Server Component di bawah bisa membaca cookie terbaru
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        // Buat ulang response dengan request yang sudah diperbarui
        response = NextResponse.next({ request });

        // Set di response supaya browser menyimpan cookie baru
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getUser() memvalidasi token sesi admin dan otomatis me-refresh jika kedaluwarsa
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belum login → alihkan ke /admin/login
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export default proxy;

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
