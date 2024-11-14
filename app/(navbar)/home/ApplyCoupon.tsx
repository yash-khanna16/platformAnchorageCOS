import { ArrowBack, ChevronRight, Error, KeyboardArrowRight } from "@mui/icons-material";
import { CircularProgress, Modal, ModalDialog } from "@mui/joy";
import { SwipeableDrawer } from "@mui/material";
import React, { useEffect, useState } from "react";
import CouponSelector from "./CouponSelector";
import { fetchAllCoupons, validateCoupon } from "@/app/actions/api";
import { useFreeItems } from "@/lib/FreeCartContext";
import { getAuthCustomer } from "@/app/actions/cookie";
import { useCart } from "@/lib/CartContext";
import { sendGAEvent } from "@next/third-parties/google";

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
  validatedCoupon: string;
  setValidatedCoupon: React.Dispatch<React.SetStateAction<string>>;
  coupons: Coupon[];
}) {
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDialog, setCouponDialog] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const { freeItems, setFreeItems } = useFreeItems();
  const [successModal, setSuccessModal] = useState(false)
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  const {cart, setCart} = useCart();

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

  
  const validateCouponCode = async (code: string) => {
    try {
      setCouponLoading(true);

      // await sleep(1000);

      const couponId = coupons.find((coupon) => coupon.code === code)?.coupon_id;
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
          setOpen(true);
          setMessage(res.message);
        } else {
          // console.log("validated coupon: ", res);
          setSuccessModal(true);
          setDiscount(res.data.discount);
          setFreeItems(res.data.freeItems);
          setCouponDialog(false);
          setValidatedCoupon(code);
        }
      } else {
        setOpen(true);
        setMessage("Invalid Coupon Code");
      }

      setCouponLoading(false);
    } catch (error) {
      console.log(error);
      setCouponLoading(false);
    }
  };


  return (
    <>
      <div className="m-2 font-montserrat shadow-md border bg-white rounded-2xl  font-semibold">
        {validatedCoupon === "" && (
          <>
            {coupons.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center  m-4">
                  <div>
                    <div className="">{coupons[0].code}</div>
                    <div className="text-xs font-normal text-slate-800">{coupons[0].description}</div>
                  </div>
                  <button disabled={couponLoading} onClick={()=>{sendGAEvent("event", "apply-coupon");validateCouponCode(coupons[0].code)}} className="text-xs w-[40%] text-right text-red-600">
                    {couponLoading ? <CircularProgress color="danger" size="md" /> :"APPLY"}

                  </button>
                </div>
                <div
                  onClick={() => {
                    setCouponDialog(true);
                  }}
                  className="text-sm w-full text-slate-600 border-t-2 border-dashed p-3   my-4 text-center"
                >
                  TAP HERE TO VIEW MORE COUPONS
                </div>
              </div>
            )}
            {coupons.length === 0 && (
              <div
                className="flex p-4 justify-between"
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
          </>
        )}
        {validatedCoupon !== "" && (
          <div className="my-1 p-4">
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
                  setFreeItems([]);
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

<Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={successModal}
        onClose={() => setSuccessModal(false)}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <ModalDialog sx={{ maxWidth: 800 }} className="p-5 font-montserrat rounded-2xl py-6">
          <div className="font-medium text-sm text-center text-slate-600 ">

            <div className=""> {"'"}{validatedCoupon}{"'"} applied </div>
          </div>
          
            <div className="font-semibold text-slate-900 text-xl text-center">₹{discount} saved with this coupon</div>
          <button onClick={()=>{setSuccessModal(false)}} className="w-full hover:bg-red-600 bg-red-500 rounded-2xl text-white p-3 font-semibold">LESS GOOO!!!</button>
        </ModalDialog>
      </Modal>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <ModalDialog sx={{ maxWidth: 800 }} className="p-5 font-montserrat rounded-2xl py-6">
          <div className="font-semibold text- text-slate-600 flex gap-x-3 items-center">
            <div>
              <Error className="text-red-600" fontSize="large" />
            </div>
            <div className="">{message}</div>
          </div>
          <button onClick={()=>{setOpen(false)}} className="w-full hover:bg-red-600 mt-2 bg-red-500 rounded-2xl text-white p-3 font-semibold">OKAY</button>
        </ModalDialog>
      </Modal>

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
