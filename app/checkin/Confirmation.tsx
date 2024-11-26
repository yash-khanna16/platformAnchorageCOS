import React from "react";
import animationData from "@/app/assets/tick.json";
import Lottie from "lottie-react";
import { ArrowForward, Lock } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { secureIcon } from "@/app/assets/icons";
import { BookingDataType } from "./page";
import { sendGAEvent } from "@next/third-parties/google";

export default function Confirmation({ selectedBooking }: { selectedBooking: BookingDataType }) {
  const router = useRouter();
  const restrictedCompanies = ["PERSONAL","MMT BOOKING"]
  return (
    <div className=" font-montserrat w-screen h-screen bg-white rounded-2xl mx-auto px-8  space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-3">
        <div className=" justify-center gap-3 items-center">
          <Lottie animationData={animationData} loop={false} className="h-48 w-full scale-125" />
          <h1 className="text-[28px] -mt-9 font-semibold text-gray-800">Check-In Successful!</h1>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="text-center space-y-2">
        <p className="text-gray-600">Thank you,</p>
        <p className="text-2xl font-semibold text-red-600 uppercase">{selectedBooking.name.trim()}!</p>
        <p className="text-gray-600">Your check-in is complete</p>
      </div>

      {/* Coupon Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 space-y-3">
        <p className="text-slate-500 font-medium text-center">Get a free lemonade on orders over ₹150 with the code below!</p>
        <div className="bg-white rounded-lg p-3 text-center shadow-sm">
          <span className="text-2xl font-bold tracking-wider text-red-600">CHECKIN150</span>
        </div>
        <button
          onClick={() => {
            sendGAEvent("event", "claim-checkin-coupon");
            router.push(`/home?room=${selectedBooking.room}`);
          }}
          className="w-full bg-red-600 hover:bg-red-700 text-sm text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center"
        >
          Tap here to claim your coupon
          <ArrowForward className="text-xl" />
        </button>
        {!restrictedCompanies.includes(selectedBooking.company)}
        <button
          onClick={() => {
            sendGAEvent("event", "claim-checkin-coupon");
            router.push(`/home?room=${selectedBooking.room}`);
          }}
          className="w-full text-red-600 hover:bg-red-700 text-sm bg-red-50 border border-red-600 font-semibold py-3 px-6 rounded-lg flex items-center justify-center"
        >
          Kindly book your complementary meals.
          <ArrowForward className="text-xl" />
        </button>
      </div>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 font-medium text-xs text-slate-500">
        {secureIcon}
        <p>Your document is secure and will be deleted post-verification</p>
      </div>

      {/* Dashboard Button */}
    </div>
  );
}
