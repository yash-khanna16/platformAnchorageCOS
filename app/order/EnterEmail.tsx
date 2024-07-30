import { Field, Label, Input, Button } from "@headlessui/react";
import { useSearchParams } from "next/navigation";
import React, { SetStateAction, useEffect, useState } from "react";
import { fetchBookingByRoom, sendOTPByEmail } from "../actions/api";
import { Backdrop, CircularProgress } from "@mui/material";
import { Snackbar } from "@mui/joy";
import { Close, Info } from "@mui/icons-material";

function EnterEmail({
  step,
  setStep,
  email,
  setEmail,
}: {
  step: number;
  setStep: React.Dispatch<SetStateAction<number>>;
  email: string;
  setEmail: React.Dispatch<SetStateAction<string>>;
}) {
  const params = useSearchParams();
  const room = params.get("room");
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (emails.includes(email)) {
      setLoading(true);
      try {
        const res = await sendOTPByEmail(email);
        setAlert(res);
        console.log("response: ", res);
        if (res.message === "OTP Sent Successfully") {
          setStep(1);
        }
        setMessage(res.message);
      } catch (error) {
        console.log("error sending otp ", error);
      }
      setLoading(false);
    } else {
      console.log(emails);
      if (emails.length === 0) {
        setError("No active bookings found for this room");
      } else {
        setError("Email not found");
      }
    }
  };

  useEffect(() => {
    if (room) {
      fetchBookingByRoom(room).then((bookings) => {
        const data = bookings.map((booking: any) => booking.guest_email.toLowerCase());
        setEmails(data);
      });
    }
  }, []);
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Field className="mx-4 my-8">
          <Label className="text-3xl font-bold ">Enter your email</Label>
          <div className="my-5">
            <Input
              name="email"
              value={email}
              onChange={(e) => {
                setError("");
                setEmail(e.target.value);
              }}
              type="email"
              placeholder="severus@hogwarts.edu"
              className="w-full  p-4 border border-[#c0c0c0] focus:outline-slate-800  rounded-xl "
            />
            {error.length !== 0 && <Label className="text-sm text-red-600 my-3 mx-2 ">{error}</Label>}
          </div>

          <Button
            type="submit"
            className="w-full rounded-3xl px-5 data-[focus]:bg-[#d8282e] transition-all data-[active]:bg-[#d8282e] data-[hover]:bg-[#d8282e] bg-[#EB2930] text-white py-4"
          >
            Next
          </Button>
        </Field>
      </form>
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
    </div>
  );
}

export default EnterEmail;
