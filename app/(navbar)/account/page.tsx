"use client";
import React, { useEffect, useState, useRef } from "react";
import { getAuthCustomer } from "@/app/actions/cookie";
import { SwipeableDrawer } from "@mui/material";
import LoginPage from "../../components/Login";
import { fetchBookingData, fetchFeedbackCOS, fetchOrdersByBookingId, insertFeedbackCOS, updateFeedback } from "@/app/actions/api";
import Image from "next/image";
import Logo from "../../assets/favicon.png";
import { useRouter, useSearchParams } from "next/navigation";
import { CircularProgress, DialogContent, DialogTitle, Modal, ModalClose, ModalDialog, Snackbar } from "@mui/joy";
import veg from "@/app/assets/veg.png";
import nonveg from "@/app/assets/nonveg.png";
import { ArrowBackIosNew, Check, CheckCircle, Close, Info, Star } from "@mui/icons-material";
import { Textarea } from "@headlessui/react";
import { useCart } from "@/lib/CartContext";
import { star, starSmall, starUnfilled, starUnfilledSmall } from "@/app/assets/icons";
import { BookingInfoType } from "../timeline/page";
import happy from "@/app/assets/happy.json";
import Lottie from "lottie-react";

type ProfileData = {
  name: string;
  email: string;
};

type OrderType = {
  bookingId: string;
  orderId: string;
  orderedOn: string;
  orderStatus: string;
  feedback: string | null;
  rating: number;
  items: {
    itemDescription: string;
    itemId: string;
    itemName: string;
    itemQty: number;
    itemPrice: number;
    itemType: string;
  }[];
};

function Account() {
  const [placeOrderModal, setPlaceOrderModal] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
  });
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [skeleton, setSkeleton] = useState(true);
  const params = useSearchParams();
  const room = params.get("room");
  const [reviewId, setReviewId] = useState("");
  const [review, setReview] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { cart, setCart } = useCart();
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [reload, setReload] = useState(false);
  const [submittedStayFeedback, setSubmittedStayFeedback] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [ratingStay, setRatingStay] = useState(0);
  const [commentStay, setCommentStay] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (!room) {
      router.push("/not-found");
      console.log("room: ", room);
    }
  }, [room]);

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const handleReorder = (order: OrderType) => {
    const itemsToAdd = order.items.map((item) => ({
      available: true,
      category: "",
      description: item.itemDescription,
      item_id: item.itemId,
      name: item.itemName,
      price: item.itemPrice,
      time_to_prepare: 0,
      type: item.itemType,
      quantity: item.itemQty,
    }));
    console.log("items to add: ", itemsToAdd);

    setCart((prevCart) => [...itemsToAdd]);

    router.push(`/home?room=${room}`);
  };

  const dataFetchedRef = useRef(false);
  useEffect(() => {
    const fetchAuthCustomer = async () => {
      const auth = await getAuthCustomer();
      if (auth && !dataFetchedRef.current) {
        dataFetchedRef.current = true;
        const result = await fetchBookingData(auth.booking_id as string);
        const data = { name: result.name as string, email: result.email as string };
        const orders = await fetchOrdersByBookingId(auth.booking_id as string);
        const feedback = (await fetchFeedbackCOS(auth.booking_id as string)) as {
          booking_id: string;
          comment: string;
          last_modified: string;
          rating: number;
          type: string;
        }[];
        // console.log("feedback: ", feedback)
        if (!feedback.some((f) => f.type === "stay")) {
          // console.log("inside feedback if")
          const lastClosed = localStorage.getItem("stayFeedbackLastClosed");
          if (!lastClosed) {
            // if page is opened for first time, then add delay of 15 seconds
            delay(6000).then(() => {
              setFeedback(true);
            });
          } else {
            const shouldShowModal = Date.now() - parseInt(lastClosed) > 2 * 60 * 60 * 1000; // 2 hours
            if (shouldShowModal) setFeedback(true);
          }
        }
        setOrders(orders);
        setProfileData(data);
        setSkeleton(false);
      } else if (!auth) {
        setPlaceOrderModal(true);
      }
    };

    fetchAuthCustomer();
  }, [reload]);

  const chef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && chef.current) {
      const Lottie = require("lottie-web") as any;

      const instance = Lottie.loadAnimation({
        container: chef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: require("../../assets/chef.json"),
      });
      return () => instance.destroy();
    }
  }, [submitted]);

  useEffect(() => {
    const fetchAuthCustomer = async () => {
      const auth = await getAuthCustomer();
      if (auth) {
        const result = await fetchBookingData(auth.booking_id as string);
        const data = { name: result.name as string, email: result.email as string };
        const orders = await fetchOrdersByBookingId(auth.booking_id as string);
        const feedback = (await fetchFeedbackCOS(auth.booking_id as string)) as {
          booking_id: string;
          comment: string;
          last_modified: string;
          rating: number;
          type: string;
        }[];
        // console.log("feedback: ", feedback)
        if (!feedback.some((f) => f.type === "stay")) {
          // console.log("inside feedback if")
          const lastClosed = localStorage.getItem("stayFeedbackLastClosed");
          if (!lastClosed) {
            // if page is opened for first time, then add delay of 15 seconds
            delay(6000).then(() => {
              setFeedback(true);
            });
          } else {
            const shouldShowModal = Date.now() - parseInt(lastClosed) > 2 * 60 * 60 * 1000; // 2 hours
            if (shouldShowModal) setFeedback(true);
          }
        }
        setOrders(orders);
        setProfileData(data);
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

  const formatDate = (timestampString: string) => {
    const timestamp = parseInt(timestampString, 10);
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateTotal = (items: { itemQty: number; itemPrice: number }[]) => {
    return items.reduce((total, item) => total + item.itemQty * item.itemPrice, 0);
  };

  return (
    <div className=" font-montserrat">
      <div className="sticky shadow-md top-0 z-10 bg-white  ">
        <div className="flex justify-between mb-1 pt-4 p-2 items-center">
          <Image src={Logo} alt="Logo" width={36} height={36} />
          <div className="text-red-500 border p-1 rounded-2xl px-2 text-sm font-medium border-red-500">Room: {room} </div>
        </div>
      </div>
      {!skeleton ? (
        <div className="mt-5  bg-gray-50 ">
          <div className=" bg-white  px-3 py-6 flex">
            <div className="bg-gray-300 w-20 h-20 rounded-full p-1 flex justify-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height={40} width={40}>
                <path
                  fill="#6b7280"
                  d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"
                />
              </svg>
            </div>
            <div className="ml-5 w-9/12 my-auto">
              <div className="capitalize text-2xl font-medium text-red-500">{profileData.name}</div>
              <div className="mt-2 break-words text-gray-500 font-medium text-sm">{profileData.email}</div>
            </div>
          </div>
          <div className="my-4 mx-3 text-xs font-medium  text-red-500">YOUR ORDERS</div>
          <div className="bg-white">
            {orders.length === 0 ? (
              <div className="font-medium text-gray-500 py-3 text-center mx-3">No past Orders</div>
            ) : (
              <div>
                {orders.map((order) => (
                  <div key={order.orderId} className="border-b-2 border-dashed  border-gray-300 pb-5 p-3 mb-2 rounded-lg">
                    <div className="space-y-2 flex mb-3 font-light justify-between">
                      <div className="text-xs">
                        <span className="">{formatDate(order.orderedOn)}</span>
                      </div>
                      <div className="text-xs">
                        {/* <span className="">{formatDate(order.orderedOn)}</span> */}
                        <div className="flex font-normal space-x-2  items-center">
                          <div> {order.orderStatus} </div>
                          <CheckCircle className="text-green-500 text-[16px]" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      {order.items.map((item) => (
                        <div key={item.itemId} className="text-sm flex justify-between  py-2 ">
                          <div className="flex">
                            <div className="flex space-x-2 items-center">
                              <div>
                                <Image
                                  alt={item.itemType}
                                  width={15}
                                  height={15}
                                  src={item.itemType === "veg" ? veg.src : nonveg.src}
                                />
                              </div>
                              <div> {item.itemName}</div>
                            </div>
                            <span className="mx-1 text-gray-800"> x {item.itemQty}</span>
                          </div>
                          <div className="text-gray-900">₹ {item.itemPrice * item.itemQty}</div>
                        </div>
                      ))}
                      <div className="mt-3 flex font-medium text-gray-700 justify-between">
                        Total: <span className="text-red-500  "> ₹ {calculateTotal(order.items).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex w-full mt-4 space-x-3 ">
                      <button onClick={() => handleReorder(order)} className="w-full bg-red-500 text-white py-2 rounded-xl ">
                        Reorder
                      </button>
                      {order.rating === -1 && (
                        <button
                          onClick={() => {
                            setReview(true);
                            setReviewId(order.orderId);
                          }}
                          className="w-full border-red-500 border text-red-500 bg-white py-2 rounded-xl "
                        >
                          Rate order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
          <LoginPage setPlaceOrderModal={setPlaceOrderModal} location="account" />
        </div>
      </SwipeableDrawer>
      <SwipeableDrawer
        anchor={"bottom"}
        open={review}
        onClose={() => {
          setReviewId("");
          setComment("");
          setRating(0);
          setReview(false);
          setSubmitted(false);
        }}
        onOpen={() => {
          setReview(true);
        }}
      >
        <div
          className="p-1 mx-3 my-2"
          onClick={() => {
            setReview(false);
            setReviewId("");
            setComment("");
            setSubmitted(false);
            setRating(0);
          }}
        >
          <ArrowBackIosNew fontSize="small" />
        </div>
        <div className="px-4 py-2 font-montserrat flex items-center justify-center" style={{ height: "100vh" }}>
          {!submitted && (
            <div className="space-y-6 -mt-12 text-center ">
              <div className="text-2xl font-bold">How Was Your Meal?</div>
              <div>
                <p>We hope you enjoyed your food! </p>
                <p> Please take a moment to rate your experience.</p>
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
                  console.log(`response rating: ${rating} comment: ${comment} for id: ${reviewId}`);
                  try {
                    await updateFeedback(rating, comment, reviewId);
                    setReload(!reload);
                    setSubmitted(true);
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
              <div ref={chef}></div>
              <div className="text-center text-gray-600 text-lg font-medium">
                <div>Your feedback helps us improve.</div>
                <div>Thank you!</div>
              </div>
              <button
                className="p-3 my-6 bg-red-500 text-white rounded-2xl w-full"
                onClick={() => {
                  setReviewId("");
                  setRating(0);
                  setComment("");
                  setReview(false);
                  setSubmitted(false);
                  window.location.reload();
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </SwipeableDrawer>

      <Modal
        open={feedback}
        onClose={() => {
          localStorage.setItem("stayFeedbackLastClosed", Date.now().toString());
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
          <DialogTitle>Rate your stay at the Anchorage</DialogTitle>
          <ModalClose style={{ zIndex: "10" }} />
          <DialogContent className="h-fit">
            {!submittedStayFeedback && (
              <>
                <div>How was your stay at the Anchorage? Please rate or share a suggestion.</div>
                <div className="my-4">
                  <div className="flex space-x-3 justify-center py-4 text-lg ">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => setRatingStay(value)} // Set the rating state
                      >
                        {value <= ratingStay ? starSmall : starUnfilledSmall}
                      </button>
                    ))}
                  </div>
                  <form
                    className="space-y-5 my-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      localStorage.setItem("stayFeedbackLastClosed", Date.now().toString());
                      console.log(`response rating: ${rating} comment: ${comment} for timeline`);
                      try {
                        const user = (await getAuthCustomer()) as BookingInfoType;
                        if (user) {
                          console.log("user: ", user);
                          await insertFeedbackCOS("stay", user?.booking_id, rating, comment);
                          setSubmittedStayFeedback(true);
                        }
                      } catch (error) {
                        setAlert(true);
                        setMessage("Something went wrong");
                      }
                    }}
                  >
                    {ratingStay > 0 && (
                      <textarea
                        rows={5}
                        value={commentStay}
                        onChange={(e) => {
                          setCommentStay(e.target.value);
                        }}
                        className={"w-full  border-gray-400 border-2 outline-none rounded-lg  px-3 p-2"}
                        placeholder="Leave a comment..."
                      />
                    )}
                    {ratingStay > 0 && (
                      <button className="p-3 bg-red-500 text-white rounded-2xl w-[100%]" type="submit">
                        Submit
                      </button>
                    )}
                  </form>
                </div>
              </>
            )}
            {submittedStayFeedback && (
              <div className="">
                <Lottie className="h-[200px] my-auto " animationData={happy} loop={false} />

                <div className="text-center text-gray-600 text-lg font-medium">
                  <div>Your feedback helps us improve.</div>
                  <div>Thank you!</div>
                </div>
                <button
                  className="p-3 my-6 bg-red-500 text-white rounded-2xl w-full"
                  onClick={() => {
                    setRatingStay(0);
                    setCommentStay("");
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

export default Account;
