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
import { useEssentialsCart } from "@/lib/EssentialsCartContext";
import { star, starSmall, starUnfilled, starUnfilledSmall } from "@/app/assets/icons";
import { BookingInfoType } from "../timeline/page";
import happy from "@/app/assets/happy.json";
import Lottie from "lottie-react";
import { sendGAEvent } from "@next/third-parties/google";

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
  discount: number;
  platformFee?: number;
  gst?: number;
  platformFeeGst?: number;
  items: {
    itemDescription: string;
    itemId: string;
    itemName: string;
    itemQty: number;
    itemPrice: number;
    itemType: string;
    itemCategory: string;
  }[];
};

function Account() {
  const [placeOrderModal, setPlaceOrderModal] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
  });
  const [pastFood, setPastFood] = useState<OrderType[]>([]);
  const [pastEssentails, setPastEssentials] = useState<OrderType[]>([]);
  const [active, setActive] = useState<OrderType[]>([]);
  const [skeleton, setSkeleton] = useState(true);
  const params = useSearchParams();
  const room = params.get("room");
  const [reviewId, setReviewId] = useState("");
  const [review, setReview] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { cart, setCart } = useCart();
  const { cartEssentials, setCartEssentials } = useEssentialsCart();
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [reload, setReload] = useState(false);
  const [submittedStayFeedback, setSubmittedStayFeedback] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [ratingStay, setRatingStay] = useState(0);
  const [commentStay, setCommentStay] = useState("");
  const PLATFORM_FEE_FALLBACK = 15;
  const GST_RATE = 0.05;
  const router = useRouter();
  const categories: string[] = ["Food", "Essentials"];
  const [selected, setSelected] = useState("Food");

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
      qty: item.itemQty,
    }));
    console.log("items to add: ", itemsToAdd);

    setCart((prevCart) => [...itemsToAdd]);

    router.push(`/home?room=${room}`);
  };
  const handleReorderEssentials = (order: OrderType) => {
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

    setCartEssentials((prevCart) => [...itemsToAdd]);

    router.push(`/essentials?room=${room}`);
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
        const orders: OrderType[] = await fetchOrdersByBookingId(auth.booking_id as string);
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
        const pastOrders = orders.filter((order) => order.orderStatus === "Delivered");
        const activeOrders = orders.filter((order) => order.orderStatus === "Placed");
        console.log(activeOrders);
        const pastFoodData = pastOrders.filter((order) => order.items[0].itemCategory !== "essentials");
        const pastEssentails = pastOrders.filter((order) => order.items[0].itemCategory === "essentials");
        setPastFood(pastFoodData);
        setPastEssentials(pastEssentails);
        setActive(activeOrders);
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
        const orders: OrderType[] = await fetchOrdersByBookingId(auth.booking_id as string);
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
        const pastOrders = orders.filter((order) => order.orderStatus === "Delivered");
        const activeOrders = orders.filter((order) => order.orderStatus === "Placed");
        const pastFood = pastOrders.filter((order) => order.items[0].itemCategory !== "essentials");
        const pastEssentails = pastOrders.filter((order) => order.items[0].itemCategory === "essentials");
        setPastFood(pastFood);
        setPastEssentials(pastEssentails);
        setActive(activeOrders);
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

  const MEAL_IDS: Record<"BREAKFAST" | "LUNCH" | "DINNER", { veg: string; nonVeg: string }> = {
    BREAKFAST: {
      veg: process.env.NEXT_PUBLIC_BREAKFAST_VEG_ID || "",
      nonVeg: process.env.NEXT_PUBLIC_BREAKFAST_NON_VEG_ID || "",
    },
    LUNCH: {
      veg: process.env.NEXT_PUBLIC_LUNCH_VEG_ID || "",
      nonVeg: process.env.NEXT_PUBLIC_LUNCH_NON_VEG_ID || "",
    },
    DINNER: {
      veg: process.env.NEXT_PUBLIC_DINNER_VEG_ID || "",
      nonVeg: process.env.NEXT_PUBLIC_DINNER_NON_VEG_ID || "",
    },
  };

  const hasMealItems = (order: OrderType): boolean => {
    const res = order.items.some((item) =>
      Object.values(MEAL_IDS).some(
        (meal) => meal.veg === item.itemId || meal.nonVeg === item.itemId || item.itemId === process.env.NEXT_PUBLIC_TEA_ID
      )
    );
    return res;
  };

  const calculateTotal = (items: { itemQty: number; itemPrice: number }[]) => {
    return items.reduce((total, item) => total + item.itemQty * item.itemPrice, 0);
  };

  // Prefer the amounts actually charged/stored on the order - fall back to a
  // live estimate only for orders placed before these were persisted.
  const getOrderCharges = (order: OrderType) => {
    const subtotal = calculateTotal(order.items);
    const platformFee = order.platformFee ?? (!hasMealItems(order) ? PLATFORM_FEE_FALLBACK : 0);
    const gst = order.gst ?? Math.round((subtotal - order.discount) * GST_RATE);
    const platformFeeGst = order.platformFeeGst ?? Math.round(platformFee * GST_RATE);
    return { platformFee, gst, platformFeeGst, taxesAndOtherCharges: gst + platformFee + platformFeeGst };
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
          <div className="my-4 mx-3 text-xs font-medium  text-red-500">ACTIVE ORDERS</div>
          <div className="bg-white">
            {active.length === 0 ? (
              <div className="font-medium text-gray-500 py-3 text-center mx-3">No Active Orders</div>
            ) : (
              <div>
                {active.map((order) => (
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
                        <div key={item.itemId} className="text-sm flex justify-between font-medium py-1 text-slate-600 ">
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
                              <div className=""> {item.itemName}</div>
                            </div>
                            <span className="mx-1 text-gray-800"> x {item.itemQty}</span>
                          </div>
                          <div className="">₹ {item.itemPrice * item.itemQty}</div>
                        </div>
                      ))}
                      <div className="text-sm my-3 space-y-1 font-medium text-slate-500">
                        <div className="flex justify-between">
                          SubTotal
                          <span className=" ">₹{calculateTotal(order.items).toFixed(2)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between">
                            Discount
                            <span className=" ">₹{order.discount}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          Taxes and Other Charges
                          <span className=" ">₹{getOrderCharges(order).taxesAndOtherCharges}</span>
                        </div>
                        <div className="pl-3 space-y-1">
                          <div className="flex justify-between">
                            GST on food (5%)
                            <span className=" ">₹{getOrderCharges(order).gst}</span>
                          </div>
                          {getOrderCharges(order).platformFee > 0 && (
                            <>
                              <div className="flex justify-between">
                                Platform Fee
                                <span className=" ">₹{getOrderCharges(order).platformFee}</span>
                              </div>
                              <div className="flex justify-between">
                                GST on Platform Fee (5%)
                                <span className=" ">₹{getOrderCharges(order).platformFeeGst}</span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex justify-between text-red-600">
                          Total
                          <span className=" ">
                            ₹
                            {Number(calculateTotal(order.items).toFixed(2)) -
                              order.discount +
                              getOrderCharges(order).taxesAndOtherCharges}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full mt-4 space-x-3 ">
                      <button
                        onClick={() => {
                          if (order.items[0].itemCategory === "essentials") {
                            handleReorderEssentials(order);
                          } else {
                            handleReorder(order);
                          }
                        }}
                        className="w-full bg-red-500 text-white py-2 rounded-xl "
                      >
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
          <div className="pb-4 mt-4 mx-3 text-xs font-medium  text-red-500">YOUR ORDERS</div>
          <div className="bg-white pt-5">
            {categories.map((element, index) => (
              <span
                key={index}
                className={`${
                  selected === element ? "text-red-600 border-red-400" : ""
                } capitalize border-b-2  bg-white font-medium  mx-3 cursor-pointer`}
                onClick={() => {
                  sendGAEvent("event", "pastOrdertType", { value: element });
                  setSelected(element);
                }}
              >
                {element}
              </span>
            ))}
          </div>
          <div className="bg-white px-3 py-1">
            {selected === "Food" ? (
              pastFood.length === 0 ? (
                <div className="font-medium text-gray-500 py-3 text-center mx-3">No Past Orders</div>
              ) : (
                <div className="mt-2">
                  {pastFood.map((order) => (
                    <div key={order.orderId} className="border-b-2 border-dashed  border-gray-300 pb-5 py-3 mb-2 rounded-lg">
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
                          <div key={item.itemId} className="text-sm flex justify-between text-slate-600 font-medium  py-1 ">
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
                            <div className="">₹ {item.itemPrice * item.itemQty}</div>
                          </div>
                        ))}
                        <div className="text-sm my-3 space-y-1 font-medium text-slate-500">
                          <div className="flex justify-between">
                            SubTotal
                            <span className=" ">₹{calculateTotal(order.items).toFixed(2)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between">
                              Discount
                              <span className=" ">₹{order.discount}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            Taxes and Other Charges
                            <span className=" ">₹{getOrderCharges(order).taxesAndOtherCharges}</span>
                          </div>
                          <div className="pl-3 space-y-1">
                            <div className="flex justify-between">
                              GST on food (5%)
                              <span className=" ">₹{getOrderCharges(order).gst}</span>
                            </div>
                            {getOrderCharges(order).platformFee > 0 && (
                              <>
                                <div className="flex justify-between">
                                  Platform Fee
                                  <span className=" ">₹{getOrderCharges(order).platformFee}</span>
                                </div>
                                <div className="flex justify-between">
                                  GST on Platform Fee (5%)
                                  <span className=" ">₹{getOrderCharges(order).platformFeeGst}</span>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex justify-between text-red-600">
                            Total
                            <span className=" ">
                              ₹
                              {Number(calculateTotal(order.items).toFixed(2)) -
                                order.discount +
                                getOrderCharges(order).taxesAndOtherCharges}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex w-full mt-4 space-x-3 ">
                        <button
                          onClick={() => handleReorderEssentials(order)}
                          className="w-full bg-red-500 text-white py-2 rounded-xl "
                        >
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
              )
            ) : pastEssentails.length === 0 ? (
              <div className="font-medium text-gray-500 py-3 text-center mx-3">No Past Orders</div>
            ) : (
              <div className="mt-2">
                {pastEssentails.map((order) => (
                  <div key={order.orderId} className="border-b-2 border-dashed  border-gray-300 pb-5 py-3 mb-2 rounded-lg">
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
                      <button
                        onClick={() => handleReorderEssentials(order)}
                        className="w-full bg-red-500 text-white py-2 rounded-xl "
                      >
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
