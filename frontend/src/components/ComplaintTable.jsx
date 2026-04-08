import React from 'react';
import PriorityBadge from './PriorityBadge';

const ComplaintTable = ({ complaints }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                Ticket ID
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                Category
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                Description
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                Priority
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {complaints.length > 0 ? (
                            complaints.map((complaint) => (
                                <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono font-medium">
                                        #{complaint.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${complaint.category === 'Electricity'
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {complaint.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-700 line-clamp-2 max-w-sm" title={complaint.text}>
                                            {complaint.text}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <PriorityBadge priority={complaint.priority} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold leading-5 text-gray-500 bg-gray-100 rounded-md">
                                            Pending
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    No complaints found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComplaintTable;
