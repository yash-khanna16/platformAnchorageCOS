"use client";
import { Add, ArrowForward, CurrencyRupee, Remove, ShoppingCart} from "@mui/icons-material";
import Image from "next/image";
import Logo from "../../assets/favicon.png";
import Veg from "../../assets/veg.png";
import Nonveg from "../../assets/nonveg.png";
import React, { useEffect, useState } from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { fetchAllItems } from "../../actions/api";
import CircularProgress from "@mui/material/CircularProgress";
import Cart from "./Cart"

function Home() {
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

  const [cart, setCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navbar, setNavbar] = useState("breakfast");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<CartType[]>([]);
  const [breakfast, setBreakfast] = useState<DataType[]>([]);
  const [lunch, setLunch] = useState<DataType[]>([]);
  const [dinner, setDinner] = useState<DataType[]>([]);
  const [appetizer, setAppetizer] = useState<DataType[]>([]);
  const [beverages, setBeverages] = useState<DataType[]>([]);

  useEffect(() => {
    const getItems = async () => {
      try {
        const result = await fetchAllItems();
        const breakfastList = result.filter(
          (item: DataType) => item.category === "Breakfast" && item.available === true
        );
        const lunchList = result.filter(
          (item: DataType) => item.category === "Lunch" && item.available === true
        );
        const dinnerList = result.filter(
          (item: DataType) => item.category === "Dinner" && item.available === true
        );
        const appetizerList = result.filter(
          (item: DataType) => item.category === "Appetizer" && item.available === true
        );
        const beveragesList = result.filter(
          (item: DataType) => item.category === "Beverages" && item.available === true
        );
        setBreakfast(breakfastList);
        setLunch(lunchList);
        setDinner(dinnerList);
        setAppetizer(appetizerList);
        setBeverages(beveragesList);
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

  

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const contentNavbar = ["breakfast", "lunch", "dinner", "appetizer", "beverages"];
  return (
    <div className="font-sans">
      <div>
        <SwipeableDrawer
          anchor={"bottom"}
          open={cart}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
        >
          <Cart selected={selected} cart={cart} setCart={setCart} setSelected={setSelected} expandedId={expandedId} toggleExpand={toggleExpand}/>
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
      {loading === true ? (
        <div className="h-screen flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <div className="relative -top-20">
          <div id="breakfast" className=" pt-[90px] px-3">
            <div className="border-b text-2xl font-semibold border-black">Breakfast</div>
            {breakfast.map((item) => {
              const selectedItem = selected.find((cartItem) => cartItem.item_id === item.item_id);
              return (
                <div key={item.item_id} className="p-2 border-b border-gray-300 border-dashed">
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
                      <span className="text-xl mt-1 ml-1 font-medium">{item.name}</span>
                      <div className="text-sm mt-1">
                        <CurrencyRupee
                          fontSize="small"
                          style={{ height: "13px" }}
                          className=" relative -top-0.5"
                        />
                        <span className=" relative right-1">{item.price}</span>
                      </div>
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
                    {expandedId === item.item_id ? (
                      <div className="text-sm leading-5">
                        {item.description}{" "}
                        <button
                          className="font-medium text-blue-500"
                          onClick={() => toggleExpand(item.item_id)}
                        >
                          show less
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm leading-5">
                        {item.description.split(" ").slice(0, 15).join(" ")}...{" "}
                        {item.description.split(" ").length > 10 && (
                          <button
                            className="font-medium text-blue-500"
                            onClick={() => toggleExpand(item.item_id)}
                          >
                            read more
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div id="lunch" className="pt-[80px] px-3">
            <div className="border-b text-2xl font-semibold border-black">Lunch</div>
            {lunch.map((item) => {
              const selectedItem = selected.find((cartItem) => cartItem.item_id === item.item_id);
              return (
                <div key={item.item_id} className="p-2 border-b border-gray-300 border-dashed">
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
                      <span className="text-xl mt-1 ml-1 font-medium">{item.name}</span>
                      <div className="text-sm mt-1">
                        <CurrencyRupee
                          fontSize="small"
                          style={{ height: "13px" }}
                          className=" relative -top-0.5"
                        />
                        <span className=" relative right-1">{item.price}</span>
                      </div>
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
                    {expandedId === item.item_id ? (
                      <div className="text-sm leading-5">
                        {item.description}{" "}
                        <button
                          className="font-medium text-blue-500"
                          onClick={() => toggleExpand(item.item_id)}
                        >
                          show less
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm leading-5">
                        {item.description.split(" ").slice(0, 15).join(" ")}...{" "}
                        {item.description.split(" ").length > 10 && (
                          <button
                            className="font-medium text-blue-500"
                            onClick={() => toggleExpand(item.item_id)}
                          >
                            read more
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div id="dinner" className="pt-[80px] px-3">
            <div className="border-b text-2xl font-semibold border-black">Dinner</div>
            {dinner.map((item) => {
              const selectedItem = selected.find((cartItem) => cartItem.item_id === item.item_id);
              return (
                <div key={item.item_id} className="p-2 border-b border-gray-300 border-dashed">
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
                      <span className="text-xl mt-1 ml-1 font-medium">{item.name}</span>
                      <div className="text-sm mt-1">
                        <CurrencyRupee
                          fontSize="small"
                          style={{ height: "13px" }}
                          className=" relative -top-0.5"
                        />
                        <span className=" relative right-1">{item.price}</span>
                      </div>
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
                    {expandedId === item.item_id ? (
                      <div className="text-sm leading-5">
                        {item.description}{" "}
                        <button
                          className="font-medium text-blue-500"
                          onClick={() => toggleExpand(item.item_id)}
                        >
                          show less
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm leading-5">
                        {item.description.split(" ").slice(0, 15).join(" ")}...{" "}
                        {item.description.split(" ").length > 10 && (
                          <button
                            className="font-medium text-blue-500"
                            onClick={() => toggleExpand(item.item_id)}
                          >
                            read more
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div id="appetizer" className="pt-[80px] px-3">
            <div className="border-b text-2xl font-semibold border-black">Appetizer</div>
            {appetizer.map((item) => {
              const selectedItem = selected.find((cartItem) => cartItem.item_id === item.item_id);
              return (
                <div key={item.item_id} className="p-2 border-b border-gray-300 border-dashed">
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
                      <span className="text-xl mt-1 ml-1 font-medium">{item.name}</span>
                      <div className="text-sm mt-1">
                        <CurrencyRupee
                          fontSize="small"
                          style={{ height: "13px" }}
                          className=" relative -top-0.5"
                        />
                        <span className=" relative right-1">{item.price}</span>
                      </div>
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
                    {expandedId === item.item_id ? (
                      <div className="text-sm leading-5">
                        {item.description}{" "}
                        <button
                          className="font-medium text-blue-500"
                          onClick={() => toggleExpand(item.item_id)}
                        >
                          show less
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm leading-5">
                        {item.description.split(" ").slice(0, 15).join(" ")}...{" "}
                        {item.description.split(" ").length > 10 && (
                          <button
                            className="font-medium text-blue-500"
                            onClick={() => toggleExpand(item.item_id)}
                          >
                            read more
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div id="beverages" className="pt-[80px] px-3">
            <div className="border-b text-2xl font-semibold border-black">Beverages</div>
            {beverages.map((item) => {
              const selectedItem = selected.find((cartItem) => cartItem.item_id === item.item_id);
              return (
                <div key={item.item_id} className="p-2 border-b border-gray-300 border-dashed">
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
                      <span className="text-xl mt-1 ml-1 font-medium">{item.name}</span>
                      <div className="text-sm mt-1">
                        <CurrencyRupee
                          fontSize="small"
                          style={{ height: "13px" }}
                          className=" relative -top-0.5"
                        />
                        <span className=" relative right-1">{item.price}</span>
                      </div>
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
                    {expandedId === item.item_id ? (
                      <div className="text-sm leading-5">
                        {item.description}{" "}
                        <button
                          className="font-medium text-blue-500"
                          onClick={() => toggleExpand(item.item_id)}
                        >
                          show less
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm leading-5">
                        {item.description.split(" ").slice(0, 15).join(" ")}...{" "}
                        {item.description.split(" ").length > 10 && (
                          <button
                            className="font-medium text-blue-500"
                            onClick={() => toggleExpand(item.item_id)}
                          >
                            read more
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {selected.length > 0 && (
        <div className="fixed bottom-[64px] cursor-pointer rounded-t-2xl z-50 bg-red-500 font-semibold text-center w-full text-white p-3">
          <div
            onClick={() => {
              setCart(true);
            }}
          >
            {selected.length} items added <ArrowForward />
          </div>
        </div>
      )}
      
    </div>
  );
}

export default Home;
