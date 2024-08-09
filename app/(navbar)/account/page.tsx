"use client";
import React, { useEffect, useState, useRef } from "react";
import { getAuthCustomer } from "@/app/actions/cookie";
import { SwipeableDrawer } from "@mui/material";
import LoginPage from "../../order/page";
import { fetchBookingData, fetchOrdersByBookingId } from "@/app/actions/api";
import Image from "next/image";
import Logo from "../../assets/favicon.png";
import { useSearchParams } from "next/navigation";
import { CircularProgress } from "@mui/joy";

type ProfileData = {
  name: string;
  email: string;
};

type OrderType = {
  bookingId: string;
  orderId: string;
  orderedOn: string;
  items: {
    itemDescription: string;
    itemId: string;
    itemName: string;
    itemQty: number;
    itemPrice: number;
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

  const dataFetchedRef = useRef(false);
  useEffect(() => {
    const fetchAuthCustomer = async () => {
      const auth = await getAuthCustomer();
      if (auth && !dataFetchedRef.current) {
        dataFetchedRef.current = true;
        const result = await fetchBookingData(auth.bookingId as string);
        const data = { name: result.name as string, email: result.email as string };
        const orders = await fetchOrdersByBookingId(auth.bookingId as string);
        setOrders(orders);
        setProfileData(data);
        setSkeleton(false);
      } else if (!auth) {
        setPlaceOrderModal(true);
      }
    };

    fetchAuthCustomer();
  }, []);

  useEffect(() => {
    const fetchAuthCustomer = async () => {
      const auth = await getAuthCustomer();
      if (auth) {
        const result = await fetchBookingData(auth.bookingId as string);
        const data = { name: result.name as string, email: result.email as string };
        const orders = await fetchOrdersByBookingId(auth.bookingId as string);
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
      <div className="sticky top-0 z-10 bg-white shadow-lg ">
        <div className="flex justify-between mb-1 pt-4 p-2 items-center">
          <Image src={Logo} alt="Logo" width={36} height={36} />
          <div className="text-red-500 border p-1 rounded-2xl px-2 text-sm font-medium border-red-500">
            {" "}
            Room: {room}{" "}
          </div>
        </div>
      </div>
      {!skeleton ? (
        <div className="mt-5 p-2">
          <div className="border-2 shadow rounded-lg px-3 py-6 flex">
            <div className="bg-gray-300 w-20 h-20 rounded-full p-1 flex justify-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height={40} width={40}>
                <path
                  fill="#6b7280"
                  d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"
                />
              </svg>
            </div>
            <div className="ml-3 w-9/12">
              <div className="capitalize text-2xl text-red-500">{profileData.name}</div>
              <div className="mt-2 break-words text-sm">{profileData.email}</div>
            </div>
          </div>
          <div className="text-center my-2 text-xl text-red-500">Your Orders</div>
          <div>
            {orders.length===0?(<div>No past Orders</div>):(<div>
              { orders.map((order) => (
                <div key={order.orderId} className="border-2 shadow p-3 mb-2 rounded-lg">
                  <div className="flex justify-between">
                    <div className="text-xs">
                      Order Id: <span className="text-red-500">{order.orderId}</span>
                    </div>
                    <div className="text-xs">
                      Date: <span className="text-red-500">{formatDate(order.orderedOn)}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    {order.items.map((item) => (
                      <div key={item.itemId} className="text-sm flex justify-between py-1 border-b border-dashed">
                        {item.itemName} <span>Qty: <span className="text-red-500">{item.itemQty}</span></span>
                      </div>
                    ))}
                    <div className="mt-2 flex justify-between">
                      Total: <span className="text-red-500"> ₹ {calculateTotal(order.items).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>)
              
            }
            
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
    </div>
  );
}

export default Account;
