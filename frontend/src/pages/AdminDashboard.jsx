import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ComplaintTable from '../components/ComplaintTable';
import api from '../services/api';

const AdminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const response = await api.get('/complaints');

                // Sort by priority (High > Medium > Low)
                const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };

                // Safe sort handling in case priority is missing/different
                const sorted = [...response.data].sort((a, b) => {
                    const pA = priorityOrder[a.priority] || 4;
                    const pB = priorityOrder[b.priority] || 4;
                    return pA - pB;
                });

                setComplaints(sorted);
            } catch (err) {
                console.error("Error fetching complaints:", err);
                // Fallback to dummy data if backend is not reachable for demo purposes
                const dummyComplaints = [
                    { id: 1001, text: "Demo: The transformer in block C caught fire.", category: "Electricity", priority: "High" },
                    { id: 1002, text: "Demo: Water supply has been dirty/brown for 2 days.", category: "Water", priority: "Medium" },
                    { id: 1003, text: "Demo: Backend connection failed. Attempting to show cached data.", category: "System", priority: "Low" },
                ];
                setComplaints(dummyComplaints);
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="mt-1 text-gray-500">Monitor and manage incoming citizen complaints.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                            <span className="text-sm text-gray-500">Total:</span> <span className="font-bold text-gray-900">{complaints.length}</span>
                        </div>
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-md">
                            Export Report
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <ComplaintTable complaints={complaints} />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
