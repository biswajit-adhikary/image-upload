"use client";
import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import Image from "next/image";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    let imagefile = e.target.files[0];
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(imagefile, options);
      setImage(URL.createObjectURL(compressedFile));
      setFile(compressedFile);
    } catch (error) {
      console.error("Error compressing image:", error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file before uploading.");
      return;
    }
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      let resData = JSON.parse(result);
      setMessage(`File uploaded successfully. URL: ${resData.url}`);
    } catch (error) {
      setMessage("An error occurred while uploading the file.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-lg font-medium mb-2">
            Select a file:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full border rounded p-2"
          />
        </div>
        {image && (
          <div className="mb-4">
            <Image src={image} alt="Selected" width={500} height={200} />
          </div>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
    </div>
  );
};

export default FileUpload;
