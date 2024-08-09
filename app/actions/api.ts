"use server";

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
  room: string|null;
  remarks: string;
  created_at: string;
  status: string;
  items: { item_id: string; qty: number }[];
}) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/cos/addOrder`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({orderDetails:dataSend}),
      cache: "no-cache",
    });

    const data = await response.json(); // Parse the JSON response
    if (!response.ok) {
      if (response.status === 401) {
        return {status: 401, data: data}
      }
      const error = new Error(await response.text());
      throw error;
    }
    return {status: response.status, data:data};
  } catch (error) {
    console.log(error);
    throw error;
  }
}
