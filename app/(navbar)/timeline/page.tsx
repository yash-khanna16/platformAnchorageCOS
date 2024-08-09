"use client";
import React, { useEffect, useState, useRef } from "react";
import { getAuthCustomer } from "@/app/actions/cookie";
import { SwipeableDrawer } from "@mui/material";
import LoginPage from "../../order/page";
import { CircularProgress } from "@mui/joy";
import Image from "next/image";
import Logo from "../../assets/favicon.png";
import { useSearchParams } from "next/navigation";
import { CheckCircle, RadioButtonUnchecked } from "@mui/icons-material";

// Define the types for the events
type Event =
  | { checkin: { Date: string; Time: string } }
  | { movement: { Date: string; Time: string } }
  | { checkOut: { Date: string; Time: string } };

// Function to parse date and time strings into Date objects
const parseDateTime = (date: string, time: string): Date | null => {
  try {
    // Convert the date from DD-MM-YYYY to YYYY-MM-DD format
    const [day, month, year] = date.split("-");
    const formattedDate = `${year}-${month}-${day}`;
    const dateTimeString = `${formattedDate}T${time}:00`; // Add seconds if needed
    return new Date(dateTimeString);
  } catch (error) {
    console.error("Error parsing date and time:", error);
    return null;
  }
};

// Function to format Date object into 'DD/MM/YYYY' and 'HH:mm'
const formatDate = (date: Date): { date: string; time: string } => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`,
  };
};

function Timeline() {
  const [placeOrderModal, setPlaceOrderModal] = useState(false);
  const [skeleton, setSkeleton] = useState(false);
  const params = useSearchParams();
  const room = params.get("room");

  const dataFetchedRef = useRef(false);
  useEffect(() => {
    const fetchAuthCustomer = async () => {
      const auth = await getAuthCustomer();
      if (auth && !dataFetchedRef.current) {
        dataFetchedRef.current = true;
        setSkeleton(false);
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
      } else {
        setPlaceOrderModal(true);
      }
    };

    if (!placeOrderModal && !dataFetchedRef.current) {
      fetchAuthCustomer();
    }
  }, [placeOrderModal]);

  const data: Event[] = [
    { checkin: { Date: "08-08-2024", Time: "04:45" } },
    { movement: { Date: "09-08-2024", Time: "23:45" } },
    { movement: { Date: "10-08-2024", Time: "14:45" } },
    { checkOut: { Date: "11-08-2024", Time: "22:45" } },
  ];

  const currentTime = new Date();

  return (
    <div className="font-montserrat">
      <div className="sticky top-0 z-50 bg-white shadow-lg">
        <div className="flex justify-between mb-1 pt-4 p-2 items-center">
          <Image src={Logo} alt="Logo" width={36} height={36} />
          <div className="text-red-500 border p-1 rounded-2xl px-2 text-sm font-medium border-red-500">
            Room: {room}
          </div>
        </div>
      </div>
      {!skeleton ? (
        <>
          <div className="text-center text-3xl font-medium mt-4 mb-2">Timeline</div>
          <div className="flex items-center flex-col">
            {data.map((event, index) => {
              let eventDateTime: Date | null = null;
              let eventLabel = "";
              let Icon = RadioButtonUnchecked;

              if ("checkin" in event) {
                eventDateTime = parseDateTime(event.checkin.Date, event.checkin.Time);
                eventLabel = "Check In";
                Icon = CheckCircle;
              } else if ("movement" in event) {
                eventDateTime = parseDateTime(event.movement.Date, event.movement.Time);
                eventLabel = "Movement";
                Icon = RadioButtonUnchecked; // Example, update if needed
              } else if ("checkOut" in event) {
                eventDateTime = parseDateTime(event.checkOut.Date, event.checkOut.Time);
                eventLabel = "Check Out";
                Icon = RadioButtonUnchecked;
              }

              // Check if eventDateTime is valid
              const isValidDate = eventDateTime !== null && !isNaN(eventDateTime.getTime());

              

              return (
                <React.Fragment key={index}>
                  {index>0 ? ( eventDateTime && currentTime > eventDateTime ?(
                    <div className="w-[4px] h-9 bg-green-600 mx-auto scale-y-[350%]"></div>
                  ):(<div className="w-[4px] h-9 bg-gray-300 mx-auto scale-y-[350%]"></div>)):null}
                  <div
                    className={`text-[#7a7a7a] my-2 gap-x-2 flex z-10 relative bg-white border p-3 rounded-lg`}
                  >
                    <div className="my-auto">
                      {isValidDate && eventDateTime && currentTime > eventDateTime ? (
                        <CheckCircle className="z-10 text-green-600" />
                      ) : (
                        <RadioButtonUnchecked className="z-10 text-[#7a7a7a]" />
                      )}
                    </div>
                    <div>
                      <div className="text-xl text-red-500">{eventLabel}</div>
                      <div className="text-sm">
                        <div>
                          Date:{" "}
                          <span className="text-red-500">
                            {isValidDate && eventDateTime
                              ? formatDate(eventDateTime).date
                              : "Invalid Date"}
                          </span>
                        </div>
                        <div>
                          Time:{" "}
                          <span className="text-red-500">
                            {isValidDate && eventDateTime
                              ? formatDate(eventDateTime).time
                              : "Invalid Time"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </>
      ) : (
        <div className="h-screen flex justify-center items-center">
          <CircularProgress />
        </div>
      )}

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
    </div>
  );
}

export default Timeline;
