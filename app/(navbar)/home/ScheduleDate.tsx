import React, { SetStateAction, useState } from "react";
import { LocalizationProvider, DateCalendar } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Snackbar } from "@mui/joy";
import { Close, Info } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/en"; // Ensure the correct locale is loaded

type ScheduleType = {
  date: string;
  time: string;
};

function ScheduleDate({
  scheduleData,
  setScheduleData,
  setStep,
  checkOut,
}: {
  scheduleData: ScheduleType;
  setScheduleData: React.Dispatch<SetStateAction<ScheduleType>>;
  setStep: React.Dispatch<SetStateAction<number>>;
  checkOut: string;
}) {
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <>
      <div className="text-red-500 font-medium text-lg">Select schedule date for your order:</div>
      <div className="text-red-500 font-medium">
        Selected Date:{" "}
        <span className="text-gray-500 font-medium">
          {scheduleData.date === ""
            ? "Nothing Selected"
            : dayjs(scheduleData.date).format("DD MMMM YYYY")}
        </span>
      </div>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          disablePast
          maxDate={dayjs(checkOut.split("T")[0])}
          onChange={(newValue: Dayjs | null) => {
            setScheduleData({
              ...scheduleData,
              date: newValue?.format("YYYY-MM-DD") || "",
            });
          }}
        />
      </LocalizationProvider>
      <button
        onClick={() => {
          if (scheduleData.date) {
            setStep(1);
          } else {
            setMessage("Choose a date to continue");
            setAlert(true);
          }
        }}
        className=" p-2 mb-2 font-medium bg-red-100 border px-5 border-red-500 text-red-500 rounded-full"
      >
        Confirm Date
      </button>

      <Snackbar
        sx={{ zIndex: "10" }}
        open={alert}
        autoHideDuration={5000}
        onClose={() => {
          setAlert(false);
        }}
      >
        <div className="flex justify-between w-full">
          <div>
            <Info />
            {message}
          </div>
          <div onClick={() => setAlert(false)} className="cursor-pointer hover:bg-[#f3eded]">
            <Close />
          </div>
        </div>
      </Snackbar>
    </>
  );
}

export default ScheduleDate;
