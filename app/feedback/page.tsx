"use client";
import React, { useEffect, useState } from "react";
import { star, starUnfilled } from "../assets/icons";
import { Textarea } from "@headlessui/react";
import Lottie from "lottie-react";
import animationData from "../assets/happy.json";
import { fetchFeedbackCOS, insertFeedbackCOS } from "../actions/api";
import { CircularProgress, Snackbar } from "@mui/joy";
import { Close, Info } from "@mui/icons-material";

function Feedback({ searchParams }: { searchParams: { booking_id?: string } }) {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.booking_id) {
      fetchFeedbackCOS(searchParams.booking_id)
        .then((feedback) => {
          setLoading(false);
          if (feedback.length > 0) {
            setSubmitted(true);
          }
        })
        .catch((error) => {
          console.log("error fetching feedback: ", error);
          setLoading(false);
        });
    }
  }, []);

  // const params = useParams<{ tag: string; item: string }>()

  // console.log("booking id ", booking_id)

  return (
    <div>
      {loading && (
        <div className="w-screen h-screen flex justify-center items-center">
          <CircularProgress size="lg" />
        </div>
      )}
      {!loading && (
        <div className="px-4 py-2 font-montserrat flex items-center justify-center" style={{ height: "100vh" }}>
          {!submitted && (
            <div className="space-y-6 -mt-12 text-center ">
              <div className="text-2xl font-bold">How Was Your Stay at the Anchorage?</div>
              <div>
                <p>We hope your stay was comfortable and enjoyable!</p>
                <p>We would appreciate it if you could take a moment to rate your experience.</p>
              </div>
              <div className="flex space-x-3 justify-center py-4 text-lg ">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRating(value)} // Set the rating state
                  >
                    {value <= rating ? star : starUnfilled}
                  </button>
                ))}
              </div>
              <form
                className="space-y-5"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    if (searchParams.booking_id) {
                      await insertFeedbackCOS("stay", searchParams.booking_id, rating, comment);
                      setSubmitted(true);
                    }
                  } catch (error) {
                    setAlert(true);
                    setMessage("Something went wrong");
                  }
                }}
              >
                {rating > 0 && (
                  <Textarea
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
          )}
          {submitted && (
            <div className="-mt-24">
              <Lottie className="h-[200px] my-auto " animationData={animationData} loop={false} />
              <div className="text-center text-gray-600 text-lg font-medium">
                <div>Your feedback helps us improve.</div>
                <div>Thank you!</div>
              </div>
            </div>
          )}
        </div>
      )}
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

export default Feedback;
