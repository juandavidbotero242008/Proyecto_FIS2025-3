import { NextResponse, type NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

// Comprobación optimista: redirige según exista o no una sesión válida.
// La autorización real se hace en la DAL (src/lib/dal.ts).
const protectedPrefixes = ["/dashboard", "/transactions", "/insights", "/goals", "/budgets", "/settings"];
const authRoutes = ["/login", "/register"];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((p) => path.startsWith(p));
  const isAuthRoute = authRoutes.includes(path);

  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);

  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if ((isAuthRoute || path === "/") && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|svg|ico|webp)$).*)"],
};
