"use client";
import { Add, ArrowForward, Remove } from "@mui/icons-material";
import Image from "next/image";
import Logo from "../../assets/favicon.png";
import React, { useEffect, useState } from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { fetchAllItems } from "../../actions/api";
import CircularProgress from "@mui/material/CircularProgress";
import Cart from "./EssentialCart";
import { useRouter, useSearchParams } from "next/navigation";
import { useEssentialsCart } from "@/lib/EssentialsCartContext";
import { sendGAEvent } from "@next/third-parties/google";

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

function Essentials() {
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const { cartEssentials, setCartEssentials } = useEssentialsCart();
  const params = useSearchParams();
  const room = params.get("room");
  const router = useRouter();

  useEffect(() => {
    if (!room) {
      router.push("/not-found");
      console.log("room: ", room);
    }
  }, [room, router]);

  useEffect(() => {
    const getItems = async () => {
      try {
        const fetchedItems: MenuItem[] = await fetchAllItems("");
        const availableItems = fetchedItems.filter((item) => item.available === true && item.category === "essentials");
        setItems(availableItems);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    setLoading(true);
    getItems();
  }, []);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event &&
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setCartOpen(open);
  };

  const handleAddItem = (item: MenuItem) => {
    setCartEssentials((prevSelected) => {
      const existingItem = prevSelected.find((cartItem) => cartItem.item_id === item.item_id);
      if (existingItem) {
        return prevSelected.map((cartItem) =>
          cartItem.item_id === item.item_id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      } else {
        return [...prevSelected, { ...item, quantity: 1 }];
      }
    });
  };

  const handleRemoveItem = (item: MenuItem) => {
    setCartEssentials((prevSelected) => {
      const existingItem = prevSelected.find((cartItem) => cartItem.item_id === item.item_id);
      if (existingItem && existingItem.quantity > 1) {
        return prevSelected.map((cartItem) =>
          cartItem.item_id === item.item_id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
        );
      } else {
        return prevSelected.filter((cartItem) => cartItem.item_id !== item.item_id);
      }
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="font-montserrat">
      <div>
        <SwipeableDrawer anchor={"bottom"} open={cartOpen} onClose={toggleDrawer(false)} onOpen={toggleDrawer(true)}>
          <Cart cartOpen={cartOpen} setCartOpen={setCartOpen} expandedId={expandedId} toggleExpand={toggleExpand} />
        </SwipeableDrawer>
      </div>
      <div className="sticky shadow-md top-0 z-10 bg-white">
        <div className="flex justify-between mb-1 py-4 p-2 items-center">
          <Image
            src={Logo}
            alt="Logo"
            width={36}
            height={36}
            onClick={() => {
              setCartOpen(!cartOpen);
            }}
          />
          <div className="text-red-500 border p-1 rounded-2xl px-2 text-sm font-medium border-red-500"> Room: {room} </div>
        </div>
      </div>
      {loading ? (
        <div className="h-screen flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <div className="min-h-[80vh]">
          {items.map((item) => {
            const selectedItem = cartEssentials.find((cartItem) => cartItem.item_id === item.item_id);
            return (
              <div key={item.item_id} className="p-2 border-b border-gray-300 border-dashed">
                <div className="flex justify-between items-center">
                  <div className="my-2">
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
                          {item.description.split(" ").length > 15 && "..."}
                          {item.description.split(" ").length > 15 && (
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
      )}
      {cartEssentials.length > 0 && (
        <div className="sticky bottom-20 rounded-2xl cursor-pointer z-50 bg-red-500 font-semibold text-center w-[95%] mx-auto text-white py-4">
          <div
            onClick={() => {
              sendGAEvent("event", "openCartEssentials", { value: cartOpen });
              setCartOpen(true);
            }}
          >
            <div className="flex justify-center items-center gap-x-2">
              <div>
                {cartEssentials.length} item{cartEssentials.length > 1 && "s"} added
              </div>
              <div className="-mt-[1px]">
                <ArrowForward />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Essentials;
