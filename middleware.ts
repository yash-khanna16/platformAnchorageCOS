import { NextRequest, NextResponse } from "next/server";
import { getAuthCustomer } from "./app/actions/cookie";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const auth = await getAuthCustomer();
  const roomParam = req.nextUrl.searchParams.get("room");  

  if (auth?.room) {
    if (path === "/") {
      const newUrl = new URL(req.nextUrl.origin + "/home");
      newUrl.searchParams.set("room", auth.room as string);
      return NextResponse.redirect(newUrl);
    }

    if (!roomParam || roomParam !== auth.room) {
      const newUrl = new URL(req.nextUrl.toString());
      newUrl.searchParams.set("room", auth.room as string);
      return NextResponse.redirect(newUrl);
    }
  }

  return NextResponse.next();
}
