import { Field, Label, Input, Button } from "@headlessui/react";
import { useSearchParams } from "next/navigation";
import React, { SetStateAction, useEffect, useState } from "react";
import { fetchBookingByRoom, sendOTPByEmail } from "../actions/api";
import { CircularProgress, Snackbar } from "@mui/joy";
import { Close, Info } from "@mui/icons-material";
import { setAuthCustomer } from "../actions/cookie";
import { createToken } from "../actions/util";

type Booking = {
  booking_id: string;
  checkin: string;
  checkout: string;
  guest_email: string;
  remarks: string;
  room: string;
};

function EnterEmail({
  step,
  setStep,
  email,
  setEmail,
  setPlaceOrderModal,
}: {
  step: number;
  setStep: React.Dispatch<SetStateAction<number>>;
  email: string;
  setEmail: React.Dispatch<SetStateAction<string>>;
  setPlaceOrderModal: React.Dispatch<SetStateAction<boolean>>;
}) {
  const params = useSearchParams();
  const room = params.get("room");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    const emails = bookings.map((booking: any) => booking.guest_email.toLowerCase());
    if (emails.includes(email.toLowerCase())) {
      console.log("email: ", email.toLowerCase());
      const booking = bookings.find((booking) => booking.guest_email.toLowerCase() === email.toLowerCase());
      if (booking) {
        const token = await createToken(booking, "2h");
        setAuthCustomer(token);
        setPlaceOrderModal(false);
      }
    } else {
      console.log(bookings);
      if (bookings.length === 0) {
        setError("No active bookings found for this room");
      } else {
        setError("Email not found");
      }
    }
  };

  useEffect(() => {
    if (room) {
      setLoading(true);
      fetchBookingByRoom(room)
        .then((bookings) => {
          setLoading(false)
          setBookings(bookings);
        })
        .catch((error) => {
          setLoading(false)
          console.log(`Error fetching bookings for room ${room} `, error);
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
            disabled={loading}
            className="w-full rounded-3xl disabled:bg-red-700 px-5 flex items-center justify-center gap-x-3 data-[focus]:bg-red-600 transition-all data-[active]:bg-red-600 data-[hover]:bg-red-600 bg-red-600 text-white py-4"
          >
            {loading && <CircularProgress color="danger" size="sm" />}
            {!loading && 'Next'}
          </Button>
        </Field>
      </form>
      {/* <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop> */}
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
