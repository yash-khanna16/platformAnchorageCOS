import { LocalizationProvider, TimeClock } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useState, SetStateAction } from "react";

type ScheduleType = {
  date: string;
  time: string;
};

function ScheduleTime({
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
  const [focusPart, setFocusPart] = useState<"hour" | "minute">("hour");
  const isToday = dayjs(scheduleData.date).isSame(dayjs(), "day");
  const isLastDate = dayjs(checkOut.split("T")[0]).isSame(scheduleData.date);
  const maxAllowedTime = isLastDate
    ? dayjs(`${scheduleData.date}T${checkOut.split("T")[1]}`).subtract(5, 'hours').subtract(30, 'minutes')
    : undefined;
  const minAllowedTime = isToday ? dayjs().startOf("minute") : undefined;
  const handleTimeChange = (newValue: dayjs.Dayjs | null) => {
    if (newValue) {
      const oldTime = dayjs(scheduleData.time, "HH:mm");
      const hourDifference = Math.abs(newValue.hour() - oldTime.hour());
      const isAmPmToggle = hourDifference === 12;

      if (!isAmPmToggle && newValue.hour() !== oldTime.hour()) {
        setFocusPart("minute");
      }
      setScheduleData({
        ...scheduleData,
        time: newValue.format("HH:mm"),
      });
    }
  };

  return (
    <div>
      <div className="text-red-500 font-medium text-lg">Select schedule time for your order:</div>
      <div className="text-red-500 font-medium">
        Selected Date:{" "}
        <span className="text-gray-500 font-medium">
          {scheduleData.date === ""
            ? "Nothing Selected"
            : dayjs(scheduleData.date).format("DD MMMM YYYY")}
        </span>
      </div>
      <div className="flex text-2xl justify-center gap-1 mt-3">
        <div
          className="bg-gray-200  p-1 px-3 flex items-center rounded-2xl cursor-pointer"
          onClick={() => setFocusPart("hour")} // Set focus to hour
        >
          {scheduleData.time.split(":")[0]}
        </div>
        <div className="p-2 flex items-center">:</div>
        <div
          className="bg-gray-200  px-3 p-1 flex items-center rounded-2xl cursor-pointer"
          onClick={() => setFocusPart("minute")} // Set focus to minute
        >
          {scheduleData.time.split(":")[1]}
        </div>
      </div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div style={{ maxWidth: "90vw", margin: "auto" }}>
          <TimeClock
            ampmInClock={true}
            value={dayjs(scheduleData.time, "HH:mm")}
            onChange={handleTimeChange}
            minTime={minAllowedTime}
            maxTime={maxAllowedTime}
            sx={{
              width: "100%",
              height: "auto",
            }}
            // Focus changes based on the selected part
            view={focusPart === "hour" ? "hours" : "minutes"}
          />
        </div>
      </LocalizationProvider>
      <div className="flex justify-between mb-2">
        <button
          onClick={() => {
            setStep(0);
          }}
          className="p-2 font-medium bg-red-100 border px-5 border-red-500 text-red-500 rounded-full"
        >
          Back
        </button>
        <button
          onClick={() => {
            setStep(2);
          }}
          className="p-2 font-medium bg-red-100 border px-5 border-red-500 text-red-500 rounded-full"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ScheduleTime;
