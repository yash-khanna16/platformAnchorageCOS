"use client";
import { Add, ArrowForward, CurrencyRupee, Remove, ShoppingCart } from "@mui/icons-material";
import Image from "next/image";
import Logo from "../../assets/favicon.png";
import Veg from "../../assets/veg.png";
import Nonveg from "../../assets/nonveg.png";
import React, { useEffect, useState } from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";

type Anchor = "top" | "left" | "bottom" | "right";

function Home() {
  type DataType = {
    id: string;
    type: string;
    name: string;
    desc: string;
    price: number;
    food_type: string;
  };

  type CartType = {
    id: string;
    type: string;
    name: string;
    desc: string;
    price: number;
    food_type: string;
    quantity: number;
  };

  const [cart, setCart] = useState(false);
  const [note, setNote] = useState(false);
  const [total, setTotal] = useState(0);
  const [navbar, setNavbar] = useState("breakfast");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<CartType[]>([]);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event &&
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setCart(open);
  };

  const handleClick = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAddItem = (item: DataType) => {
    setSelected((prevSelected) => {
      const existingItem = prevSelected.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevSelected.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      } else {
        return [...prevSelected, { ...item, quantity: 1 }];
      }
    });
  };

  const handleRemoveItem = (item: DataType) => {
    setSelected((prevSelected) => {
      const existingItem = prevSelected.find((cartItem) => cartItem.id === item.id);
      if (existingItem && existingItem.quantity > 1) {
        return prevSelected.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
        );
      } else {
        return prevSelected.filter((cartItem) => cartItem.id !== item.id);
      }
    });
  };

  useEffect(() => {
    let total = 0;
    selected.forEach((element) => {
      total = total + element.price * element.quantity;
    });
    setTotal(total);
  }, [selected]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const contentNavbar = ["breakfast", "lunch", "dinner", "appetizer", "beverages"];
  const data: DataType[] = [
    {
      id: "123",
      type: "veg",
      name: "Burger",
      desc: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Impedit nesciunt, doloribus aperiam exercitationem fugit incidunt beatae ducimus earum blanditiis illo sint quo molestias perspiciatis, quis ad? Quidem explicabo eaque deserunt",
      price: 200,
      food_type: "breakfast",
    },
    {
      id: "124",
      type: "veg",
      name: "Pizza",
      desc: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Impedit nesciunt, doloribus aperiam exercitationem fugit incidunt beatae ducimus earum blanditiis illo sint quo molestias perspiciatis, quis ad? Quidem explicabo eaque deserunt",
      price: 300,
      food_type: "breakfast",
    },
    {
      id: "125-1", // Changed to avoid duplicate ID
      type: "nonveg",
      name: "Chicken Sandwich",
      desc: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Impedit nesciunt, doloribus aperiam exercitationem fugit incidunt beatae ducimus earum blanditiis illo sint quo molestias perspiciatis, quis ad? Quidem explicabo eaque deserunt",
      price: 250,
      food_type: "breakfast",
    },
    {
      id: "125-2", // Changed to avoid duplicate ID
      type: "nonveg",
      name: "Chicken Pizza",
      desc: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Impedit nesciunt, doloribus aperiam exercitationem fugit incidunt beatae ducimus earum blanditiis illo sint quo molestias perspiciatis, quis ad? Quidem explicabo eaque deserunt",
      price: 500,
      food_type: "breakfast",
    },
    {
      id: "124",
      type: "veg",
      name: "Pizza",
      desc: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Impedit nesciunt, doloribus aperiam exercitationem fugit incidunt beatae ducimus earum blanditiis illo sint quo molestias perspiciatis, quis ad? Quidem explicabo eaque deserunt",
      price: 300,
      food_type: "breakfast",
    },
    {
      id: "125-1", // Changed to avoid duplicate ID
      type: "nonveg",
      name: "Chicken Sandwich",
      desc: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Impedit nesciunt, doloribus aperiam exercitationem fugit incidunt beatae ducimus earum blanditiis illo sint quo molestias perspiciatis, quis ad? Quidem explicabo eaque deserunt",
      price: 250,
      food_type: "breakfast",
    },
    {
      id: "125-2", // Changed to avoid duplicate ID
      type: "nonveg",
      name: "Chicken Pizza",
      desc: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Impedit nesciunt, doloribus aperiam exercitationem fugit incidunt beatae ducimus earum blanditiis illo sint quo molestias perspiciatis, quis ad? Quidem explicabo eaque deserunt",
      price: 500,
      food_type: "breakfast",
    },
  ];

  return (
    <div className="font-sans">
      <div>
        <SwipeableDrawer
          anchor={"bottom"}
          open={cart}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
        >
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
              <div key={item.id} className="p-3 border-b border-dashed">
                <div className=" flex  text-base justify-between ">
                  <div>
                    <div className="text-lg">{item.name}</div>
                    <div className="text-xs"><CurrencyRupee fontSize="small" style={{height:"10px"}}/><span className="relative right-2">{item.price}</span></div>
                  </div>

                  <div className="relative border-red-500 border w-20 h-8 text-red-500 rounded-lg bg-red-50 flex items-center justify-center">
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="absolute top-1 left-1"
                    >
                      <Remove fontSize="small" />
                    </button>
                    {item.quantity}
                    <button onClick={() => handleAddItem(item)} className="absolute top-1 right-1">
                      <Add fontSize="small" />
                    </button>
                  </div>
                </div>
                <div className="mt-1 text-xs flex">
                  {expandedId === item.id ? (
                    <div>
                      {item.desc}{" "}
                      <button
                        className="font-medium text-blue-500"
                        onClick={() => toggleExpand(item.id)}
                      >
                        show less
                      </button>
                    </div>
                  ) : (
                    <div>
                      {item.desc.split(" ").slice(0, 10).join(" ")}...{" "}
                      <button
                        className="font-medium text-blue-500"
                        onClick={() => toggleExpand(item.id)}
                      >
                        read more
                      </button>
                    </div>
                  )}
                  <div className="flex text-sm ml-2"><CurrencyRupee className="relative top-0.5" fontSize="small" style={{height:"15px"}}/><span>{item.price * item.quantity}</span></div>
                </div>
              </div>
            ))}
            <button
              className="text-xs p-2 rounded-lg mt-2 mx-3 border"
              onClick={() => {
                if (selected.length > 0) {
                  setNote(!note);
                }
              }}
            >
              Add a note for the restaurant
            </button>
            <div className="p-3 flex justify-between text-lg">
              <span>Total :</span>
              <span>
              <CurrencyRupee  fontSize="small" style={{height:"15px"}}/>
              {total}
              </span>
            </div>
            <div className="fixed px-3 bottom-3 w-full">
              <button className="p-3 border text-xl font-medium  text-white border-red-600 w-full bg-red-500 rounded-full">
                Place Order
              </button>
            </div>
          </div>
          <SwipeableDrawer
            anchor={"bottom"}
            open={note}
            onClose={() => {
              setNote(false);
            }}
            onOpen={() => {
              setNote(true);
            }}
          >
            <div className="bg-slate-200 px-4 py-2" style={{ height: "50vh" }}>
              <div className="mx-2 font-semibold text-gray-400 ">Add a note for the restaurant</div>
              <div className="p-3 mt-5 bg-white rounded-2xl"><textarea rows={8} className="p-3 bg-slate-100  border w-full rounded-lg" /></div>
              
            </div>
            <div className="flex px-4 fixed bottom-4 w-full mt-5 gap-3">
              <button className="w-1/2 py-2 border text-red-500 font-medium text-lg rounded-lg">
                Clear
              </button>
              <button className="w-1/2 py-2 border  border-red-700 bg-red-500 text-white font-medium text-lg rounded-lg">
                Save
              </button>
            </div>
          </SwipeableDrawer>
        </SwipeableDrawer>
      </div>
      <div className="sticky top-0 z-10 bg-white border-b h-[75px] border-black">
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
        <div className="text-sm flex justify-between px-2 text-gray-600">
          {contentNavbar.map((element, index) => (
            <span
              key={index}
              className={`${
                navbar === element ? "text-blue-600 font-bold" : ""
              } capitalize cursor-pointer`}
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
      <div id="breakfast" className=" relative -top-20 pt-[90px] px-3">
        <div className="border-b text-2xl font-semibold border-black">Breakfast</div>
        {data.map((item) => {
          const selectedItem = selected.find((cartItem) => cartItem.id === item.id);
          return (
            <div key={item.id} className="p-2 border-b border-gray-300 border-dashed">
              <div className="flex justify-between items-center">
                <div className="mt-1">
                  {item.type === "veg" ? (
                    <div className="inline">
                      <Image
                        src={Veg}
                        alt="Veg-food"
                        className="inline relative -top-0.5"
                        height={15}
                        width={15}
                      />
                    </div>
                  ) : (
                    <div className="inline">
                      <Image
                        src={Nonveg}
                        alt="Nonveg-food"
                        className="inline relative -top-0.5"
                        height={15}
                        width={15}
                      />
                    </div>
                  )}
                  <span className="text-xl mt-1 ml-1 font-semibold">{item.name}</span>
                  <div className="text-sm mt-1">Rs. {item.price}</div>
                </div>
                <div className="font-medium mt-1">
                  {selectedItem ? (
                    <div className="relative border-red-500 border w-24 py-2 px-8 text-red-500 rounded-lg bg-red-50 flex items-center justify-center">
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="absolute top-2 left-1"
                      >
                        <Remove fontSize="small" />
                      </button>
                      {selectedItem.quantity}
                      <button
                        onClick={() => handleAddItem(item)}
                        className="absolute top-2 right-1"
                      >
                        <Add fontSize="small" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddItem(item)}
                      className="relative border-red-500 border w-24 py-2 px-5 text-red-500 rounded-lg bg-red-50"
                    >
                      ADD
                      <div className="absolute -top-1 right-0">
                        <Add className="scale-[65%]" />
                      </div>
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3">
                {expandedId === item.id ? (
                  <div className="text-sm leading-5">
                    {item.desc}{" "}
                    <button
                      className="font-medium text-blue-500"
                      onClick={() => toggleExpand(item.id)}
                    >
                      show less
                    </button>
                  </div>
                ) : (
                  <div className="text-sm leading-5">
                    {item.desc.split(" ").slice(0, 15).join(" ")}...{" "}
                    <button
                      className="font-medium text-blue-500"
                      onClick={() => toggleExpand(item.id)}
                    >
                      read more
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div id="lunch" className="pt-[80px] px-3">
        <div className="border-b text-2xl font-semibold border-black">Lunch</div>
        {data.map((item) => {
          const selectedItem = selected.find((cartItem) => cartItem.id === item.id);
          return (
            <div key={item.id} className="p-2 border-b border-gray-300 border-dashed">
              <div className="flex justify-between items-center">
                <div className="mt-1">
                  {item.type === "veg" ? (
                    <div className="inline">
                      <Image
                        src={Veg}
                        alt="Veg-food"
                        className="inline relative -top-0.5"
                        height={15}
                        width={15}
                      />
                    </div>
                  ) : (
                    <div className="inline">
                      <Image
                        src={Nonveg}
                        alt="Nonveg-food"
                        className="inline relative -top-0.5"
                        height={15}
                        width={15}
                      />
                    </div>
                  )}
                  <span className="text-xl mt-1 ml-1 font-semibold">{item.name}</span>
                  <div className="text-sm mt-1">Rs. {item.price}</div>
                </div>
                <div className="font-medium mt-1">
                  {selectedItem ? (
                    <div className="relative border-red-500 border w-24 py-2 px-8 text-red-500 rounded-lg bg-red-50 flex items-center justify-center">
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="absolute top-2 left-1"
                      >
                        <Remove fontSize="small" />
                      </button>
                      {selectedItem.quantity}
                      <button
                        onClick={() => handleAddItem(item)}
                        className="absolute top-2 right-1"
                      >
                        <Add fontSize="small" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddItem(item)}
                      className="relative border-red-500 border w-24 py-2 px-5 text-red-500 rounded-lg bg-red-50"
                    >
                      ADD
                      <div className="absolute -top-1 right-0">
                        <Add className="scale-[65%]" />
                      </div>
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3">
                {expandedId === item.id ? (
                  <div className="text-sm leading-5">
                    {item.desc}{" "}
                    <button
                      className="font-medium text-blue-500"
                      onClick={() => toggleExpand(item.id)}
                    >
                      show less
                    </button>
                  </div>
                ) : (
                  <div className="text-sm leading-5">
                    {item.desc.split(" ").slice(0, 15).join(" ")}...{" "}
                    <button
                      className="font-medium text-blue-500"
                      onClick={() => toggleExpand(item.id)}
                    >
                      read more
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div id="dinner" className="pt-[77px] text-2xl px-3 font-semibold">
        Dinner
      </div>
      <div id="appetizer" className="pt-[77px] text-2xl px-3 font-semibold">
        Appetizers
      </div>
      <div id="beverages" className="pt-[77px] text-2xl px-3 font-semibold">
        Beverages
      </div>
      
      <div className="fixed bottom-[64px] z-50 bg-red-500 font-semibold text-center w-full text-white p-3">
        {selected.length>0?(
          <div>{selected.length} items added <ArrowForward/></div>
        ):""}
      </div>
    </div>
    
  );
}

export default Home;
