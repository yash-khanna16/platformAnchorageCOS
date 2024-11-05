import AWS from "aws-sdk";

// Initialize S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_REGION,
});

export async function uploadDocument(file: File, name: string) {
  try {
    const fileExtension = file.name.split('.').pop(); // Get the last part after the dot
    const key = `${name}.${fileExtension}`; // Create the new file name

    const params = {
      Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME as string,
      Key: key, // Use the file's name as the S3 key
      Body: file,
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
