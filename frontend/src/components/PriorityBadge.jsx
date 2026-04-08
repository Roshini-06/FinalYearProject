import React from 'react';

const PriorityBadge = ({ priority }) => {
    const colors = {
        High: 'bg-red-100 text-red-800 border-red-200',
        Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        Low: 'bg-green-100 text-green-800 border-green-200',
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[priority] || 'bg-gray-100 text-gray-800'
                }`}
        >
            {priority}
        </span>
    );
};

export default PriorityBadge;
