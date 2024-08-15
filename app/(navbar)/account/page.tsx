"use client";
import React, { useEffect, useState, useRef } from "react";
import { getAuthCustomer } from "@/app/actions/cookie";
import { SwipeableDrawer } from "@mui/material";
import LoginPage from "../../components/Login";
import { fetchBookingData, fetchOrdersByBookingId } from "@/app/actions/api";
import Image from "next/image";
import Logo from "../../assets/favicon.png";
import { useRouter, useSearchParams } from "next/navigation";
import { CircularProgress } from "@mui/joy";
import veg from "@/app/assets/veg.png";
import nonveg from "@/app/assets/nonveg.png";
import { ArrowBackIosNew, Check, CheckCircle, Star } from "@mui/icons-material";
import { Textarea } from "@headlessui/react";
import Lottie from "lottie-web";
import { useCart } from "@/lib/CartContext";

type ProfileData = {
  name: string;
  email: string;
};

type OrderType = {
  bookingId: string;
  orderId: string;
  orderedOn: string;
  orderStatus: string;
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
  const router = useRouter();

  const handleReorder = (order: OrderType) => {
    const itemsToAdd = order.items.map((item) => ({
      available: true,
      category: '',
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
  
    router.push(`/?room=${room}`);
  };
  

  const star = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="#f3d00c" width={50} height={50} viewBox="0 0 576 512">
      <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
    </svg>
  );
  const starUnfilled = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="#dbdbdb" width={50} height={50} viewBox="0 0 576 512">
      <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
    </svg>
  );

  const dataFetchedRef = useRef(false);
  useEffect(() => {
    const fetchAuthCustomer = async () => {
      const auth = await getAuthCustomer();
      if (auth && !dataFetchedRef.current) {
        dataFetchedRef.current = true;
        const result = await fetchBookingData(auth.booking_id as string);
        const data = { name: result.name as string, email: result.email as string };
        const orders = await fetchOrdersByBookingId(auth.booking_id as string);
        setOrders(orders);
        setProfileData(data);
        setSkeleton(false);
      } else if (!auth) {
        setPlaceOrderModal(true);
      }
    };

    fetchAuthCustomer();
  }, []);

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
              <div>No past Orders</div>
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
                      <button onClick={() => handleReorder(order)} className="w-full bg-red-500 text-white py-2 rounded-xl ">Reorder</button>
                      <button
                        onClick={() => {
                          setReview(true);
                          setReviewId(order.orderId);
                        }}
                        className="w-full border-red-500 border text-red-500 bg-white py-2 rounded-xl "
                      >
                        Rate order
                      </button>
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
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log(`response rating: ${rating} comment: ${comment} for id: ${reviewId}`);
                  setSubmitted(true);
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
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </SwipeableDrawer>
    </div>
  );
}

export default Account;
