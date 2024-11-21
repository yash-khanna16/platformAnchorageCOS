import dayjs from "dayjs";
import React, { SetStateAction } from "react";
import Lottie from "lottie-react";
import animationData from "../../assets/tick.json";
import { CircularProgress } from "@mui/joy";

type ScheduleType = {
  date: string;
  time: string;
};

function Confirmation({
  scheduleData,
  setStep,
  handleScheduleSubmit,
  loading,
}: {
  scheduleData: ScheduleType;
  setStep: React.Dispatch<SetStateAction<number>>;
  handleScheduleSubmit: () => void;
  loading: boolean;
}) {
  return (
    <div>
      <div className="flex flex-col h-32 items-center overflow-hidden ">
        <Lottie className="h-full scale-150" animationData={animationData} loop={false} />
      </div>
      <div className="text-red-500 font-medium text-lg">
        Please confirm the date and time entered
      </div>
      <div>
        <div className="text-red-500 font-medium">
          Selected Date:{" "}
          <span className="text-gray-500 font-medium">
            {scheduleData.date === ""
              ? "Nothing Selected"
              : dayjs(scheduleData.date).format("DD MMMM YYYY")}
          </span>
        </div>
        <div className="text-red-500 font-medium">
          Selected Time:{" "}
          <span className="text-gray-500 font-medium">
          {scheduleData.time}
          </span>
        </div>
        <div className="flex justify-between mt-5">
          <button
            onClick={() => {
              setStep(1);
            }}
            className="p-2 font-medium bg-red-100 border px-5 border-red-500 text-red-500 rounded-full"
          >
            Edit
          </button>
          <button
            onClick={() => {
              handleScheduleSubmit();
            }}
            className="p-2 font-medium flex items-center  bg-red-100 border px-5 border-red-500 text-red-500 rounded-full"
          >
            {loading && <CircularProgress color="danger" size="sm" />}
            <span className="ml-2">Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Confirmation;
