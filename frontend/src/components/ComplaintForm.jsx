import React, { useState } from 'react';
import api from '../services/api';

const ComplaintForm = () => {
    const [complaintText, setComplaintText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        // Basic validation
        if (complaintText.trim().length < 5) {
            setError('Please provide a more detailed description.');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/predict', { text: complaintText });
            setResult(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to connect to the server. Is the backend running?'
            );
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl">
                <div className="p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 border-l-4 border-indigo-600 pl-4">
                        File a Complaint
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="complaint" className="block text-sm font-medium text-gray-700 mb-2">
                                Describe your issue
                            </label>
                            <textarea
                                id="complaint"
                                rows={6}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none bg-gray-50 focus:bg-white"
                                placeholder="e.g., There has been a power outage in Sector 4 for the last 3 hours..."
                                value={complaintText}
                                onChange={(e) => setComplaintText(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-6 rounded-lg text-white font-semibold text-lg transition-all transform hover:scale-[1.01] ${loading
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                'Submit Complaint'
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm animate-fade-in">
                            <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Complaint Registered
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Category</p>
                                    <p className="text-lg font-bold text-gray-900 mt-1">{result.category}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Priority</p>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${result.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                result.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            {result.priority}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-green-700 text-center">
                                Your Ticket ID: <span className="font-mono font-bold">#{Math.floor(10000 + Math.random() * 90000)}</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComplaintForm;
