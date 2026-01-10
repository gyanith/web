// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
    const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!; // https://cloud.appwrite.io

    /* =========================
       🔁 APPWRITE PROXY (/v1)
       ========================= */
    if (pathname.startsWith("/v1")) {
        return NextResponse.rewrite(
            new URL(`${appwriteEndpoint}${pathname}`)
        );
    }

    /* =========================
       🔒 AUTH PROTECTION
       ========================= */
    const sessionCookie = request.cookies.get(
        `a_session_${projectId.toLowerCase()}`
    );

    const protectedRoutes = ["/residence", "/merch", "/user"];
    const isProtected =
        protectedRoutes.some(
            (route) => pathname === route || pathname.startsWith(`${route}/`)
        ) || pathname.startsWith("/events/tech/");

    if (isProtected && !sessionCookie?.value) {
        const loginUrl = new URL("/auth", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
