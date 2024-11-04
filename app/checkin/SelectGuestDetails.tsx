import { ArrowBack } from "@mui/icons-material";
import { Checkbox, Input } from "@mui/joy";
import React from "react";

export default function SelectGuestDetails({
  step,
  setStep,
  room
}: {
  step: number;
  room: string;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className="m-4">
      <div className="font-semibold text-lg text-slate-700">Only two steps left! <span className="text-red-600 font-bold">Select your details</span> to unlock a surprise offer!</div>
      {/* <div className="font-semibold text-xl ">Select your Details</div> */}
      <div className="my-2">
        {[1].map((e) => (
          <div key={e} className=" pt-4 py-3 border-dashed border-b-2">
            <div className=" text-lg text-slate-800 font-semibold flex  justify-between items-center">
              <div> Deepak Pandey</div>{" "}
              <div>
                {" "}
                <Checkbox size="lg" color="danger" />{" "}
              </div>{" "}
            </div>
            <div className="grid grid-cols-2 gap-x-2 my-2 text-slate-600">
              <div className="text-sm my-2 inline-flex gap-x-3">
                <div className="font-semibold"> Rank</div> AB
              </div>
              <div className="text-sm my-2 inline-flex gap-x-3">
                <div className="font-semibold"> Company</div> ANGLO
              </div>
              <div className="text-sm my-2 inline-flex gap-x-2">
                <div className="font-semibold">Check In</div> 20 Oct 2024 11:30
              </div>
              <div className="text-sm my-2 inline-flex gap-x-2">
                <div className="font-semibold">Check Out</div> 30 Nov 2024 23:00
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-x-2">
        <button
          onClick={() => {
            setStep(step - 1);
          }}
          className="my-6 w-full inline-flex justify-center space-x-2 disabled:bg-gray-300 disabled:text-gray-400 text-red-500 border-red-500 border rounded-2xl font-semibold p-4 text-center bg-white"
        >
          <ArrowBack fontSize="medium" className="" />
          <div>Back</div>
        </button>
        <button
          onClick={() => {
            setStep(step + 1);
          }}
          className="my-6 w-full disabled:bg-gray-300 disabled:text-gray-400 text-white rounded-2xl font-semibold p-4 text-center bg-red-500"
        >
          Next
        </button>
      </div>
    </div>
  );
}
