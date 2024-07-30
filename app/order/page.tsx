"use client";
import { Button, Field, Input, Label } from "@headlessui/react";
import { ArrowBack } from "@mui/icons-material";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchBookingByRoom } from "../actions/api";
import EnterEmail from "./EnterEmail";
import VerifyOTP from "./VerifyOTP";

export default function Home() {
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState<string>("");

  return (
    <div className="md:w-[50vw] w-full mx-auto">
      <div className="pt-4 px-4  ">
        <Button
          onClick={() => {
            if (step > 0) {
              setStep(step - 1);
            }
          }}
          className="p-4 border border-slate-300 rounded-2xl"
        >
          <ArrowBack />
        </Button>
      </div>
      {step === 0 && <EnterEmail step={step} email={email} setEmail={setEmail} setStep={setStep} />}
      {step === 1 && <VerifyOTP email={email} />}
    </div>
  );
}
