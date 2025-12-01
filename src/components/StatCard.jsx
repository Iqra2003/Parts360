import React from 'react';

const StatCard = ({ title, value, subtext, color = 'indigo' }) => {
    const colorClasses = {
        indigo: 'bg-indigo-600 text-white',
        white: 'bg-white text-slate-900 border border-slate-200',
    };

    const isIndigo = color === 'indigo';

    return (
        <div className={`p-6 rounded-xl shadow-sm ${colorClasses[color]}`}>
            <h3 className={`text-4xl font-bold mb-1 ${isIndigo ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
            <p className={`font-medium mb-4 ${isIndigo ? 'text-indigo-100' : 'text-slate-500'}`}>{title}</p>
            {subtext && (
                <p className={`text-sm ${isIndigo ? 'text-indigo-200' : 'text-slate-400'}`}>{subtext}</p>
            )}
        </div>
    );
};

export default StatCard;
