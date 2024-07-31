import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";



export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;


  if (path === "/") {
    return NextResponse.redirect(new URL("/home",req.nextUrl));
  }
  
  return NextResponse.next();
}
