import { ArrowBack, ChevronRight, KeyboardArrowRight } from "@mui/icons-material";
import { CircularProgress } from "@mui/joy";
import { SwipeableDrawer } from "@mui/material";
import React, { useEffect, useState } from "react";
import CouponSelector from "./CouponSelector";
import { fetchAllCoupons, validateCoupon } from "@/app/actions/api";
import { useFreeItems } from "@/lib/FreeCartContext";

export type Coupon = {
  coupon_id: string;
  code: string;
  description: string;
  coupon_type: "free_item" | "buy_one_get_one" | "percentage_discount" | "fixed_discount" | "free_delivery";
  coupon_type_description: string; // Human-readable description of the coupon type
  discount_value: number;
  min_order_value: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  is_active: boolean;
};

function ApplyCoupon({
  discount,
  setDiscount,
  validatedCoupon,
  setValidatedCoupon,
  coupons,
}: {
  discount: number;
  setDiscount: React.Dispatch<React.SetStateAction<number>>;
  validatedCoupon: string,
  setValidatedCoupon: React.Dispatch<React.SetStateAction<string>>;
  coupons: Coupon[],
}) {
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDialog, setCouponDialog] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const {freeItems, setFreeItems} = useFreeItems();

  // Example array of Coupon objects with coupon_type_description

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event &&
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setCouponDialog(open);
  };

  return (
    <>
      <div className="m-2 font-montserrat shadow-md border bg-white rounded-2xl p-4 font-semibold">
        {validatedCoupon === "" && (
          <div
            className="flex justify-between"
            onClick={() => {
              setCouponDialog(true);
            }}
          >
            <div>Apply Coupon</div>
            <div>
              <KeyboardArrowRight className="text-gray-700" />{" "}
            </div>
          </div>
        )}
        {validatedCoupon !== "" && (
          <div className="my-1">
            <div className=" flex justify-between items-center">
              <div>
                {"'"}
                {validatedCoupon}
                {"'"} <span className="font-base">applied</span>
              </div>
              <div
                onClick={() => {
                  setValidatedCoupon("");
                  setCouponCode("");
                  setDiscount(0);
                  setFreeItems([])
                }}
                className="text-red-400 text-xs font-bold"
              >
                Remove
              </div>
            </div>
            <div className="text-sm font-semibold my-1">
              <span className="text-red-400">₹{discount}</span> saved
            </div>
          </div>
        )}

        <SwipeableDrawer anchor={"bottom"} open={couponDialog} onClose={toggleDrawer(false)} onOpen={toggleDrawer(true)}>
          <CouponSelector
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            coupons={coupons}
            setValidatedCoupon={setValidatedCoupon}
            setCouponDialog={setCouponDialog}
            discount={discount}
            setDiscount={setDiscount}
          />
        </SwipeableDrawer>
      </div>
    </>
  );
}

export default ApplyCoupon;
