"use client";
import Logo from "../favicon.png";
import Image from "next/image";
import EnterRoomNo from "./EnterRoomNo";
import { useState } from "react";
import SelectGuestDetails from "./SelectGuestDetails";
import { ArrowBack } from "@mui/icons-material";
import { LinearProgress } from "@mui/joy";
import UploadDocument from "./UploadDocument";
import Confirmation from "./Confirmation";

export default function Page() {
  const [step, setStep] = useState<number>(1);
  const [room, setRoom] = useState("");
  const stepNames = ["Check in", "Who's checking in?", "Upload Documents", "Confirmation"];
  const steps = 3;
  return step < 4 ? (
    <>
      <div className="font-montserrat text-[#141414]">
        <div className="header font-semibold w-full pb-10 border-b p-4 h-12 text-xl">
          <div className="inline  ">
            {step === 1 || step === 4 ? (
              <Image alt="Anchorage" src={Logo.src} height={30} width={30} className="mr-4 inline" />
            ) : (
              <span
                onClick={() => {
                  setStep(step - 1);
                }}
              >
                <ArrowBack className="mr-4" />
              </span>
            )}{" "}
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
        {step === 2 && <SelectGuestDetails step={step} room={room} setStep={setStep} />}
        {step === 3 && <UploadDocument step={step} room={room} setStep={setStep} />}
      </div>
    </>
  ) : (
    <Confirmation />
  );
}
