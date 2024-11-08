"use server";
import uploadFile from "react-s3";

export async function fetchBookingByRoom(room: string) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/fetchBookingByRoom`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        room: room,
      },
      cache: "no-cache",
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      const error = new Error(await response.text());
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function sendOTPByEmail(email: string) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/sendOTPbyEmail`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        email: email,
      },
      cache: "no-cache",
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      const error = new Error(await response.text());
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function verifyOTP(email: string, otp: string) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/verifyOTP`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        email: email,
        otp: otp,
      },
      cache: "no-cache",
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      const error = new Error(await response.text());
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function fetchAllItems() {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/fetchAllItems`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      const error = new Error(await response.text());
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function placeOrder(dataSend: {
  order_id: string;
  booking_id: string;
  room: string | null;
  remarks: string;
  created_at: string;
  status: string;
  email: string;
  items: { item_id: string; qty: number }[];
  coupon_id: string | null;
}) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/addOrder`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderDetails: dataSend }),
      cache: "no-cache",
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      if (response.status === 401) {
        return { status: 401, data: data };
      }
      const error = new Error(await response.text());
      throw error;
    }
    return { status: response.status, data: data };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function fetchBookingData(bookingId: string) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/fetchBookingByBookingId`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        bookingid: bookingId,
      },
      cache: "no-cache",
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      const error = new Error(await response.text());
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function fetchOrdersByBookingId(bookingId: string) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/fetchOrdersByBookingId`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        bookingid: bookingId,
      },
      cache: "no-cache",
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      const error = new Error(await response.text());
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function fetchSchedule(bookingId: string) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/fetchSchedule`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        bookingid: bookingId,
      },
      cache: "no-cache",
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      const error = new Error(await response.text());
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function updateFeedback(rating: number, feedback: string, orderid: string) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/updateFeedback`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        orderid: orderid,
        rating: rating.toString(),
        feedback: feedback,
      },
      cache: "no-cache",
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      const error = new Error(await response.text());
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function fetchFeedbackCOS(booking_id: string) {
  try {
    console.log(`${process.env.BACKEND_URL}/api/cos/fetchFeedbackCOS`);
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/fetchFeedbackCOS`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        bookingid: booking_id,
      },
      cache: "no-cache",
    });
    console.log("response of feedback: ", response);

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      const error = new Error(await response.text());
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function insertFeedbackCOS(type: string, booking_id: string, rating: number, comment: string) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/insertFeedbackCOS`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: type, bookingid: booking_id, rating: rating, comment: comment }),
      cache: "no-cache",
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      const error = new Error(await response.text());
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function fetchAllCoupons(email: string) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/fetchAllCoupons`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        email: email,
      },
      cache: "no-cache",
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      const error = new Error(await response.text());
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function validateCoupon(
  email: string,
  coupon_id: string,
  cart: {
    items: { item_id: string; qty: number }[];
  }
) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/validateCoupon`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        coupon_id: coupon_id,
        cart: cart,
      }),
      cache: "no-cache",
    });

    const responseBody = await response.text(); // Read the response body as text first

    // Attempt to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseBody);
    } catch (jsonError) {
      // Handle cases where the response is not JSON
      return {
        success: false,
        message: "Oops! Something went wrong. Please try again later.",
      };
    }

    // Check if the response was okay
    if (!response.ok) {
      if (response.status === 405) {
        return {
          success: false,
          message: data.message, // Use the response body directly for the message
        };
      } else {
        return {
          success: false,
          message: "Internal Server Error",
        };
      }
    }
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "A network error occurred. Please try again later.",
    };
  }
}
export async function allBookingData(room: string) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/fetchCheckInByBoom`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        room: room
      },
      cache: "no-cache",
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      const error = new Error(await response.text());
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function checkinGuest(booking_id: string, documentURL: string, email: string, room: string, name: string) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/checkinGuest`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({booking_id: booking_id, document_url: documentURL, email: email, room: room, name: name}),
      cache: "no-cache",
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      const error = new Error(await response.text());
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
