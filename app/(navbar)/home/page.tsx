"use client";
import { Add, ArrowForward, Close, CurrencyRupee, Info, Remove, ShoppingCart } from "@mui/icons-material";
import Image from "next/image";
import Logo from "../../assets/favicon.png";
import Veg from "../../assets/veg.png";
import Nonveg from "../../assets/nonveg.png";
import React, { useEffect, useState } from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { fetchAllItems, fetchFeedbackCOS, fetchOrdersByBookingId, insertFeedbackCOS } from "../../actions/api";
import CircularProgress from "@mui/material/CircularProgress";
import Cart from "./Cart";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { DialogContent, DialogTitle, Modal, ModalClose, ModalDialog, Snackbar } from "@mui/joy";
import { starSmall, starUnfilledSmall } from "@/app/assets/icons";
import { getAuthCustomer } from "@/app/actions/cookie";
import { BookingInfoType } from "../timeline/page";
import Lottie from "lottie-react";
import animationdata from "@/app/assets/happy.json";

type MenuItem = {
  available: boolean;
  category: string;
  description: string;
  item_id: string;
  name: string;
  price: number;
  time_to_prepare: number;
  type: string;
};

export type CartType = MenuItem & { quantity: number };

type ItemsByCategory = Record<string, MenuItem[]>;

function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navbar, setNavbar] = useState("breakfast");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { cart, setCart } = useCart();
  const [items, setItems] = useState<ItemsByCategory>({});
  const [highlighted, setHighlighted] = useState("breakfast");
  const [isClicked, setIsClicked] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState("");

  const [categories, setCategories] = useState<string[]>([]);

  const params = useSearchParams();
  const room = params.get("room");
  const router = useRouter();

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  useEffect(() => {
    const fetchUser = async () => {
      console.log("here: ");
      const auth = (await getAuthCustomer()) as BookingInfoType;
      if (auth) {
        const feedback = (await fetchFeedbackCOS(auth.booking_id as string)) as {
          booking_id: string;
          comment: string;
          last_modified: string;
          rating: number;
          type: string;
        }[];
        const orders = await fetchOrdersByBookingId(auth.booking_id as string);
        console.log("orders: ", orders);
        console.log("feedback: ", feedback);
        if (!feedback.some((f) => f.type === "cos") && orders.length > 0) {
          console.log("here");
          const lastClosed = localStorage.getItem("cosFeedbackLastClosed");
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
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!room) {
      router.push("/not-found");
      console.log("room: ", room);
    }
  }, [room, router]);

  useEffect(() => {
    const getItems = async () => {
      try {
        const fetchedItems: MenuItem[] = await fetchAllItems();
        const availableItems = fetchedItems.filter((item) => item.available);
  
        const itemsByCategory = availableItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
          if (item.category && item.category !== "essentials") {
            if (!acc[item.category]) {
              acc[item.category] = [];
            }
            acc[item.category].push(item);
          }
          return acc;
        }, {});
  
        setItems(itemsByCategory);
        setCategories(Object.keys(itemsByCategory));
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
  
    setLoading(true);
    getItems();
  }, []);
  

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event && event.type === "keydown" && ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")) {
      return;
    }

    setCartOpen(open);
  };

  const handleClick = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      const yOffset = -125;
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y });
    }
  };

  const handleAddItem = (item: MenuItem) => {
    setCart((prevSelected) => {
      const existingItem = prevSelected.find((cartItem) => cartItem.item_id === item.item_id);
      if (existingItem) {
        return prevSelected.map((cartItem) => (cartItem.item_id === item.item_id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem));
      } else {
        return [...prevSelected, { ...item, quantity: 1 }];
      }
    });
  };

  const handleRemoveItem = (item: MenuItem) => {
    setCart((prevSelected) => {
      const existingItem = prevSelected.find((cartItem) => cartItem.item_id === item.item_id);
      if (existingItem && existingItem.quantity > 1) {
        return prevSelected.map((cartItem) => (cartItem.item_id === item.item_id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem));
      } else {
        return prevSelected.filter((cartItem) => cartItem.item_id !== item.item_id);
      }
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // useEffect(() => {
  //   const observerOptions = {
  //     root: null,
  //     rootMargin: "0px",
  //     threshold: 0.5,
  //   };

  //   const observerCallback = (entries: IntersectionObserverEntry[]) => {
  //     entries.forEach((entry) => {
  //       if (entry.isIntersecting) {
  //         setNavbar(entry.target.id);
  //       }
  //     });
  //   };

  //   const observer = new IntersectionObserver(observerCallback, observerOptions);

  //   sectionIds.forEach((id) => {
  //     const section = document.getElementById(id);
  //     if (section) {
  //       observer.observe(section);
  //     }
  //   });

  //   return () => {
  //     sectionIds.forEach((id) => {
  //       const section = document.getElementById(id);
  //       if (section) {
  //         observer.unobserve(section);
  //       }
  //     });
  //   };
  // }, [sectionIds]);

  useEffect(() => {
    const handleScroll = () => {
      const yOffset = window.pageYOffset + 128; // Adjusted offset to match the one used in handleClick
      let currentCategory = categories[0];

      categories.forEach((category) => {
        const section = document.getElementById(category);
        if (section) {
          const sectionTop = section.offsetTop;
          if (yOffset >= sectionTop) {
            currentCategory = category;
          }
        }
      });

      setNavbar(currentCategory);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [categories]);

  return (
    <div className="font-montserrat">
      <div>
        <SwipeableDrawer anchor={"bottom"} open={cartOpen} onClose={toggleDrawer(false)} onOpen={toggleDrawer(true)}>
          <Cart cartOpen={cartOpen} setCartOpen={setCartOpen} expandedId={expandedId} toggleExpand={toggleExpand} />
        </SwipeableDrawer>
      </div>
      <div className="sticky top-0 z-10 bg-white pb-4">
        <div className="flex justify-between mb-1 py-4 p-2 items-center">
          <div className="flex items-center gap-x-2">
            <Image
              src={Logo}
              alt="Logo"
              width={36}
              height={36}
              onClick={() => {
                setCartOpen(!cartOpen);
              }}
            />
            <div className="text-orange-500 border p-1 rounded-2xl px-3 font-semibold text-sm  bg-orange-50 border-orange-500"> BETA  </div>
          </div>

          <div className="text-red-500 border p-1 rounded-2xl px-2 text-sm font-medium border-red-500"> Room: {room} </div>
        </div>
        <div className="text-sm flex space-x-3 overflow-scroll hide-scrollbar font-medium px-2 text-gray-600">
          {categories.map((element, index) => (
            <span
              key={index}
              className={`${navbar === element ? "text-red-600 border-red-400" : ""} capitalize border px-3 py-1 rounded-2xl cursor-pointer`}
              onClick={() => {
                setNavbar(element);
                handleClick(element);
                // setIsClicked(true);
                // setTimeout(() => {
                //   setIsClicked(false);
                // }, 500);
              }}
            >
              {element}
            </span>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="h-screen flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <div className="">
          {Object.keys(items).map((key, index) => (
            <div key={index} id={key} className="px-3">
              <div className="my-2 text-2xl font-semibold mx-2 capitalize">{key}</div>
              {items[key].map((item) => {
                const selectedItem = cart.find((cartItem) => cartItem.item_id === item.item_id);
                return (
                  <div key={item.item_id} className="p-2 border-b border-gray-300 border-dashed">
                    <div className="flex justify-between items-center">
                      <div className="my-2">
                        <div className="inline">
                          <Image
                            src={item.type === "veg" ? Veg : Nonveg}
                            alt={item.type}
                            className="inline relative -top-0.5"
                            height={15}
                            width={15}
                          />
                        </div>
                        <span className="text-xl mt-1 ml-1 font-medium">{item.name}</span>
                        <div className="text-sm my-2">₹ {item.price}</div>
                        <div className="mt-3">
                          {expandedId === item.item_id ? (
                            <div className="text-sm leading-5">
                              {item.description}{" "}
                              <button className="font-medium text-blue-500" onClick={() => toggleExpand(item.item_id)}>
                                show less
                              </button>
                            </div>
                          ) : (
                            <div className="text-sm leading-5">
                              {item.description.split(" ").slice(0, 15).join(" ")}
                              {item.description.split(" ").slice(0, 15).length > 10 && "..."}
                              {item.description.split(" ").length > 10 && (
                                <button className="font-medium text-red-500 text-xs" onClick={() => toggleExpand(item.item_id)}>
                                  read more
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="font-medium ml-3 mt-1">
                        {selectedItem ? (
                          <div className="relative border-red-500 border w-24 py-2 px-8 text-red-500 rounded-lg bg-red-50 flex items-center justify-center">
                            <button onClick={() => handleRemoveItem(item)} className="absolute top-2 left-1">
                              <Remove fontSize="small" />
                            </button>
                            {selectedItem.quantity}
                            <button onClick={() => handleAddItem(item)} className="absolute top-2 right-1">
                              <Add fontSize="small" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddItem(item)}
                            className="relative border-red-500 border w-24 py-2 px-5 text-red-500 rounded-lg bg-red-50"
                          >
                            ADD
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
      {cart.length > 0 && (
        <div className="sticky bottom-20 rounded-2xl cursor-pointer z-50 bg-red-500 font-semibold text-center w-[95%] mx-auto text-white py-4">
          <div
            onClick={() => {
              setCartOpen(true);
            }}
          >
            <div className="flex justify-center items-center gap-x-2">
              <div>
                {cart.length} item{cart.length > 1 && "s"} added
              </div>
              <div className="-mt-[1px]">
                <ArrowForward />
              </div>
            </div>
          </div>
        </div>
      )}
      <Modal
        open={feedback}
        onClose={() => {
          localStorage.setItem("cosFeedbackLastClosed", Date.now().toString());
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
          <DialogTitle>How Was Your Ordering Experience?</DialogTitle>
          <ModalClose style={{ zIndex: "10" }} />
          <DialogContent className="h-fit">
            {!submitted && (
              <>
                <div>Did everything go smoothly with your order? Please rate your experience or share a suggestion</div>
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
                      localStorage.setItem("cosFeedbackLastClosed", Date.now().toString());
                      console.log(`response rating: ${rating} comment: ${comment} for cos`);
                      try {
                        const user = (await getAuthCustomer()) as BookingInfoType;
                        if (user) {
                          console.log("user: ", user);
                          await insertFeedbackCOS("cos", user?.booking_id, rating, comment);
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

export default Home;
