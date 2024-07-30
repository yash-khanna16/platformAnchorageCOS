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
        otp: otp
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
