"use client";
import { Home, LocalLaundryService, Search, History, AccountCircle, Fastfood } from "@mui/icons-material";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function Navbar() {
  const pathname = usePathname();
  const path = pathname.split("/")[1];
  const selected = path === "home" ? 0 : path === "history" ? 1 : 2;
  const router = useRouter();
  const searchParams = useSearchParams();

  const options = [
    {
      icon: <Fastfood className="text-[18px]" sx={{ color: selected === 0 ? "text-red-600" : "#737373" }} />,
      title: "Food  ",
      url: "/home",
    },
    {
      icon: <History className="text-[18px]" sx={{ color: selected === 1 ? "text-red-600" : "#737373" }} />,
      title: "Orders",
      url: "/history",
    },
    {
      icon: <AccountCircle className="text-[18px]" sx={{ color: selected === 2 ? "text-red-600" : "#737373" }} />,
      title: "Account",
      url: "/account",
    },
  ];

  const handleNavigation = (url: string) => {
    const query = searchParams.toString();
    const newUrl = query ? `${url}?${query}` : url;
    router.push(newUrl);
  };

  return (
    <div className="fixed font-montserrat justify-center  cursor-pointer h-16 flex  gap-2 bottom-0 w-full  bg-white shadow-inner border-t">
      {options.map((option, index) => (
        <div
          onClick={()=>{handleNavigation(option.url)}}
          key={index}
          className={`flex  relative flex-col w-full  justify-center items-center px-4 py-2 gap-1 ${
            index === selected ? "text-red-600  border-t-red-600" : "text-[#737373]"
          }`}
        >
          {index === selected && <div className="h-1 absolute top-0  rounded-b-full w-[70%] bg-red-500  "></div>}
          <div className="flex justify-center items-center">{option.icon}</div>
          <div className={`text-xs font-semibold ${index === selected ? "text-red-600" : "text-[#737373]"}`}>{option.title}</div>
        </div>
      ))}
    </div>
  );
}

export default Navbar;
