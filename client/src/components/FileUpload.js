// components/FileUpload.js
import React, { useState, useRef } from 'react'; // Added useRef for drag/drop
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

function FileUpload() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
    const [loading, setLoading] = useState(false);
    const [dragging, setDragging] = useState(false); // For drag-and-drop
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const fileInputRef = useRef(null); // Ref for triggering file input

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && (file.name.endsWith('.xls') || file.name.endsWith('.xlsx'))) {
            setSelectedFile(file);
            setMessage(`Selected file: ${file.name}`);
            setMessageType('info');
        } else {
            setSelectedFile(null);
            setMessage('Please select a valid Excel file (.xls or .xlsx).');
            setMessageType('error');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('Please select an Excel file to upload.');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage('Uploading and parsing...');
        setMessageType('info');
        const formData = new FormData();
        formData.append('excelFile', selectedFile);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            await axios.post(`${API_URL}/api/upload`, formData, config);

            setMessage('File uploaded and parsed successfully!');
            setMessageType('success');
            setLoading(false);
            // Optionally clear selected file after successful upload
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Clear the input field
            }
            // Navigate after a short delay to allow success message to be seen
            setTimeout(() => {
                navigate('/history'); // Navigating to history after upload seems more logical
            }, 1500);

        } catch (error) {
            setMessage(error.response?.data?.message || 'Error uploading file. Please try again.');
            setMessageType('error');
            setLoading(false);
        }
    };

    // Drag and Drop Handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
                setSelectedFile(file);
                setMessage(`Selected file: ${file.name}`);
                setMessageType('info');
            } else {
                setSelectedFile(null);
                setMessage('Only Excel files (.xls, .xlsx) are allowed.');
                setMessageType('error');
            }
        }
    };

    // Helper to determine message CSS
    const getMessageClass = () => {
        switch (messageType) {
            case 'success':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'error':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'info':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-gray-50 p-4"> {/* Centering the content */}
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                    <span className="block">Upload Excel File</span>
                    <p className="text-sm font-normal text-gray-500 mt-1">Get your data ready for analysis</p>
                </h2>

                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
                                ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400'}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()} // Click to open file dialog
                >
                    <svg
                        className={`mx-auto h-12 w-12 ${dragging ? 'text-blue-500' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        ></path>
                    </svg>
                    <p className={`mt-2 text-sm ${dragging ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
                        {dragging ? "Drop your Excel file here" : "Drag & drop your Excel file, or click to browse"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">(Supports .xls, .xlsx formats)</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xls,.xlsx"
                        onChange={handleFileChange}
                        className="hidden" // Hide the default input
                    />
                </div>

                {selectedFile && (
                    <p className="mt-4 text-sm text-gray-700 font-medium">
                        File selected: <span className="text-blue-600">{selectedFile.name}</span>
                    </p>
                )}

                <button
                    onClick={handleUpload}
                    disabled={loading || !selectedFile}
                    className={`w-full mt-6 px-6 py-3 rounded-lg text-white font-semibold shadow-md transition-all duration-300 ease-in-out
                                ${loading || !selectedFile
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105'
                            }`}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                        </div>
                    ) : 'Upload & Parse File'}
                </button>

                {message && (
                    <p className={`mt-4 p-3 border rounded-md text-center text-sm ${getMessageClass()}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default FileUpload;