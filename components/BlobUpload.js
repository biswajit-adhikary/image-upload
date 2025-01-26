"use client";

import Image from "next/image";
import React, { useState } from "react";

const ImageUpload = () => {
  const [image, setImage] = useState(null); // To preview the image
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // Set preview
    }
  };

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();

    const fileInput = e.target.elements.fileInput.files[0];
    if (!fileInput) {
      alert("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadMessage("");

    try {
      // Convert the file to a Blob
      const blob = new Blob([fileInput], { type: fileInput.type });

      // Create form data
      const formData = new FormData();
      formData.append("file", blob, fileInput.name); // Append Blob to FormData

      // Upload to the server (replace `/api/upload` with your API route or server endpoint)
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      let resData = JSON.parse(result);

      if (response.ok) {
        setUploadMessage(`File uploaded successfully. URL: ${resData.url}`);
      } else {
        setUploadMessage("Failed to upload the image.");
      }
    } catch (error) {
      console.error("Error uploading the image:", error);
      setUploadMessage("An error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Image Upload</h2>
      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label
            htmlFor="fileInput"
            className="block text-sm font-medium text-gray-700"
          >
            Choose an image:
          </label>
          <input
            type="file"
            id="fileInput"
            name="fileInput"
            accept="image/*"
            className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            onChange={handleFileChange}
          />
        </div>

        {image && (
          <div className="mb-4">
            <Image src={image} alt="Selected" width={300} height={200} />
          </div>
        )}

        <button
          type="submit"
          className={`${
            isUploading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          } w-full text-white py-2 px-4 rounded-lg focus:outline-none`}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {uploadMessage && (
        <p className="mt-4 text-center text-sm font-medium text-gray-600">
          {uploadMessage}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
