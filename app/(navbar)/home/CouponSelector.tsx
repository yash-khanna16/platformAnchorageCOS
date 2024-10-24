import { ArrowBack } from "@mui/icons-material";
import { CircularProgress, Modal, ModalClose, ModalDialog, Sheet, Snackbar, Typography } from "@mui/joy";
import React, { useEffect, useState } from "react";
import { Coupon } from "./ApplyCoupon";
import { fetchAllCoupons, validateCoupon } from "@/app/actions/api";
import { useCart } from "@/lib/CartContext";
import { useFreeItems } from "@/lib/FreeCartContext";
import { getAuthCustomer } from "@/app/actions/cookie";

function CouponSelector({
  coupons,
  setValidatedCoupon,
  setCouponDialog,
  couponCode,
  setCouponCode,
  discount,
  setDiscount,
}: {
  coupons: Coupon[];
  setValidatedCoupon: React.Dispatch<React.SetStateAction<string>>;
  setCouponCode: React.Dispatch<React.SetStateAction<string>>;
  couponCode: string;
  setCouponDialog: React.Dispatch<React.SetStateAction<boolean>>;
  discount: number,
  setDiscount: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [couponLoading, setCouponLoading] = useState(false);
  const { cart, setCart } = useCart();
  const { freeItems, setFreeItems } = useFreeItems();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const validateCouponCode = async () => {
    try {
      setCouponLoading(true);

      // await sleep(1000);

      const couponId = coupons.find((coupon) => coupon.code === couponCode)?.coupon_id;
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
        const email = auth?.guest_email as string || "";
        const res = await validateCoupon(email, couponId, { items: modifiedCart });
        if (!res.success) {
          setOpen(true);
          setMessage(res.message);
        } else {
          // console.log("validated coupon: ", res);
          setDiscount(res.data.discount);
          setFreeItems(res.data.freeItems)
          setCouponDialog(false);
          setValidatedCoupon(couponCode)
          
        }
      } else {
        setOpen(true);
        setMessage("Invalid Code");
      }

      setCouponLoading(false);
    } catch (error) {
      console.log(error);
      setCouponLoading(false);
    }
  };

  return (
    <div>
      <div className="my-4 h-screen px-4">
        <div className=" font-montserrat fixed w-full top-4 left-0 px-4 py-1 shadow-sm bg-white ">
          <div className="flex space-x-3">
            <div
              onClick={() => {
                setCouponDialog(false);
              }}
            >
              <ArrowBack />
            </div>
            <div className="font-semibold">APPLY COUPON</div>
          </div>
          <div className="flex border-2 p-3 my-6 border-red-400 rounded-2xl">
            <input
              autoCapitalize=""
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
              }}
              type="text"
              className=" uppercase font-semibold  w-full outline-none rounded-lg"
            />
            <button
              disabled={couponCode === ""}
              onClick={validateCouponCode}
              className={`text-sm ${
                couponCode === "" ? "text-slate-400" : "text-red-400"
              }  h-8 flex items-center font-semibold outline-none rounded-lg px-2  p-2 `}
            >
              {couponLoading ? <CircularProgress size="sm" color="danger" /> : "APPLY"}{" "}
            </button>
          </div>
        </div>
        <div className="space-y-3 overflow-auto hide-scrollbar h-[90vh] py-8 mt-[130px]">
          {coupons.map((coupon, index) => (
            <div key={index} className="flex border font-montserrat justify-between shadow-md rounded-2xl p-4 ">
              <div>
                <div className="font-semibold text-green-700 my-3">{coupon.coupon_type_description}</div>
                <div className="mt-1 mb-3 font-bold">{coupon.code}</div>
                <div className="text-sm text-slate-600">{coupon.description}</div>
              </div>
              <div
                onClick={() => {
                  setCouponCode(coupon.code);
                }}
                className="text-sm  text-red-400 font-semibold my-4"
              >
                APPLY
              </div>
            </div>
          ))}
          {coupons.length === 0 && (
            <div className="font-montserrat font-semibold text-center text-gray-600">No Coupons Available</div>
          )}
        </div>
      </div>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Sheet variant="outlined" sx={{ width: 300, borderRadius: "md", p: 3, boxShadow: "lg" }}>
          <ModalClose variant="plain" sx={{ m: 1 }} />
          <Typography component="h2" id="modal-title" level="h4" textColor="inherit" sx={{ fontWeight: "lg", mb: 1 }}>
            Coupon
          </Typography>
          <Typography id="modal-desc" textColor="text.tertiary">
            <div className="capitalize">{message}</div>
          </Typography>
        </Sheet>
      </Modal>
    </div>
  );
}

export default CouponSelector;
