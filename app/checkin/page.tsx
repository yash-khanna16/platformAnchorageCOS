"use client";
import Logo from "../favicon.png";
import Image from "next/image";
import EnterRoomNo from "./EnterRoomNo";
import { useState, useEffect } from "react";
import SelectGuestDetails from "./SelectGuestDetails";
import { ArrowBack } from "@mui/icons-material";
import { LinearProgress } from "@mui/joy";
import UploadDocument from "./UploadDocument";
import Confirmation from "./Confirmation";
import { allBookingData } from "@/app/actions/api";

export type BookingDataType = {
  booking_id: string;
  checkin: string;
  checkout: string;
  guest_email: string;
  meal_veg: number;
  meal_non_veg: number;
  remarks: string;
  additional_info: string;
  room: string;
  breakfast: number;
  document_url: string;
  name: string;
  phone: string;
  company: string;
  vessel: string;
  rank: string;
  id: string;
};

export default function Page() {
  const [step, setStep] = useState<number>(4);
  const [room, setRoom] = useState("");
  const [bookingData, setBookingData] = useState<BookingDataType[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingDataType>({
    booking_id: "",
    checkin: "",
    checkout: "",
    guest_email: "",
    meal_veg: 0,
    meal_non_veg: 0,
    remarks: "",
    additional_info: "",
    room: "",
    breakfast: 0,
    document_url: "",
    name: "",
    phone: "",
    company: "",
    vessel: "",
    rank: "",
    id: "",
  });

  useEffect(()=>{
    console.log(selectedBooking)
  },[selectedBooking])

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getGuestData = async () => {
      const guestData: BookingDataType[] = await allBookingData(room);
      const transformedData: BookingDataType[] = guestData.map((data: BookingDataType) => {
        if(data.guest_email.includes('@chotahaathi.com')){
          data.guest_email="";
        }
        return {
          ...data,
          checkin: data.checkin.split("T")[0],
          checkout: data.checkout.split("T")[0],
          
        };
      });
      setBookingData(transformedData);
      setLoading(false);
    };
    if (room !== "" && step == 2) {
      setLoading(true);
      getGuestData();
    }
  }, [room, step]);
  const stepNames = ["Check in", "Who's checking in?", "Upload Documents", "Confirmation"];
  const steps = 3;
  return step < 4 ? (
    <>
      <div className="font-montserrat text-[#141414]">
        <div className="header font-semibold w-full pb-10 border-b p-4 h-12 text-xl">
          <div className="inline  ">
            {step === 1 || step === 4 ? (
              <Image
                alt="Anchorage"
                src={Logo.src}
                height={30}
                width={30}
                className="mr-4 inline"
              />
            ) : (
              <span
                onClick={() => {
                  setStep(step - 1);
                }}
              >
                <ArrowBack className="mr-4" />
              </span>
            )}
            {stepNames[step - 1]}
          </div>
        </div>
        {step < 4 && (
          <div className="mt-6 mx-4">
            <LinearProgress size="lg" color="danger" determinate value={(step / steps) * 100} />
            <div className="my-3 font-medium text-red-600">
              Step {step} of {steps}
            </div>
          </div>
        )}
        {step === 1 && <EnterRoomNo step={step} room={room} setRoom={setRoom} setStep={setStep} />}
        {step === 2 && (
          <SelectGuestDetails
            step={step}
            setStep={setStep}
            room={room}
            bookingData={bookingData}
            loading={loading}
            setSelectedBooking={setSelectedBooking}
            selectedBooking={selectedBooking}
          />
        )}
        {step === 3 && <UploadDocument step={step} room={room} setStep={setStep} setSelectedBooking={setSelectedBooking}
            selectedBooking={selectedBooking} />}
      </div>
    </>
  ) : (
    <Confirmation selectedBooking={selectedBooking} />
  );
}
