import { Storage } from "@google-cloud/storage";
import sharp from "sharp";

export const config = {
  runtime: "edge",
};

// Initialize Google Cloud Storage client
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

const bucketName = "imageszx";
const bucket = storage.bucket(bucketName);

// POST request handler for uploading the image
export async function POST(req) {
  try {
    // Read form data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ message: "No file uploaded" }), {
        status: 400,
      });
    }

    // Create a unique name for the file
    const fileName = `${Date.now()}.wpbp`;

    // Compress the image using sharp
    const compressedBuffer = await sharp(await file.arrayBuffer())
      .resize(500)
      .webp({ quality: 50 })
      .toBuffer();

    // Create a file in the Google Cloud Storage bucket
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: "image/jpeg",
    });

    // Pipe the compressed buffer
    blobStream.end(compressedBuffer);

    // Return a Promise
    return new Promise((resolve, reject) => {
      blobStream.on("error", (err) => {
        console.error("Error uploading file:", err);
        reject(
          new Response(
            JSON.stringify({
              message: "Error uploading file",
              error: err.message,
            }),
            { status: 500 }
          )
        );
      });

      blobStream.on("finish", async () => {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        resolve(
          new Response(
            JSON.stringify({
              message: "File uploaded successfully",
              url: publicUrl,
            }),
            { status: 200 }
          )
        );
      });
    });
  } catch (error) {
    console.error("Error in upload:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
