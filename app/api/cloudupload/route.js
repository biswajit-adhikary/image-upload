import formidable from "formidable";
import { Storage } from "@google-cloud/storage";

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

  // if (req.method === "POST") {
  //   const form = new formidable.IncomingForm();

  //   form.parse(req, async (err, fields, files) => {
  //     if (err) {
  //       console.error("Error parsing form:", err);
  //       return res.status(500).json({ error: "Failed to parse the file." });
  //     }

  //     const file = files.file;

  //     if (!file) {
  //       return res.status(400).json({ error: "No file was uploaded." });
  //     }

  //     try {
  //       const bucket = storage.bucket(bucketName);
  //       const blob = bucket.file(file.originalFilename);
  //       const blobStream = blob.createWriteStream({
  //         resumable: false,
  //         contentType: file.mimetype,
  //       });

  //       blobStream.on("error", (error) => {
  //         console.error("Blob stream error:", error);
  //         res
  //           .status(500)
  //           .json({ error: "Failed to upload file to Google Cloud Storage." });
  //       });

  //       blobStream.on("finish", () => {
  //         const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
  //         console.log("File uploaded successfully:", publicUrl);
  //         res
  //           .status(200)
  //           .json({ message: "File uploaded successfully.", url: publicUrl });
  //       });

  //       const fs = require("fs");
  //       const fileStream = fs.createReadStream(file.filepath);
  //       fileStream.pipe(blobStream);
  //     } catch (error) {
  //       console.error("Error uploading to Google Cloud Storage:", error);
  //       res.status(500).json({ error: "Failed to upload the file." });
  //     }
  //   });
  // } else {
  //   res.setHeader("Allow", ["POST"]);
  //   res.status(405).end("Method Not Allowed");
  // }
};

export default uploadHandler;
