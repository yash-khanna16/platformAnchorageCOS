import {
  Add,
  ArrowForward,
  AutoAwesome,
  Cancel,
  Close,
  Error,
  Info,
  KeyboardArrowDown,
  Remove,
} from "@mui/icons-material";
import Image from "next/image";
import Logo from "../../assets/favicon.png";
import React, { useEffect, useRef, useState } from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import LoginPage from "../../components/Login";
import { getAuthCustomer } from "@/app/actions/cookie";
import { fetchAllCoupons, placeOrder, validateCoupon } from "@/app/actions/api";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Modal,
  ModalClose,
  ModalDialog,
  DialogContent,
  Input,
  DialogTitle,
  Snackbar,
} from "@mui/joy";
import { useCart } from "@/lib/CartContext";
import Lottie from "lottie-react";
import animationData from "../../assets/tick.json";
import { CircularProgress } from "@mui/joy";
import { sendGAEvent } from "@next/third-parties/google";
import { fetchAllItems } from "@/app/actions/api";
import ApplyCoupon, { Coupon } from "./ApplyCoupon";
import { useFreeItems } from "@/lib/FreeCartContext";
import Veg from "../../assets/veg.png";
import Nonveg from "../../assets/nonveg.png";
import ScheduleDate from "./ScheduleDate";
import ScheduleTime from "./ScheduleTime";
import Confirmation from "./Confirmation";
import dayjs from "dayjs";
import { BookingInfoType } from "../timeline/page";

type DataType = {
  available: boolean;
  category: string;
  description: string;
  item_id: string;
  name: string;
  price: number;
  time_to_prepare: number;
  type: string;
};

type MenuItem = {
  available: boolean;
  category: string;
  description: string;
  item_id: string;
  name: string;
  price: number;
  time_to_prepare: number;
  type: string;
  category_id: string;
  sequence: number;
  bestSeller: boolean;
};

type CartType = DataType & {
  qty: number;
};

type ScheduleType = {
  date: string;
  time: string;
};

type CartPropsType = {
  cartOpen: boolean;
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  expandedId: string | null;
  toggleExpand: (id: string) => void;
};

const Cart: React.FC<CartPropsType> = ({ cartOpen, setCartOpen, expandedId, toggleExpand }) => {
  const [note, setNote] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteContentConfirm, setNoteContentConfirm] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [noteError, setNoteError] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState(false);
  const [placeOrderModal, setPlaceOrderModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [timeToPrepare, setTimeToPrepare] = useState(0);
  const [delay, setDelay] = useState(0);
  const [notAvailable, setNotAvailable] = useState<
    { item_id: string; name: string; available: boolean }[]
  >([]);
  const [bestSellerLoading, setBestSellerLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState<number>(0);
  const [step, setStep] = useState<number>(0);
  const [scheduleData, setScheduleData] = useState<ScheduleType>({ date: "", time: "00:00" });
  const [showTotal, setShowTotal] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [scheduleConfirmModal, setScheduleConfirmModal] = useState(false);
  const [scheduleTimeError, setScheduleTimeError] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [validatedCoupon, setValidatedCoupon] = useState("");
  const { cart, setCart } = useCart();
  const { freeItems, setFreeItems } = useFreeItems();
  const searchParams = useSearchParams();
  const [bestSeller, setBestseller] = useState<MenuItem[]>([]);
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState("");
  const [platformFee, setPlatformFee] = useState<number>(2);
  const router = useRouter();
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

  useEffect(() => {
    const fetchCoupons = async () => {
      const auth = await getAuthCustomer();
      const email = (auth?.guest_email as string) || "";
      fetchAllCoupons(email)
        .then((res) => {
          console.log("res: ", res);
          setCoupons(res);
        })
        .catch((error) => {
          console.log("Error fetching coupons");
        });
    };
    fetchCoupons();
  }, []);

  useEffect(() => {
    const hasMealItems = cart.some((item) =>
      Object.values(MEAL_IDS).some(
        (meal) => meal.veg === item.item_id || meal.nonVeg === item.item_id
      )
    );

    console.log("use effect ran: ", hasMealItems);

    if (hasMealItems) setPlatformFee(0);
    else setPlatformFee(2);
  }, [cart]);

  const validateCouponCode = async () => {
    try {
      setCouponLoading(true);

      // await sleep(1000);

      const couponId = coupons.find((coupon) => coupon.code === validatedCoupon)?.coupon_id;
      console.log("coupons: ", coupons);
      console.log("coupon id, ", couponId);
      if (couponId) {
        const modifiedCart = cart.map((cartItem) => {
          return {
            item_id: cartItem.item_id,
            qty: cartItem.qty,
          };
        });

        const auth = await getAuthCustomer();
        const email = (auth?.guest_email as string) || "";
        const res = await validateCoupon(email, couponId, { items: modifiedCart });
        if (!res.success) {
          setDiscount(0);
          setFreeItems([]);
          setValidatedCoupon("");
        } else {
          // console.log("validated coupon: ", res);
          setDiscount(res.data.discount);
          setFreeItems(res.data.freeItems);
        }
      } else {
        setFreeItems([]);
        setValidatedCoupon("");
        setDiscount(0);
      }
      setCouponLoading(false);
    } catch (error) {
      console.log(error);
      setValidatedCoupon("");
      setFreeItems([]);
      setDiscount(0);
      setCouponLoading(false);
    }
  };

  const handleScheduleMeal = async () => {
    const auth = await getAuthCustomer();
    if (auth) {
      console.log(auth);
      let checkout = auth.checkout as string;
      setCheckOut(checkout);
      setOpenScheduleModal(true);
    } else {
      setPlaceOrderModal(true);
    }
  };

  const handleScheduleSubmit = async () => {
    setLoading(true);
    const scheduledDateTime = `${scheduleData.date}T${scheduleData.time}`;
    const scheduledTime = new Date(scheduledDateTime).getTime();
    const currentTime = new Date().getTime();
    const timeDifference = scheduledTime - currentTime;
    let minutesDifference = Math.floor(timeDifference / (1000 * 60));
    let max_time = 0;
    cart.map((item: CartType) => {
      if (max_time < item.time_to_prepare) {
        max_time = item.time_to_prepare;
      }
    });
    console.log(max_time);
    console.log(minutesDifference);
    if (max_time < minutesDifference) {
      const auth = await getAuthCustomer();
      if (auth) {
        try {
          const room = searchParams.get("room");
          const itemMap = new Map<string, number>();

          cart.forEach((item: CartType) => {
            itemMap.set(item.item_id, (itemMap.get(item.item_id) || 0) + item.qty);
          });

          freeItems.forEach((freeItem: CartType) => {
            itemMap.set(freeItem.item_id, (itemMap.get(freeItem.item_id) || 0) + freeItem.qty);
          });
          const items = Array.from(itemMap.entries()).map(([item_id, qty]) => ({
            item_id,
            qty,
          }));

          const couponId =
            coupons.find((coupon) => coupon.code === validatedCoupon)?.coupon_id || null;
          const dataSend = {
            order_id: "",
            booking_id: auth.booking_id as string,
            room: room,
            remarks: noteContentConfirm,
            created_at: "",
            status: "Placed",
            items: items,
            coupon_id: couponId,
            email: auth.guest_email as string,
            time_to_prepare: max_time,
          };
          sendGAEvent("event", "placedOrder", { value: dataSend });
          console.log(delay);
          const result = await placeOrder({ ...dataSend, delay: minutesDifference });
          console.log(result);
          if (result.status === 200) {
            let time_to_prepare = 0;
            result.data.details.items.forEach((element: any) => {
              time_to_prepare =
                time_to_prepare > element.time_to_prepare
                  ? time_to_prepare
                  : element.time_to_prepare;
            });
            setTimeToPrepare(time_to_prepare + delay);
            setOpenScheduleModal(false);
            setStep(0);
            setScheduleConfirmModal(true);
            setLoading(false);
          } else if (result.status === 401) {
            if (result.data.mealsRedeemed) {
              console.log("Can't place order: ", result.data.mealsRedeemed);
              setErrorMessage(result.data.mealsRedeemed);
              setErrorType("meals");
            } else {
              console.log(
                "Can't place order, following items not available: ",
                result.data.notAvailable
              );
              setNotAvailable(result.data.notAvailable);
              setErrorType("notAvailable");
            }
            setOpenScheduleModal(false);
            setStep(0);
            setErrorModal(true);
            setLoading(false);
          }
        } catch (error) {
          console.log("Something went wrong,", error);
          setLoading(false);
        }
      }
    } else {
      setScheduleTimeError(true);
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    const auth = await getAuthCustomer();
    if (auth) {
      try {
        const room = searchParams.get("room");
        const itemMap = new Map<string, number>();

        cart.forEach((item: CartType) => {
          itemMap.set(item.item_id, (itemMap.get(item.item_id) || 0) + item.qty);
        });

        freeItems.forEach((freeItem: CartType) => {
          itemMap.set(freeItem.item_id, (itemMap.get(freeItem.item_id) || 0) + freeItem.qty);
        });
        const items = Array.from(itemMap.entries()).map(([item_id, qty]) => ({
          item_id,
          qty,
        }));
        let max_time = 0;
        cart.map((item: CartType) => {
          if (max_time < item.time_to_prepare) {
            max_time = item.time_to_prepare;
          }
        });

        const couponId =
          coupons.find((coupon) => coupon.code === validatedCoupon)?.coupon_id || null;
        const dataSend = {
          order_id: "",
          booking_id: auth.booking_id as string,
          room: room,
          remarks: noteContentConfirm,
          created_at: "",
          status: "Placed",
          items: items,
          coupon_id: couponId,
          email: auth.guest_email as string,
          time_to_prepare: max_time,
        };
        sendGAEvent("event", "placedOrder", { value: dataSend });
        console.log(delay);
        const result = await placeOrder({ ...dataSend, delay });
        console.log(result);
        if (result.status === 200) {
          let time_to_prepare = 0;
          result.data.details.items.forEach((element: any) => {
            time_to_prepare =
              time_to_prepare > element.time_to_prepare ? time_to_prepare : element.time_to_prepare;
          });
          setTimeToPrepare(time_to_prepare + delay);
          setOpenScheduleModal(false);
          setConfirmModal(true);
          setLoading(false);
        } else if (result.status === 401) {
          if (result.data.mealsRedeemed) {
            console.log("Can't place order: ", result.data.mealsRedeemed);
            setErrorMessage(result.data.mealsRedeemed);
            setErrorType("meals");
          } else {
            console.log(
              "Can't place order, following items not available: ",
              result.data.notAvailable
            );
            setNotAvailable(result.data.notAvailable);
            setErrorType("notAvailable");
          }
          setOpenScheduleModal(false);
          setErrorModal(true);
          setLoading(false);
        }
      } catch (error) {
        console.log("Something went wrong,", error);
        setLoading(false);
      }
    } else {
      setPlaceOrderModal(true);
      setLoading(false);
    }
  };

  const handleAddItem = (item: DataType) => {
    setCart((prevCart) => {
      // Check if the item is from the meals category
      const isMealCategory = Object.values(MEAL_IDS).some(
        (meal) => meal.veg === item.item_id || meal.nonVeg === item.item_id
      );

      if (isMealCategory) {
        // If the item already exists in the cart, do not allow more than 1 qty
        const existingItem = prevCart.find((cartItem) => cartItem.item_id === item.item_id);
        if (existingItem) {
          setAlert(true);
          setMessage("You can only add one of this meal");
          return prevCart; // Return the cart as-is, no changes
        }

        // Otherwise, add the item with qty = 1
        return [...prevCart, { ...item, qty: 1 }];
      }

      // For non-meal items, allow normal add-to-cart behavior
      const existingItem = prevCart.find((cartItem) => cartItem.item_id === item.item_id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.item_id === item.item_id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
        );
      } else {
        return [...prevCart, { ...item, qty: 1 }];
      }
    });
  };

  const handleRemoveItem = (item: DataType) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.item_id === item.item_id);
      if (existingItem && existingItem.qty > 1) {
        return prevCart.map((cartItem) =>
          cartItem.item_id === item.item_id ? { ...cartItem, qty: cartItem.qty - 1 } : cartItem
        );
      } else {
        return prevCart.filter((cartItem) => cartItem.item_id !== item.item_id);
      }
    });
  };

  useEffect(() => {
    validateCouponCode();
  }, [cart]);

  useEffect(() => {
    const handleUpdate = async () => {
      setNoteError(false);
      setPlaceOrderError(false);
      let totalAmount = 0;
      cart.forEach((element) => {
        totalAmount += element.price * element.qty;
      });
      freeItems.forEach((element) => {
        totalAmount += element.price * element.qty;
      });
      if (cart.length === 0) setCartOpen(false);
      setTotal(totalAmount);
    };
    handleUpdate();
  }, [cart, freeItems]);

  useEffect(() => {
    const fetchBestSellers = async () => {
      const auth = (await getAuthCustomer()) as BookingInfoType;
      const fetchedItems: MenuItem[] = await fetchAllItems(auth?.booking_id || "");
      const availableItems = fetchedItems.filter(
        (item) => item.available && item.bestSeller && item.category !== "essentials"
      );
      setBestseller(availableItems);
      setBestSellerLoading(false);
    };
    if (cartOpen) {
      setBestSellerLoading(true);
      fetchBestSellers();
    }
  }, [cartOpen]);

  return (
    <div className="font-montserrat min-h-screen  h-fit overflow-auto  py-2 bg-[#f5f6fb]">
      <div className="mb-28">
        <div className="fixed w-full flex justify-between mb-1 p-2 items-center top-0 z-10 bg-white border-b ">
          <div className="flex items-end font-semibold text-2xl">
            <Image
              src={Logo}
              alt="Logo"
              width={36}
              height={36}
              onClick={() => {
                setCartOpen(!cartOpen);
              }}
            />
          </div>
          <Close
            sx={{ color: "#111" }}
            className="relative top-0.5"
            onClick={() => setCartOpen(!cartOpen)}
          />
        </div>
        <div className="bg-white m-2 shadow-md border mt-16 mb-4 rounded-2xl">
          <div className="p-3 text-2xl mt-1 font-semibold border-b border-dashed ">Your Cart</div>

          <div className="m-2 rounded-2xl ">
            {cart.map((item: CartType) => (
              <div key={item.item_id} className="p-3  border-b border-dashed">
                <div className="flex text-base justify-between">
                  <div>
                    <div className="text-lg font-medium">{item.name}</div>
                    <div className="text-xs">₹ {item.price}</div>
                  </div>

                  <div className="relative border-red-500 border w-20 h-8 text-red-500 rounded-lg bg-red-50 flex items-center justify-center">
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="absolute top-1 left-1"
                    >
                      <Remove fontSize="small" />
                    </button>
                    {item.qty}
                    <button onClick={() => handleAddItem(item)} className="absolute top-1 right-1">
                      <Add fontSize="small" />
                    </button>
                  </div>
                </div>
                <div className="mt-1 text-xs flex justify-between">
                  {expandedId === item.item_id ? (
                    <div>
                      {item.description}{" "}
                      <button
                        className="font-medium text-red-500"
                        onClick={() => toggleExpand(item.item_id)}
                      >
                        show less
                      </button>
                    </div>
                  ) : (
                    <div>
                      {item.description.split(" ").slice(0, 10).join(" ")}...{" "}
                      {item.description.length > 10 && (
                        <button
                          className="font-medium text-red-500"
                          onClick={() => toggleExpand(item.item_id)}
                        >
                          read more
                        </button>
                      )}
                    </div>
                  )}
                  <div className="flex font-medium justify-end w-24 text-sm ml-2">
                    <span>₹ {item.price * item.qty}</span>
                  </div>
                </div>
              </div>
            ))}
            {freeItems.length > 0 && (
              <div className="font-semibold  mt-3 mx-2 text-xl ">Free Items</div>
            )}
            {freeItems.map((item: CartType) => (
              <div key={item.item_id} className="p-3  border-b border-dashed">
                <div className="flex text-base justify-between">
                  <div>
                    <div className="text-lg font-medium">{item.name}</div>
                    <div className="text-xs">₹ {item.price}</div>
                  </div>

                  <div className="relative border-red-500 border w-[82px] h-8 text-red-500 rounded-lg bg-red-50 flex items-center justify-center">
                    {/* <button onClick={() => handleRemoveItem(item)} className="absolute top-1 left-1">
                      <Remove fontSize="small" />
                    </button> */}
                    {item.qty}
                    {/* <button onClick={() => handleAddItem(item)} className="absolute top-1 right-1">
                      <Add fontSize="small" />
                    </button> */}
                  </div>
                </div>
                <div className="mt-1 text-xs flex justify-between">
                  {expandedId === item.item_id ? (
                    <div>
                      {item.description}{" "}
                      <button
                        className="font-medium text-red-500"
                        onClick={() => toggleExpand(item.item_id)}
                      >
                        show less
                      </button>
                    </div>
                  ) : (
                    <div>
                      {item.description.split(" ").slice(0, 10).join(" ")}...{" "}
                      {item.description.length > 10 && (
                        <button
                          className="font-medium text-red-500"
                          onClick={() => toggleExpand(item.item_id)}
                        >
                          read more
                        </button>
                      )}
                    </div>
                  )}
                  <div className="flex font-medium justify-end w-24 text-sm ml-2">
                    <span className="line-through">₹ {item.price * item.qty}</span>{" "}
                    <span className="ml-2">₹ 0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="text-xs p-2  rounded-lg mt-2 mb-4 mx-3 bg-white border"
            onClick={() => {
              if (cart.length > 0) {
                setNote(!note);
              } else {
                setNoteError(true);
              }
            }}
          >
            Add a note for the restaurant
          </button>
        </div>

        <div className="px-2 py-3 bg-white mx-2 rounded-2xl shadow-md text-red-500 text-sm">
          <AutoAwesome className="relative -top-0.5 my-2 " style={{ height: "18" }} />
          <span className="font-semibold">BestSellers</span>
          {bestSellerLoading ? (
            <div className="text-sm flex space-x-3 overflow-x-scroll hide-scrollbar font-medium text-gray-600">
              {[1, 2, 3].map((element: number) => (
                <div
                  key={element}
                  className="text-xs rounded-md border w-52 flex-shrink-0 flex flex-col justify-between p-2 animate-pulse"
                >
                  <div>
                    <div className="h-4 bg-gray-100"></div>
                    <div className="h-10 mt-2 bg-gray-100"></div>
                    <div className="flex mt-2 justify-between">
                      <div className="w-7 h-5 bg-gray-100"></div>
                      <div className="w-12 h-5 bg-gray-100"></div>{" "}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm mx-1 flex space-x-3 overflow-x-scroll hide-scrollbar font-medium text-gray-600">
              {bestSeller
                .filter((item) => item.category !== "complementary meals")
                .map((item: MenuItem) => (
                  <div
                    key={item.item_id}
                    className="text-xs rounded-md border w-52 flex-shrink-0 flex flex-col justify-between p-2 "
                  >
                    <div>
                      <div className="font-semibold text-sm">
                        <Image
                          src={item.type === "veg" ? Veg : Nonveg}
                          alt={item.type}
                          className="inline relative mr-1 -top-0.5"
                          height={15}
                          width={15}
                        />

                        {item.name}
                      </div>
                      <div className="mt-2">{item.description}</div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs">₹ {item.price}</div>
                      <button
                        onClick={() => {
                          sendGAEvent("event", "add-bestseller-cart");
                          handleAddItem(item);
                        }}
                        className="relative border-red-500 border w-fit py-1 px-2 text-red-500 rounded-lg bg-red-50"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <ApplyCoupon
          validatedCoupon={validatedCoupon}
          setValidatedCoupon={setValidatedCoupon}
          coupons={coupons}
          discount={discount}
          setDiscount={setDiscount}
        />

        {noteError && (
          <div className="p-2 mx-3 text-red-600 text-sm">
            At least add 1 item to add a note for the restaurant
          </div>
        )}
        <div className="p-3 shadow-md border bg-white m-2 my-3 rounded-2xl font-medium text- ">
          <div className="justify-between flex space-x-4 ">
            <div className="flex space-x-3 items-center px-2">
              <span>Total</span>
              <span className="font-semibold space-x-2">
                {discount === 0 && <span className="text-sm">₹ {total + platformFee}</span>}
                {discount !== 0 && (
                  <>
                    <span className="line-through text-sm">₹ {total}</span>
                    <span>₹ {total - discount + platformFee}</span>{" "}
                  </>
                )}
              </span>
            </div>
            <div
              onClick={() => {
                setShowTotal(!showTotal);
              }}
              className="p-1 border rounded-full"
            >
              <KeyboardArrowDown className="text-gray-600" />
            </div>
          </div>
          {showTotal && (
            <div className="text-xs text-gray-600 mx-2 my-3 space-y-1">
              <div className="flex justify-between">
                <div>Items subtotal </div> <div>₹ {total}</div>
              </div>
              {platformFee > 0 && (
                <div className="flex justify-between">
                  <div>Platform Charges </div> <div>₹ {platformFee}</div>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between">
                  <div>Discount ({validatedCoupon}) </div> <div>- ₹ {discount} </div>
                </div>
              )}

              <div className="flex justify-between">
                <div>Total </div> <div>₹ {total - discount + platformFee} </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-2">
          {/* <div className="fixed px-3 bottom-0 py-5 z-10 bg-white w-full"></div> */}
          {placeOrderError && (
            <div className="p-2 mx-3 text-center text-red-600 text-sm">
              At least add 1 item to place an order
            </div>
          )}
          <div>
            {cart.filter((item: CartType) => item.category === "complementary meals").length !== 0 ? (
              <button
                disabled={loading}
                className="p-2 py-[10px] border disabled:bg-opacity-90 text-xl flex items-center justify-center font-medium text-white border-red-600 w-full bg-red-500 rounded-full"
                onClick={() => {
                  if (cart.length > 0 && cart.some((item: CartType) => item.category === "complementary meals")) {
                    handleScheduleMeal();
                  } else {
                    setPlaceOrderError(true);
                  }
                }}
              >
                <div>Schedule</div>
              </button>
            ) : (
              <button
                disabled={loading}
                className="p-2 py-[10px] border disabled:bg-opacity-90 text-xl flex items-center justify-center font-medium text-white border-red-600 w-full bg-red-500 rounded-full"
                onClick={() => {
                  if (cart.length > 0) {
                    handlePlaceOrder();
                  } else {
                    setPlaceOrderError(true);
                  }
                }}
              >
                {loading && <CircularProgress color="danger" size="sm" />}
                <div>Place Order</div>
              </button>
            )}
          </div>
        </div>
      </div>
      <SwipeableDrawer
        anchor={"bottom"}
        open={note}
        onClose={() => {
          setNote(false);
          setNoteContent("");
        }}
        onOpen={() => {
          setNote(true);
        }}
      >
        <div className="font-montserrat px-4 py-6" style={{ height: "50vh" }}>
          <div className="mx-2 text-slate-700 font-medium ">Add a note for the restaurant</div>
          <div className="py-2 mt-5 bg-white rounded-2xl">
            <textarea
              onChange={(e) => {
                setNoteContent(e.target.value);
              }}
              value={noteContent}
              rows={10}
              className="p-3 outline-none bg-gray-50 border w-full rounded-lg"
            />
          </div>
        </div>
        <div className="flex px-4 font-montserrat fixed bottom-4 w-full mt-5 gap-3">
          <button
            onClick={() => {
              setNoteContent("");
              setNote(false);
            }}
            className="w-1/2 py-2 border text-red-500 font-medium text-lg rounded-lg"
          >
            Clear
          </button>
          <button
            onClick={() => {
              setNoteContentConfirm(noteContent);
              setNote(false);
            }}
            className="w-1/2 py-2 border border-red-700 bg-red-500 text-white font-medium text-lg rounded-lg"
          >
            Save
          </button>
        </div>
      </SwipeableDrawer>
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
          <LoginPage setPlaceOrderModal={setPlaceOrderModal} />
        </div>
      </SwipeableDrawer>
      <Modal
        open={confirmModal}
        onClose={() => {
          setConfirmModal(false);
          setCart([]);
          const query = searchParams.toString();
          const newUrl = query ? `/account?${query}` : "/account";
          router.push(newUrl);
        }}
      >
        <ModalDialog style={{ width: "90vw" }}>
          <ModalClose style={{ zIndex: "10" }} />
          <DialogContent className="h-fit">
            <div className="flex flex-col h-32 items-center overflow-hidden ">
              <Lottie className="h-full scale-150" animationData={animationData} loop={false} />
            </div>
            <div className="font-semibold text-2xl text-gray-500  font-montserrat text-center">
              Your Order has been placed!
            </div>
            <div className="flex mt-2 mx-auto  font-montserrat text-gray-500 text-center font-medium ">
              Expected Waiting Time {timeToPrepare} mins
            </div>
            <button
              onClick={() => {
                setConfirmModal(false);
                setCart([]);
                const query = searchParams.toString();
                const newUrl = query ? `/timeline?${query}` : "/timeline";
                router.push(newUrl);
              }}
              className="p-3 border font-montserrat font-medium text-white border-red-600 w-full bg-red-500 mt-8 rounded-full"
            >
              Explore Journey
              <ArrowForward />
            </button>
            {/* <div className="flex justify-between">
              <div className=" capitalize">Item</div>
              <div>Qty</div>
            </div>
            {cart.map((item: CartType, index: number) => (
              <div key={index} className="flex justify-between border-b border-dashed">
                <div className=" capitalize">{item.name}</div>
                <div className="mr-2">{item.qty}</div>
              </div>
            ))} */}
          </DialogContent>
        </ModalDialog>
      </Modal>
      <Modal
        open={scheduleConfirmModal}
        onClose={() => {
          setScheduleConfirmModal(false);
          setCart([]);
          setScheduleData({ date: "", time: "00:00" });
          const query = searchParams.toString();
          const newUrl = query ? `/account?${query}` : "/account";
          router.push(newUrl);
        }}
      >
        <ModalDialog style={{ width: "90vw" }}>
          <ModalClose style={{ zIndex: "10" }} />
          <DialogContent className="h-fit">
            <div className="flex flex-col h-32 items-center overflow-hidden ">
              <Lottie className="h-full scale-150" animationData={animationData} loop={false} />
            </div>
            <div className="font-semibold text-2xl text-gray-500  font-montserrat text-center">
              Your Order has been scheduled!
            </div>
            <div className="flex mt-2 mx-auto  font-montserrat text-gray-500 text-center font-medium ">
              Your order will arrive on {dayjs(scheduleData.date).format("DD MMMM YYYY")} at{" "}
              {scheduleData.time} .
            </div>
            <button
              onClick={() => {
                setScheduleConfirmModal(false);
                setCart([]);
                setScheduleData({ date: "", time: "00:00" });
                const query = searchParams.toString();
                const newUrl = query ? `/timeline?${query}` : "/timeline";
                router.push(newUrl);
              }}
              className="p-3 border font-montserrat font-medium text-white border-red-600 w-full bg-red-500 mt-8 rounded-full"
            >
              Explore Journey
              <ArrowForward />
            </button>
            {/* <div className="flex justify-between">
              <div className=" capitalize">Item</div>
              <div>Qty</div>
            </div>
            {cart.map((item: CartType, index: number) => (
              <div key={index} className="flex justify-between border-b border-dashed">
                <div className=" capitalize">{item.name}</div>
                <div className="mr-2">{item.qty}</div>
              </div>
            ))} */}
          </DialogContent>
        </ModalDialog>
      </Modal>
      <Modal
        open={scheduleTimeError}
        onClose={() => {
          setScheduleTimeError(false);
        }}
      >
        <ModalDialog style={{ width: "90vw" }}>
          <ModalClose style={{ zIndex: "10" }} />
          <DialogContent className="h-fit">
            {/* Error Message Header */}
            <div className="flex flex-col h-32 items-center overflow-hidden">
              <Cancel className="h-20 scale-[300%] text-red-600" />
              <div className="font-semibold text-2xl text-center">Error scheduling order</div>
            </div>
            {(() => {
              let max_time = 0;
              cart.forEach((item) => {
                if (max_time < item.time_to_prepare) {
                  max_time = item.time_to_prepare;
                }
              });
              return (
                <div className="mt-2 mx-auto  font-montserrat text-gray-500 font-medium">
                  The selected time is less than the required preparation time. You may need to wait
                  for <span className="font-semibold">{max_time} minutes </span>or adjust the
                  scheduled date and time.
                  <br />
                  <br />
                  Click the button below to confirm your order.
                </div>
              );
            })()}

            {/* Place Order Button */}
            <button
              onClick={() => {
                handlePlaceOrder();
              }}
              className="p-3 border font-montserrat font-medium text-white border-red-600 w-full bg-red-500 mt-8 rounded-full"
            >
              Place Order
              <ArrowForward />
            </button>
          </DialogContent>
        </ModalDialog>
      </Modal>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={errorModal}
        onClose={() => setErrorModal(false)}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <ModalDialog sx={{ maxWidth: 800 }} className="p-5 font-montserrat rounded-2xl py-6">
          <div className="font-semibold text- text-slate-600 flex gap-x-3 items-center">
            <div>
              <Error className="text-red-600" fontSize="large" />
            </div>
            <div className="">
              {errorType === "meals" && (
                <span>
                  {errorMessage.split(":")[0]}:{" "}
                  <span className="font-extrabold">{errorMessage.split(":")[1]}</span>
                </span>
              )}
              {errorType === "notAvailable" && (
                <>
                  <div className="flex text-lg font-medium justify-between">
                    <div>Following items are not available now</div>
                  </div>
                  <div className="flex my-2 font-medium justify-between">
                    <div className=" capitalize">Item</div>
                    <div>Qty</div>
                  </div>
                  {notAvailable.map((item_not_available, index: number) => (
                    <div key={index} className="flex justify-between border-b border-dashed">
                      <div className=" capitalize">{item_not_available.name}</div>
                      <div className="mr-2">
                        {cart.find((item) => item.item_id === item_not_available.item_id)?.qty}
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 text-sm">
                    Please try removing the above items and try again
                  </div>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setErrorModal(false);
            }}
            className="w-full hover:bg-red-600 mt-2 bg-red-500 rounded-2xl text-white p-3 font-semibold"
          >
            OKAY
          </button>
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
            <Info className="mr-1" />
            {message}
          </div>
          <div onClick={() => setAlert(false)} className="cursor-pointer hover:bg-[#f3eded]">
            <Close />
          </div>
        </div>
      </Snackbar>
      <Modal
        open={openScheduleModal}
        onClose={() => {
          setOpenScheduleModal(false);
        }}
      >
        <ModalDialog style={{ width: "95vw" }}>
          <ModalClose style={{ zIndex: "10" }} />
          <DialogTitle>Schedule Your Order</DialogTitle>
          <DialogContent className="h-fit">
            {step === 0 && (
              <ScheduleDate
                scheduleData={scheduleData}
                setScheduleData={setScheduleData}
                setStep={setStep}
                checkOut={checkOut}
              />
            )}
            {step === 1 && (
              <ScheduleTime
                scheduleData={scheduleData}
                setScheduleData={setScheduleData}
                setStep={setStep}
                checkOut={checkOut}
              />
            )}
            {step === 2 && (
              <Confirmation
                scheduleData={scheduleData}
                handleScheduleSubmit={handleScheduleSubmit}
                loading={loading}
                setStep={setStep}
              />
            )}
          </DialogContent>
        </ModalDialog>
      </Modal>
    </div>
  );
};

export default Cart;
