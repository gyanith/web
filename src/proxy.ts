import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const appwriteSessionCookie = `a_session_${projectId?.toLowerCase()}`;

    const session = request.cookies.get(appwriteSessionCookie);

    // ----- PROTECTED ROUTES -----
    const protectedRoutes = [
        "/residence",
        "/merch",
        "/user",
    ];

    const isProtectedBaseRoute = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // 🔒 Protect /events/tech/* but NOT /events/tech
    const isProtectedTechEvent =
        pathname.startsWith("/events/tech/");

    const isProtected = isProtectedBaseRoute || isProtectedTechEvent;

    if (isProtected && !session) {
        const loginUrl = new URL("/auth", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
