import React from 'react';
import Navbar from '../components/Navbar';
import ComplaintForm from '../components/ComplaintForm';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-block px-4 py-1.5 bg-indigo-100 rounded-full mb-4">
                            <span className="text-indigo-800 font-semibold text-sm tracking-wide uppercase">AI-Powered System</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                            Citizen Grievance Portal
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-gray-500">
                            Submit your public utility complaints regarding Electricity and Water. Our AI system will classify and prioritize them for faster resolution.
                        </p>
                    </div>
                    <ComplaintForm />
                </div>
            </main>
            <footer className="bg-white border-t border-gray-200 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                    &copy; 2024 CivicConnect AI Project. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;
