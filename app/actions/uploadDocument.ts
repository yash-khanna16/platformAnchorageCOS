"use server";

import AWS from "aws-sdk";

export async function uploadDocument(formData: FormData) {
  try {
    // Extract file and name from FormData
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;

    if (!file || !name) {
      throw new Error("File and name are required");
    }

    // Initialize S3 client inside the function to use runtime environment variables
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    const fileExtension = file.name.split(".").pop(); // Get the last part after the dot
    const key = `${name}.${fileExtension}`; // Create the new file name

    // Convert File to Buffer for S3 upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: key, // Use the file's name as the S3 key
      Body: buffer,
      ContentType: file.type, // Important to set the correct content type
      ACL: "public-read", // Set access permissions (optional)
    };

    // Upload file to S3
    const uploadResult = await s3.upload(params).promise();
    console.log("Upload successful:", uploadResult);
    return uploadResult.Location; // URL of the uploaded file
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
