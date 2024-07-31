"use client"
import { Home, LocalLaundryService, Search, History, AccountCircle, Fastfood } from "@mui/icons-material";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function Navbar() {
  const pathname = usePathname();
  const path = pathname.split("/")[1];
  const selected = path === 'home'?0:path==='history'?1:2;
  const router = useRouter()

  const options = [
    { icon: <Fastfood fontSize="medium" sx={{ color: selected === 0 ? '#000000' : '#737373' }} />, title: 'F & B ', url: '/home' },
    { icon: <History fontSize="medium" sx={{ color: selected === 1 ? '#000000' : '#737373' }} />, title: 'Orders', url: '/history' },
    { icon: <AccountCircle fontSize="medium" sx={{ color: selected === 2 ? '#000000' : '#737373' }} />, title: 'Account', url: '/account' },
  ];

  return (
    <div className="fixed justify-center cursor-pointer h-16  flex border-t gap-2 bottom-0 w-full  bg-white shadow-2xl">
      {options.map((option, index) => (
        <div
        onClick={()=>{router.push(option.url)}}
          key={index}
          className={`flex flex-col w-full justify-center hover:bg-gray-100 items-center px-4 py-2 gap-1 ${
            index === selected ? 'text-[#000000]' : 'text-[#737373]'
          }`}
        >
          <div className="flex justify-center items-center">
            {option.icon}
          </div>
          <div className={`text-sm font-medium ${index === selected ? 'text-[#000000]' : 'text-[#737373]'}`}>
            {option.title}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Navbar;
