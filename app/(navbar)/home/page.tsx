"use client";
import { Add, ArrowForward, CurrencyRupee, Remove, ShoppingCart } from "@mui/icons-material";
import Image from "next/image";
import Logo from "../../assets/favicon.png";
import Veg from "../../assets/veg.png";
import Nonveg from "../../assets/nonveg.png";
import React, { useEffect, useState } from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { fetchAllItems } from "../../actions/api";
import CircularProgress from "@mui/material/CircularProgress";
import Cart from "./Cart";
import { useParams, useSearchParams } from "next/navigation";

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

type CartType = {
  available: boolean;
  category: string;
  description: string;
  item_id: string;
  name: string;
  price: number;
  time_to_prepare: number;
  type: string;
  quantity: number;
};

type ItemsByCategory = Record<string, MenuItem[]>;
function Home() {
  const [cart, setCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navbar, setNavbar] = useState("breakfast");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<CartType[]>([]);
  const [items, setItems] = useState<ItemsByCategory>({});

  const [categories, setCategories] = useState<string[]>([]);

  const params = useSearchParams();
  const room = params.get("room");

  useEffect(() => {
    const getItems = async () => {
      try {
        const items: MenuItem[] = await fetchAllItems();
        const itemsByCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = [];
          }
          acc[item.category].push(item);
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
    if (
      event &&
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setCart(open);
  };

  const handleClick = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      const yOffset = -128; // Offset value
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleAddItem = (item: MenuItem) => {
    setSelected((prevSelected) => {
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
    setSelected((prevSelected) => {
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
    <div className=" font-montserrat">
      <div>
        <SwipeableDrawer anchor={"bottom"} open={cart} onClose={toggleDrawer(false)} onOpen={toggleDrawer(true)}>
          <Cart
            selected={selected}
            cart={cart}
            setCart={setCart}
            setSelected={setSelected}
            expandedId={expandedId}
            toggleExpand={toggleExpand}
          />
        </SwipeableDrawer>
      </div>
      <div className="sticky top-0 z-10 bg-white   pb-4">
        <div className="flex justify-between mb-1 py-4 p-2 items-center">
          <Image
            src={Logo}
            alt="Logo"
            width={36}
            height={36}
            onClick={() => {
              setCart(!cart);
            }}
          />
          <div className="text-red-500 border p-1 rounded-2xl px-2 text-sm font-medium  border-red-500"> Room: {room} </div>
        </div>
        <div className="text-sm flex space-x-3 overflow-scroll hide-scrollbar font-medium px-2 text-gray-600">
          {categories.map((element, index) => (
            <span
              key={index}
              className={`${
                navbar === element ? "text-red-600 border-red-400" : ""
              } capitalize border px-3 py-1 rounded-2xl   cursor-pointer`}
              onClick={() => {
                setNavbar(element);
                handleClick(element);
              }}
            >
              {element}
            </span>
          ))}
        </div>
      </div>
      {loading === true ? (
        <div className="h-screen flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <div className="">
          {Object.keys(items).map((key, index: number) => (
            <div key={index} id={key} className=" px-3">
              <div className="my-2 text-2xl font-semibold mx-2 capitalize">{key}</div>
              {items[key].map((item) => {
                const selectedItem = selected.find((cartItem) => cartItem.item_id === item.item_id);
                return (
                  <div key={item.item_id} className="p-2  border-b border-gray-300 border-dashed">
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
                          <div className="relative border-red-500 border w-24  py-2 px-8 text-red-500 rounded-lg bg-red-50 flex items-center justify-center">
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
                            className="relative border-red-500 border w-24  py-2 px-5 text-red-500 rounded-lg bg-red-50"
                          >
                            ADD
                            {/* <div className="absolute -top-1 right-0">
                              <Add className="scale-[60%]" />
                            </div> */}
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
      {selected.length > 0 && (
        <div className="sticky bottom-20 rounded-2xl cursor-pointer z-50 bg-red-500 font-semibold text-center w-[95%] mx-auto text-white py-4">
          <div
            onClick={() => {
              setCart(true);
            }}
          >
            <div className="flex justify-center items-center gap-x-2">
              <div>
                {selected.length} item{selected.length > 1 && "s"} added
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

export default Home;
