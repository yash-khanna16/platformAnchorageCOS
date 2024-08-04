import { NextRequest, NextResponse } from "next/server";



export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;


  if (path === "/") {
    return NextResponse.redirect(new URL("/home?room=101",req.nextUrl));
  }
  
  return NextResponse.next();
}
