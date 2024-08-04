import { Add, ArrowForward, CurrencyRupee, Remove, ShoppingCart } from "@mui/icons-material";
import Image from "next/image";
import Logo from "../../assets/favicon.png";
import React, { useEffect, useState } from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import LoginPage from "../../order/page";
import { getAuthCustomer } from "@/app/actions/cookie";
import { placeOrder } from "@/app/actions/api";
import { useSearchParams } from "next/navigation";
import { Modal, ModalClose, ModalDialog, DialogContent } from "@mui/joy";
import { CheckCircle } from "@mui/icons-material";

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

type CartType = DataType & {
  quantity: number;
};

type CartPropsType = {
  selected: CartType[];
  setSelected: React.Dispatch<React.SetStateAction<CartType[]>>;
  cart: boolean;
  setCart: React.Dispatch<React.SetStateAction<boolean>>;
  expandedId: string | null;
  toggleExpand: (id: string) => void;
};

const Cart: React.FC<CartPropsType> = ({
  selected,
  cart,
  setCart,
  setSelected,
  expandedId,
  toggleExpand,
}) => {
  const [note, setNote] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteContentConfirm, setNoteContentConfirm] = useState("");
  const [noteError, setNoteError] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState(false);
  const [placeOrderModal, setPlaceOrderModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [timeToPrepare, setTimeToPrepare] = useState(0);
  const [total, setTotal] = useState(0);
  const searchParams = useSearchParams();
  const handlePlaceOrder = async () => {
    const auth = await getAuthCustomer();
    if (auth) {
      try {
        const room = searchParams.get("room");
        const items = selected.map((item: CartType) => {
          return { item_id: item.item_id, qty: item.quantity };
        });
        const dataSend = {
          order_id: "",
          booking_id: auth.bookingId as string,
          room: room,
          remarks: noteContentConfirm,
          created_at: "",
          status: "Placed",
          items: items,
        };
        console.log(dataSend);
        const result = await placeOrder(dataSend);
        console.log(result);
        let time_to_prepare=0;
        result.details.items.forEach((element:any) => {
          time_to_prepare=(time_to_prepare>element.time_to_prepare?time_to_prepare:element.time_to_prepare);
        });
        setTimeToPrepare(time_to_prepare);
        setConfirmModal(true);
      } catch (error) {
        console.log("Something went wrong,", error);
      }
    } else {
      setPlaceOrderModal(true);
    }
  };

  const handleAddItem = (item: DataType) => {
    setSelected((prevSelected) => {
      const existingItem = prevSelected.find((cartItem) => cartItem.item_id === item.item_id);
      if (existingItem) {
        return prevSelected.map((cartItem) =>
          cartItem.item_id === item.item_id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevSelected, { ...item, quantity: 1 }];
      }
    });
  };

  const handleRemoveItem = (item: DataType) => {
    setSelected((prevSelected) => {
      const existingItem = prevSelected.find((cartItem) => cartItem.item_id === item.item_id);
      if (existingItem && existingItem.quantity > 1) {
        return prevSelected.map((cartItem) =>
          cartItem.item_id === item.item_id
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prevSelected.filter((cartItem) => cartItem.item_id !== item.item_id);
      }
    });
  };

  useEffect(() => {
    setNoteError(false);
    setPlaceOrderError(false);
    let totalAmount = 0;
    selected.forEach((element) => {
      totalAmount += element.price * element.quantity;
    });
    setTotal(totalAmount);
  }, [selected]);

  return (
    <div>
      <div style={{ height: "100vh" }}>
        <div className="sticky top-0 z-10 bg-white border-b border-black">
          <div className="flex justify-between mb-1 p-2 items-center">
            <div className="flex items-end font-semibold text-2xl">
              <Image
                src={Logo}
                alt="Logo"
                width={30}
                height={30}
                onClick={() => {
                  setCart(!cart);
                }}
              />
              <span className="ml-2">Anchorage COS</span>
            </div>
            <ShoppingCart
              sx={{ color: "#111" }}
              className="relative top-0.5"
              onClick={() => setCart(!cart)}
            />
          </div>
        </div>
        <div className="p-3 text-xl font-medium border-b border-dashed ">Your Cart</div>

        {selected.map((item: CartType) => (
          <div key={item.item_id} className="p-3 border-b border-dashed">
            <div className="flex text-base justify-between">
              <div>
                <div className="text-lg">{item.name}</div>
                <div className="text-xs">
                  <CurrencyRupee fontSize="small" style={{ height: "10px" }} />
                  <span className="relative right-2">{item.price}</span>
                </div>
              </div>

              <div className="relative border-red-500 border w-20 h-8 text-red-500 rounded-lg bg-red-50 flex items-center justify-center">
                <button onClick={() => handleRemoveItem(item)} className="absolute top-1 left-1">
                  <Remove fontSize="small" />
                </button>
                {item.quantity}
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
                    className="font-medium text-blue-500"
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
                      className="font-medium text-blue-500"
                      onClick={() => toggleExpand(item.item_id)}
                    >
                      read more
                    </button>
                  )}
                </div>
              )}
              <div className="flex justify-end text-sm ml-2">
                <CurrencyRupee
                  className="relative top-0.5"
                  fontSize="small"
                  style={{ height: "15px" }}
                />
                <span>{item.price * item.quantity}</span>
              </div>
            </div>
          </div>
        ))}
        <button
          className="text-xs p-2 rounded-lg mt-2 mx-3 border"
          onClick={() => {
            if (selected.length > 0) {
              setNote(!note);
            } else {
              setNoteError(true);
            }
          }}
        >
          Add a note for the restaurant
        </button>
        {noteError && (
          <div className="p-2 mx-3 text-red-600 text-sm">
            At least add 1 item to add a note for the restaurant
          </div>
        )}
        <div className="p-3 flex justify-between text-lg pb-24">
          <span>Total :</span>
          <span>
            <CurrencyRupee fontSize="small" style={{ height: "15px" }} />
            {total}
          </span>
        </div>
        <div className="fixed px-3 bottom-3 w-full">
          {placeOrderError && (
            <div className="p-2 mx-3 text-center text-red-600 text-sm">
              At least add 1 item to place an order
            </div>
          )}
          <button
            className="p-3 border text-xl font-medium text-white border-red-600 w-full bg-red-500 rounded-full"
            onClick={() => {
              if (selected.length > 0) {
                handlePlaceOrder();
              } else {
                setPlaceOrderError(true);
              }
            }}
          >
            Place Order
          </button>
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
        <div className="bg-slate-200 px-4 py-2" style={{ height: "50vh" }}>
          <div className="mx-2 font-semibold text-gray-400">Add a note for the restaurant</div>
          <div className="p-3 mt-5 bg-white rounded-2xl">
            <textarea
              onChange={(e) => {
                setNoteContent(e.target.value);
              }}
              value={noteContent}
              rows={8}
              className="p-3 bg-slate-100 border w-full rounded-lg"
            />
          </div>
        </div>
        <div className="flex px-4 fixed bottom-4 w-full mt-5 gap-3">
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
        }}
      >
        <ModalDialog style={{ width: "90vw" }}>
          <ModalClose style={{ zIndex: "10" }} />
          <DialogContent className="h-fit">
            <div className="flex flex-col h-32 items-center overflow-hidden ">
              <CheckCircle className="h-20 scale-[300%] text-green-600" />
              <div className="font-semibold text-2xl text-center">Order Placed Successfully!</div>
            </div>
            <div className="flex text-lg font-medium justify-between">
            <div>Expected Waiting Time:</div>
            <div>{timeToPrepare} mins</div>
            </div>
            <div className="flex justify-between">
                <div className=" capitalize">Item</div>
                <div>Qty</div>
              </div>
            {selected.map((item: CartType) => (
              <div className="flex justify-between border-b border-dashed">
                <div className=" capitalize">{item.name}</div>
                <div className="mr-2">{item.quantity}</div>
              </div>
            ))}
          </DialogContent>
        </ModalDialog>
      </Modal>
    </div>
  );
};

export default Cart;
