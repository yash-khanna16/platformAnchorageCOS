import { Button, Field, Input, Label } from "@headlessui/react";
import { Backdrop, CircularProgress } from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import { sendOTPByEmail, verifyOTP } from "../actions/api";
import { Snackbar } from "@mui/joy";
import { Close, Info } from "@mui/icons-material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { setAuthCustomer } from "../actions/cookie";

function VerifyOTP({ email,setPlaceOrderModal }: { email: string,setPlaceOrderModal:React.Dispatch<React.SetStateAction<boolean>> }) {
  const [otp, setOTP] = useState<string[]>(new Array(6).fill(""));
  const [error, setError] = useState("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(59);
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text");
    if (/^\d{6}$/.test(paste)) {
      const newOTP = paste.split("");
      setOTP(newOTP);
      newOTP.forEach((value, index) => {
        if (inputRefs.current[index]) {
          inputRefs.current[index]!.value = value;
        }
      });
      inputRefs.current[5]?.focus();
      handleSubmit(newOTP.join(""));
      e.preventDefault();
    }
  };

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const values = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const newOTP = [...otp];
    if (values.includes(value)) {
      newOTP[index] = value.length > 0 ? value[value.length - 1] : "";
      setOTP(newOTP);
    }

    if (value) {
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (newOTP.every((num) => num !== "")) {
      handleSubmit(newOTP.join(""));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOTP = [...otp];
      if (otp[index]) {
        newOTP[index] = "";
      } else if (index > 0) {
        newOTP[index - 1] = "";
        inputRefs.current[index - 1]?.focus();
      }
      setOTP(newOTP);
    }
  };

  const handleSubmit = async (enteredOTP: string) => {
    console.log("OTP Submitted:", enteredOTP);
    try {
      setLoading(true);
      const res = await verifyOTP(email, enteredOTP);
      if (res.token) {
        setAuthCustomer(res.token);
        setPlaceOrderModal(false);
        setLoading(false);
      }
      else{
        setAlert(true);
        setMessage(res.message);
        setLoading(false);
      }
    } catch (error) {
      setAlert(true);
      setMessage("Something went wrong! Please try again later");
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      const res = await sendOTPByEmail(email);
      console.log("res: ", res);
      //   if (res.message.startsWith("Please try again")) {
      //     setCounter(res.message.split(" ")[4].);
      //   }
      setCounter(60);
      setAlert(true);
      setMessage(res.message);
    } catch (error) {
      console.log("Error resending OTP ", error);
      setAlert(true);
      setMessage("Something went wrong! Please try again later");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((prevCounter) => (prevCounter > 0 ? prevCounter - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(otp.join(""));
          }}
        >
          <Field className="mx-4 my-8">
            <Label className="text-3xl font-bold">Enter OTP </Label>
            <div className="mt-5">
              <div className="text-sm text-center my-1 mx-2">We have sent a verification code to</div>
              <div className="text-sm text-center my-1 font-semibold mx-2">{email}</div>
            </div>
            <div className="my-5">
              <div className="flex gap-x-2 my-5 justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    type="number"
                    maxLength={1}
                    value={digit}
                    autoFocus={index === 0}
                    onPaste={handlePaste} // Added onPaste handler
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => {
                      inputRefs.current[index] = el as HTMLInputElement;
                    }}
                    className="w-14 p-4 border border-[#c0c0c0] focus:outline-slate-800 rounded-xl text-center"
                  />
                ))}
              </div>
            </div>
            {error.length !== 0 && <Label className="text-sm text-red-600 my-3 mx-2">{error}</Label>}
            <div className="text-center space-x-2">
              <span className="font-semibold text-sm">{"Didn't"} get OTP?</span>
              {counter !== 0 && <span className="text-sm font-semibold text-slate-800">Resend OTP in {formatTime(counter)}</span>}
              {counter === 0 && (
                <span onClick={resendOTP} className="text-sm cursor-pointer font-semibold hover:underline text-slate-800">
                  Resend OTP
                </span>
              )}
            </div>
          </Field>
        </form>
      </div>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Snackbar
        open={alert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={5000}
        // color="danger"
        onClose={() => {
          setAlert(false);
        }}
      >
        <div className="flex justify-between w-full">
          <div>
            <Info /> {message}
          </div>
          <div onClick={() => setAlert(false)} className="cursor-pointer hover:bg-[#f3eded]">
            <Close />
          </div>
        </div>
      </Snackbar>
    </>
  );
}

export default VerifyOTP;
