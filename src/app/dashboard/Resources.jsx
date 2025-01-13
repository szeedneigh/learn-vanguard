import React, { useState } from "react";
import { Link } from "react-router-dom";

const subjects = [
  "Philippine Literature",
  "Mathematics in Modern World",
  "Computer Programming 1",
  "Introduction to Computing",
  "Fundamentals of Information Systems",
  "Understanding the Self",
  "Professional Skills in ICT",
  "Physical Education 1",
  "Christian Teaching 1",
];

function Resources() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const openModal = () => {
    setIsModalOpen(true);
    setErrorMessage("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null); // Reset selected file
    setErrorMessage(""); // Reset error message
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setErrorMessage("");
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
    } else {
      console.log("File uploaded:", selectedFile.name);
      closeModal();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 text-sm text-gray-600">
        <Link to="/dashboard"><span className="text-primary">Home &gt; </span></Link>
        <span className="font-medium">Associate in Computer Technology</span>
        <span> / First Year / Subjects</span>
      </div>

      {/* Grid Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <button className="text-gray-600 rounded-md p-2 hover:bg-gray-200">
          &larr; Previous
        </button>
        <button className="mt-2 sm:mt-0 text-white bg-blue-500 rounded-md px-4 py-2 hover:bg-blue-600">
          Next &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 h-32 flex items-center justify-center"
          >
            <p className="text-center text-blue-600 font-semibold">
              {subject}
            </p>
          </div>
        ))}
      </div>

      {/* File Upload */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={openModal}
          className="text-white bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Upload File
        </button>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Upload File</h2>
            <input
              type="file"
              onChange={handleFileChange}
              className="mb-2 w-full border border-gray-300 rounded-md p-2"
            />
            {errorMessage && (
              <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Resources;
