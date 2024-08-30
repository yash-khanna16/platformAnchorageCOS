"use client";
import React, { useEffect, useState, useRef } from "react";
import { getAuthCustomer } from "@/app/actions/cookie";
import { SwipeableDrawer } from "@mui/material";
import LoginPage from "../../components/Login";
import { CircularProgress, DialogContent, DialogTitle, Modal, ModalClose, ModalDialog, Snackbar } from "@mui/joy";
import Image from "next/image";
import Logo from "../../assets/favicon.png";
import { useRouter, useSearchParams } from "next/navigation";
import { Cancel, Close, Info, LocationOn, NearMe, Place } from "@mui/icons-material";
import { fetchFeedbackCOS, fetchSchedule, insertFeedbackCOS, updateFeedback } from "@/app/actions/api";
import { star, starSmall, starUnfilled, starUnfilledSmall } from "@/app/assets/icons";
import Lottie from "lottie-react";
import animationdata from "@/app/assets/happy.json";

export type BookingInfoType = {
  additional_info: string;
  booking_id: string;
  breakfast: number;
  checkin: string; // Consider using Date if you plan to work with Date objects
  checkout: string; // Same as above
  exp: number;
  guest_email: string;
  iat: number;
  meal_non_veg: number;
  meal_veg: number;
  remarks: string;
  room: string;
};

type Event =
  | { checkin: { Date: string; pickupLocation: string } }
  | { movement: { Date: string; pickupLocation: string; dropLocation: string } }
  | { checkOut: { Date: string; pickupLocation: string } };

const convertToEventArray = (
  arr: { dateTime: string; dropLocation: string; pickUpLocation: string; type: "Checkin" | "Movement" | "Checkout" }[]
): Event[] => {
  return arr.map((item) => {
    switch (item.type) {
      case "Checkin":
        return {
          checkin: {
            Date: item.dateTime,
            pickupLocation: item.pickUpLocation,
          },
        };
      case "Movement":
        return {
          movement: {
            Date: item.dateTime,
            pickupLocation: item.pickUpLocation,
            dropLocation: item.dropLocation,
          },
        };
      case "Checkout":
        return {
          checkOut: {
            Date: item.dateTime,
            pickupLocation: item.pickUpLocation,
          },
        };
      default:
        throw new Error(`Unknown event type: ${item.type}`);
    }
  });
};

const formatDate = (date: Date): { date: string; time: string } => {
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 24-hour format to 12-hour format

  // Array of short month names
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return {
    date: `${monthNames[date.getMonth()]} ${day}, ${year}`,
    time: `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`,
  };
};

function Timeline() {
  const [placeOrderModal, setPlaceOrderModal] = useState(false);
  const [skeleton, setSkeleton] = useState(false);
  const params = useSearchParams();
  const room = params.get("room");
  const [scheduleData, setScheduleData] = useState<Event[]>([]);
  const [feedback, setFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  useEffect(() => {
    if (!room) {
      router.push("/not-found");
      console.log("room: ", room);
    }
  }, [room]);

  const dataFetchedRef = useRef(false);
  useEffect(() => {
    const fetchAuthCustomer = async () => {
      const auth = await getAuthCustomer();
      if (auth && !dataFetchedRef.current) {
        dataFetchedRef.current = true;
        setSkeleton(false);
        const res = await fetchSchedule(auth.booking_id as string);
        const feedback = (await fetchFeedbackCOS(auth.booking_id as string)) as {
          booking_id: string;
          comment: string;
          last_modified: string;
          rating: number;
          type: string;
        }[];
        if (!feedback.some((f) => f.type === "timeline")) {
          const lastClosed = localStorage.getItem("timelineFeedbackLastClosed");
          if (!lastClosed) {
            // if page is opened for first time, then add delay of 15 seconds
            delay(15000).then(() => {
              setFeedback(true);
            });
          } else {
            const shouldShowModal = Date.now() - parseInt(lastClosed) > 2 * 60 * 60 * 1000; // 2 hours
            if (shouldShowModal) setFeedback(true);
          }
        }
        setScheduleData(convertToEventArray(res));
        console.log(auth.bookingid);
      } else if (!auth) {
        setPlaceOrderModal(true);
      }
    };

    fetchAuthCustomer();
  }, []);

  useEffect(() => {
    const fetchAuthCustomer = async () => {
      const auth = await getAuthCustomer();
      if (auth) {
        setSkeleton(false);
        setPlaceOrderModal(false);
        const res = await fetchSchedule(auth.booking_id as string);
        const feedback = (await fetchFeedbackCOS(auth.booking_id as string)) as {
          booking_id: string;
          comment: string;
          last_modified: string;
          rating: number;
          type: string;
        }[];
        if (!feedback.some((f) => f.type === "timeline")) {
          const lastClosed = localStorage.getItem("timelineFeedbackLastClosed");
          if (!lastClosed) {
            // if page is opened for first time, then add delay of 15 seconds
            delay(15000).then(() => {
              setFeedback(true);
            });
          } else {
            const shouldShowModal = Date.now() - parseInt(lastClosed) > 2 * 60 * 60 * 1000; // 2 hours
            if (shouldShowModal) setFeedback(true);
          }
        }
        setScheduleData(convertToEventArray(res));
        console.log("schedule: ", res);
      } else {
        setPlaceOrderModal(true);
      }
    };

    if (!placeOrderModal && !dataFetchedRef.current) {
      fetchAuthCustomer();
    }
  }, [placeOrderModal]);

  const currentTime = new Date();

  return (
    <div className="font-montserrat bg-[#FBFAFF] max-h-full">
      <div className="sticky top-0 z-50 bg-white shadow-lg ">
        <div className="flex justify-between mb-1 pt-4 p-2 items-center">
          <Image src={Logo} alt="Logo" width={36} height={36} />
          <div className="text-red-500 border p-1 rounded-2xl px-2 text-sm font-medium border-red-500">Room: {room}</div>
        </div>
      </div>
      {!skeleton ? (
        <>
          <div className="py-2 px-5 text-gray-800 text-2xl font-medium mt-4 mb-2">Schedule</div>
          <div className="px-5">
            {scheduleData.map((event, index) => {
              let eventDateTime: Date | null = null;
              let eventLabel = "";
              let pickupLocation = "",
                dropLocation = "";
              console.log("event: ", event);
              if ("checkin" in event) {
                eventDateTime = new Date(event.checkin.Date);
                eventLabel = "Check In";
              } else if ("movement" in event) {
                pickupLocation = event.movement.pickupLocation;
                dropLocation = event.movement.dropLocation;
                eventDateTime = new Date(event.movement.Date);
                eventLabel = "Trip";
              } else if ("checkOut" in event) {
                eventDateTime = new Date(event.checkOut.Date);
                eventLabel = "Check Out";
              }
              const isValidDate = eventDateTime !== null && !isNaN(eventDateTime.getTime());
              return (
                <div key={index} className="flex my-1 gap-1 mb-3">
                  <div className="flex flex-col w-2/12">
                    {eventDateTime ? (
                      <div className=" text-sm font-semibold mb-1">
                        {eventDateTime.toLocaleString("default", { month: "short" })}
                      </div>
                    ) : null}
                    <div className=" flex items-center mb-1">
                      {isValidDate && eventDateTime && currentTime > eventDateTime ? (
                        <>
                          <div className="border-[#18C09C] bg-[#18C09C] text-white  border-2 w-7 h-7 rounded-full flex items-center justify-center p-1">
                            <span className=" text-center text-sm font-semibold ">{eventDateTime.getDate()}</span>
                          </div>
                          <div className="h-[1px] w-[25px] rounded-full ml-1 bg-[#18C09C]"></div>
                        </>
                      ) : (
                        <>
                          <div className=" border-[#62AFFF] bg-[#62AFFF] text-white  border-2 w-7 h-7 rounded-full flex items-center justify-center p-1">
                            {eventDateTime ? (
                              <span className=" text-center text-sm font-semibold  ">{eventDateTime.getDate()}</span>
                            ) : (
                              <span></span>
                            )}
                          </div>
                          <div className="h-[1px] w-[25px] rounded-full ml-2 bg-[#62AFFF]"></div>
                        </>
                      )}
                    </div>
                    <div className="h-[75%]">
                      {index < scheduleData.length - 1 ? (
                        eventDateTime && currentTime > eventDateTime ? (
                          <div className="w-[3px] h-full rounded-full ml-3  bg-[#18C09C]"></div>
                        ) : (
                          <div className="w-[3px] h-full rounded-full ml-3  bg-[#62AFFF]"></div>
                        )
                      ) : null}
                    </div>
                  </div>
                  <div className="w-10/12 py-4 px-2">
                    <div className=" px-3 py-2 flex bg-white border  rounded-2xl ">
                      <div className="w-full">
                        <div className="text-sm pt-2 mb-2 flex justify-between">
                          <span className="font-semibold">
                            {isValidDate && eventDateTime ? formatDate(eventDateTime).time : "Invalid Time"}
                          </span>
                          <div className="text-gray-800 ">
                            {isValidDate && eventDateTime ? formatDate(eventDateTime).date : "Invalid Time"}
                          </div>
                        </div>
                        <div className="text-lg mb-3 py-2 font-medium flex items-center ">
                          {eventLabel}
                          {(eventLabel === "Check In" || eventLabel === "Check Out") && (
                            <span className="text-[13px] ml-2 py-0 px-[10px] text-purple-600 font-semibold border border-purple-200 bg-purple-200 rounded-full ">
                              ROOM: {room}
                            </span>
                          )}
                        </div>
                        {/* <div className="text-sm mb-2 text-gray-500 font-medium">
                          Date -{" "}
                          <span>
                            {isValidDate && eventDateTime
                              ? formatDate(eventDateTime).date
                              : "Invalid Date"}
                          </span>
                        </div> */}
                        <div className="text-sm text-gray-500 mb-2 flex items-center font-medium">
                          {eventLabel === "Check In" || eventLabel === "Check Out" ? (
                            <>
                              <LocationOn className="text-[15px] mr-1" />
                              Anchorage
                            </>
                          ) : (
                            <div className="flex justify-between items-center w-full pr-2">
                              <div className="flex items-center">
                                <Place className="text-[15px] mr-1" /> {pickupLocation}
                              </div>
                              <div className="flex items-center">
                                <NearMe className="text-[15px] mr-1" />
                                {dropLocation}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="h-screen flex justify-center items-center">
          <CircularProgress />
        </div>
      )}

      <Modal
        open={feedback}
        onClose={() => {
          localStorage.setItem("timelineFeedbackLastClosed", Date.now().toString());
          console.log("here");
          setFeedback(false);
        }}
      >
        <ModalDialog
          sx={{
            width: "90vw",
            borderRadius: "20px",
            overflow: "hidden",
          }}
          style={{ width: "90vw" }}
        >
          <DialogTitle>Rate Timeline</DialogTitle>
          <ModalClose style={{ zIndex: "10" }} />
          <DialogContent className="h-fit">
            {!submitted && (
              <>
                <div>How was your experience with the Timeline? Please rate or share a suggestion.</div>
                <div className="my-4">
                  <div className="flex space-x-3 justify-center py-4 text-lg ">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => setRating(value)} // Set the rating state
                      >
                        {value <= rating ? starSmall : starUnfilledSmall}
                      </button>
                    ))}
                  </div>
                  <form
                    className="space-y-5 my-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      localStorage.setItem("timelineFeedbackLastClosed", Date.now().toString());
                      console.log(`response rating: ${rating} comment: ${comment} for timeline`);
                      try {
                        const user = (await getAuthCustomer()) as BookingInfoType;
                        if (user) {
                          console.log("user: ", user);
                          await insertFeedbackCOS("timeline", user?.booking_id, rating, comment);
                          setSubmitted(true);
                        }
                      } catch (error) {
                        setAlert(true);
                        setMessage("Something went wrong");
                      }
                    }}
                  >
                    {rating > 0 && (
                      <textarea
                        rows={5}
                        value={comment}
                        onChange={(e) => {
                          setComment(e.target.value);
                        }}
                        className={"w-full  border-gray-400 border-2 outline-none rounded-lg  px-3 p-2"}
                        placeholder="Leave a comment..."
                      />
                    )}
                    {rating > 0 && (
                      <button className="p-3 bg-red-500 text-white rounded-2xl w-[100%]" type="submit">
                        Submit
                      </button>
                    )}
                  </form>
                </div>
              </>
            )}
            {submitted && (
              <div className="">
                <Lottie className="h-[200px] my-auto " animationData={animationdata} loop={false} />

                <div className="text-center text-gray-600 text-lg font-medium">
                  <div>Your feedback helps us improve.</div>
                  <div>Thank you!</div>
                </div>
                <button
                  className="p-3 my-6 bg-red-500 text-white rounded-2xl w-full"
                  onClick={() => {
                    setRating(0);
                    setComment("");
                    setSubmitted(false);
                    setFeedback(false);
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </DialogContent>
        </ModalDialog>
      </Modal>

      <SwipeableDrawer
        anchor={"bottom"}
        open={placeOrderModal}
        onClose={() => {
          setPlaceOrderModal(false);
        }}
        onOpen={() => {
          setPlaceOrderModal(true);
        }}
      >
        <div className="px-4 py-2" style={{ height: "60vh" }}>
          <LoginPage setPlaceOrderModal={setPlaceOrderModal} location="timeline" />
        </div>
      </SwipeableDrawer>
      <Snackbar
        open={alert}
        autoHideDuration={5000}
        // color="danger"
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
    </div>
  );
}

export default Timeline;
