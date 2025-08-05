// components/UploadHistory.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

function UploadHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedFiles, setExpandedFiles] = useState({});
    const [showFileConfirmModal, setShowFileConfirmModal] = useState(false);
    const [showSheetConfirmModal, setShowSheetConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { user } = useSelector((state) => state.auth);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!user || !user.token) {
                setError('User not authenticated. Please log in.');
                setLoading(false);
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };

            const response = await axios.get(`${API_URL}/api/upload/history`, config);
            console.log("Fetched history:", response.data);
            setHistory(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching history:", err.response ? err.response.data : err.message);
            setError('Failed to fetch upload history. Please try again.');
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchHistory();
        } else {
            setLoading(false);
            setHistory([]);
            setError("Please log in to view your upload history.");
        }
    }, [user, fetchHistory]);

    const handleToggleExpand = (fileId) => {
        setExpandedFiles(prev => ({
            ...prev,
            [fileId]: !prev[fileId]
        }));
    };

    const handleDeleteClick = (type, fileId, name, sheetName = null) => {
        setItemToDelete({ type, id: fileId, name, sheetName });
        if (type === 'file') {
            setShowFileConfirmModal(true);
        } else if (type === 'sheet') {
            const file = history.find(f => f._id === fileId);
            if (file && file.sheetNames.length === 1 && file.sheetNames[0] === sheetName) {
                // If it's the last sheet and specifically THIS sheet is being deleted, treat as file deletion
                setItemToDelete({ type: 'file', id: fileId, name: file.originalFileName });
                setShowFileConfirmModal(true);
            } else {
                setShowSheetConfirmModal(true);
            }
        }
    };

    const confirmSheetDelete = async () => {
        setShowSheetConfirmModal(false);
        if (!itemToDelete || itemToDelete.type !== 'sheet') return;

        try {
            if (!user || !user.token) {
                setError('Authentication required to delete sheet.');
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };

            await axios.put(`${API_URL}/api/upload/${itemToDelete.id}/sheet/${itemToDelete.sheetName}`, {}, config);

            // Re-fetch history to update the UI
            await fetchHistory();
            setItemToDelete(null);
            setError(null);
            console.log(`Sheet "${itemToDelete.sheetName}" deleted successfully from file ${itemToDelete.name}.`);
        } catch (err) {
            console.error("Error deleting sheet:", err.response ? err.response.data : err.message);
            setError(`Failed to delete sheet: ${err.response?.data?.message || err.message}`);
        }
    };

    const confirmFileDelete = async () => {
        setShowFileConfirmModal(false);
        if (!itemToDelete || itemToDelete.type !== 'file') return;

        try {
            if (!user || !user.token) {
                setError('Authentication required to delete file.');
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };

            await axios.delete(`${API_URL}/api/upload/${itemToDelete.id}`, config);

            // Re-fetch history to update the UI
            await fetchHistory();
            setItemToDelete(null);
            setError(null);
            console.log(`File ${itemToDelete.name} deleted successfully.`);
        } catch (err) {
            console.error("Error deleting file:", err.response ? err.response.data : err.message);
            setError(`Failed to delete file: ${err.response?.data?.message || err.message}`);
        }
    };

    const cancelDeletion = () => {
        setShowFileConfirmModal(false);
        setShowSheetConfirmModal(false);
        setItemToDelete(null);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                <div className="p-6 sm:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600">
                    <h2 className="text-3xl font-extrabold text-white text-center">
                        Your Upload History
                    </h2>
                    {/* NEW ADDITION: Display Total Uploads */}
                    {!loading && !error && history.length > 0 && (
                        <p className="mt-2 text-blue-100 text-center text-lg font-medium">
                            Total Files Uploaded: <span className="text-white font-bold">{history.length}</span>
                        </p>
                    )}
                    <p className="mt-2 text-blue-100 text-center">Manage your previously uploaded Excel files and sheets.</p>
                </div>

                <div className="p-6 sm:p-8">
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="ml-3 text-lg text-gray-700">Loading upload history...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative my-4" role="alert">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline ml-2">{error}</span>
                        </div>
                    )}

                    {!loading && !error && history.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-4 text-xl text-gray-600 font-semibold">No Excel files uploaded yet.</p>
                            <p className="mt-2 text-gray-500">
                                Get started by <Link to="/upload" className="text-blue-600 hover:underline font-medium">uploading your first file</Link>!
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {history.map((file) => (
                                <li key={file._id} className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4">
                                        <div className="flex items-center flex-grow mb-3 sm:mb-0">
                                            <button
                                                onClick={() => handleToggleExpand(file._id)}
                                                className="mr-3 p-2 text-gray-500 hover:text-blue-700 rounded-full hover:bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                title={expandedFiles[file._id] ? "Collapse sheets" : "Expand sheets"}
                                            >
                                                {expandedFiles[file._id] ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 010 1.414z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 011.414 0L10 10.586l3.293-3.293a1 1 011.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                            <div className="flex flex-col">
                                                <Link
                                                    to={`/analyze/${file._id}`}
                                                    className="text-xl font-semibold text-gray-800 hover:text-blue-700 hover:underline transition-colors duration-200"
                                                >
                                                    {file.originalFileName}
                                                </Link>
                                                <p className="text-sm text-gray-500 mt-0.5">Uploaded on: {formatDate(file.createdAt)}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteClick('file', file._id, file.originalFileName)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200 text-sm font-medium flex items-center shadow-sm"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            Delete File
                                        </button>
                                    </div>

                                    {expandedFiles[file._id] && (
                                        <div className="bg-gray-100 p-4 border-t border-gray-200">
                                            {file.sheetNames && file.sheetNames.length > 0 ? (
                                                <ul className="ml-4 space-y-2">
                                                    {file.sheetNames.map((sheetName) => (
                                                        <li key={`${file._id}-${sheetName}`} className="flex justify-between items-center py-2 px-3 bg-white rounded-md shadow-sm border border-gray-100">
                                                            <span className="text-gray-700 text-base font-medium">Sheet: {sheetName}</span>
                                                            <button
                                                                onClick={() => handleDeleteClick('sheet', file._id, file.originalFileName, sheetName)}
                                                                className="px-3 py-1 bg-red-400 text-white rounded-md hover:bg-red-500 transition duration-200 text-xs font-medium flex items-center ml-2"
                                                                title={`Delete sheet "${sheetName}"`}
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                                Delete
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="ml-4 text-gray-500 italic text-sm py-2">No sheets found for this file. This might be an empty file or an issue during parsing.</p>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Sheet Confirmation Modal */}
            {showSheetConfirmModal && itemToDelete && itemToDelete.type === 'sheet' && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center transform scale-95 opacity-0 animate-scaleIn">
                        <svg className="mx-auto mb-4 h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Sheet Deletion</h3>
                        <p className="mb-6 text-gray-600">Are you sure you want to delete sheet "<span className="font-semibold text-blue-700">{itemToDelete.sheetName}</span>" from file "<span className="font-semibold">{itemToDelete.name}</span>"? This action cannot be undone.</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={confirmSheetDelete}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-semibold shadow-md"
                            >
                                Yes, Delete Sheet
                            </button>
                            <button
                                onClick={cancelDeletion}
                                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 font-semibold shadow-md"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* File Confirmation Modal */}
            {showFileConfirmModal && itemToDelete && itemToDelete.type === 'file' && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center transform scale-95 opacity-0 animate-scaleIn">
                        <svg className="mx-auto mb-4 h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm File Deletion</h3>
                        <p className="mb-6 text-gray-600">
                            Are you sure you want to delete the entire file "<span className="font-semibold text-blue-700">{itemToDelete.name}</span>"? All its sheets and associated data will be permanently removed.
                            {itemToDelete.sheetName && <span className="block mt-2 text-sm text-gray-500">(This action was triggered because it was the last sheet: "{itemToDelete.sheetName}")</span>}
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={confirmFileDelete}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-semibold shadow-md"
                            >
                                Yes, Delete File
                            </button>
                            <button
                                onClick={cancelDeletion}
                                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 font-semibold shadow-md"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UploadHistory;