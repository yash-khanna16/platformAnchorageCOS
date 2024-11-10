import { ArrowBack, Close, Info } from "@mui/icons-material";
import { Checkbox, Snackbar } from "@mui/joy";
import { useState } from "react";
import React from "react";

type BookingDataType = {
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

const emptyBooking: BookingDataType = {
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
};

export default function SelectGuestDetails({
  step,
  setStep,
  bookingData,
  loading,
  setSelectedBooking,
  selectedBooking,
  room
}: {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  bookingData: BookingDataType[];
  loading: boolean;
  setSelectedBooking: React.Dispatch<React.SetStateAction<BookingDataType>>;
  selectedBooking: BookingDataType;
  room: string
}) {
  const handleCheckboxChange = (data: BookingDataType) => {
    setSelectedBooking(data.booking_id === selectedBooking.booking_id ? emptyBooking : data);
  };
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <>
    <div className="m-4">
    <div className="font-semibold text-lg text-slate-700">
        Only two steps left! <span className="text-red-600 font-bold">Select your details for ROOM {room}</span> to unlock a surprise offer!
      </div>
      
      <div className="my-2">
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="pt-4 animate-pulse py-3 border-dashed border-b-2">
              <div className="flex justify-between items-center">
                <div className="h-7 rounded-xl w-36 bg-gray-200"></div>
                <div className="h-7 bg-gray-200 w-7 rounded-lg"></div>
              </div>
              <div className="grid grid-cols-2 gap-x-2 my-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 w-32 rounded-lg my-2 inline-flex"></div>
                ))}
              </div>
            </div>
          ))
        ) : bookingData.length === 0 ? (
          <div>No available booking present</div>
        ) : (
          bookingData.map((data) => (
            <div
              key={data.booking_id}
              className="pt-4 py-3 border-dashed border-b-2 cursor-pointer"
              onClick={() => handleCheckboxChange(data)}
            >
              <div className="text-lg text-slate-800 font-semibold flex justify-between items-center">
                <div className="capitalize">{data.name}</div>
                <Checkbox size="lg" color="danger" checked={selectedBooking.booking_id === data.booking_id} />
              </div>
              <div className="grid grid-cols-2 gap-x-2 my-2 text-slate-600">
                {data.rank && (
                  <div className="text-sm my-2 inline-flex gap-x-3">
                    <div className="font-semibold">Rank</div> {data.rank}
                  </div>
                )}
                {data.company && (
                  <div className="text-sm my-2 inline-flex gap-x-3">
                    <div className="font-semibold">Company</div> {data.company}
                  </div>
                )}
                {data.checkin && (
                  <div className="text-sm my-2 inline-flex gap-x-2">
                    <div className="font-semibold">Check In</div> {data.checkin}
                  </div>
                )}
                {data.checkout && (
                  <div className="text-sm my-2 inline-flex gap-x-2">
                    <div className="font-semibold">Check Out</div> {data.checkout}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-x-2">
        <button
          onClick={() => setStep(step - 1)}
          className="my-6 w-full inline-flex justify-center space-x-2 disabled:bg-gray-300 disabled:text-gray-400 text-red-500 border-red-500 border rounded-2xl font-semibold p-4 text-center bg-white"
        >
          <ArrowBack fontSize="medium" />
          <div>Back</div>
        </button>
        <button
          onClick={() => {
            if (selectedBooking.booking_id) {
              setStep(step + 1);
            } else {
              setAlert(true);
              setMessage("Please select a booking to continue");
            }
          }}
          
          className="my-6 w-full disabled:bg-gray-300 disabled:text-gray-400 text-white rounded-2xl font-semibold p-4 text-center bg-red-500"
        >
          Next
        </button>
      </div>
    </div>
    <Snackbar
    open={alert}
    autoHideDuration={5000}
    // color="danger"
    onClose={() => {
      setAlert(false);
    }}
  >
    <div className="flex justify-between w-full ">
      <div>
        <Info className="mr-3" />
        {message}
      </div>
      <div onClick={() => setAlert(false)} className="cursor-pointer hover:bg-[#f3eded]">
        <Close  className="ml-1" />
      </div>
    </div>
  </Snackbar>
  </>
  );
}
