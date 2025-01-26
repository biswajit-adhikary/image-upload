import { NextResponse } from "next/server";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import formidable from "formidable";
import { Storage } from "@google-cloud/storage";

const pump = promisify(pipeline);

// import { updateCourse } from "@/app/actions/course";
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Google Cloud Storage client
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

const bucketName = "imageszx"; // Replace with your GCS bucket name
const bucket = storage.bucket(bucketName);

export async function POST(request, response) {
  try {
    const formData = await request.formData();
    console.log("Form data:", formData);
    const file = formData.get("files");
    console.log(file);
    const destination = formData.get("destination");

    if (!destination) {
      return new NextResponse("Destination not provided", {
        status: 500,
      });
    }

    const filePath = `${destination}/${file.name}`;
    console.log(filePath);

    await pump(file.stream(), fs.createWriteStream(filePath));

    const blob = bucket.file(filePath);
    blob.save(fs.readFile(filePath), {
      public: true,
    });
    await blob.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
    fs.unlink(filePath);

    // This can be decoupled to another
    // route handler
    // const courseId = formData.get("courseId");
    // await updateCourse(courseId, { thumbnail: file.name });

    return new NextResponse(
      `File ${file.name} uploaded successfully, url: ${publicUrl}`,
      {
        status: 200,
      }
    );
  } catch (err) {
    return new NextResponse(err.message, {
      status: 500,
    });
  }
}

const uploadHandler = async (req, res) => {
  if (req.method === "POST") {
    try {
      const form = formidable({
        uploadDir: "/public/uploads", // Directory for temporary storage
        keepExtensions: true, // Preserve file extensions
      });

      // Parse the incoming form
      const files = await req.formData();
      console.log(files);

      const filePath = files.file[0].filepath; // Temporary file path
      const fileName = files.file[0].originalFilename; // Original file name

      const folderName = "Reviewzx"; // Replace with your desired folder name
      const destinationPath = `${folderName}/${fileName}`; // File path in GCS

      // Upload the file to Google Cloud Storage
      const blob = bucket.file(destinationPath);
      await blob.save(await fs.readFile(filePath), {
        // resumable: false,
        public: true, // Make the file publicly accessible
        // metadata: {
        //   contentType: files.file[0].mimetype, // Set correct MIME type
        // },
      });

      await blob.makePublic();

      // Generate the public URL
      // const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

      const publicUrl = `https://storage.googleapis.com/${bucketName}/${destinationPath}`;

      // Clean up temporary file
      await fs.unlink(filePath);

      // Return the public URL
      return res
        .status(200)
        .json({ message: "File uploaded successfully.", url: publicUrl });
    } catch (error) {
      console.error("Upload failed:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default uploadHandler;
