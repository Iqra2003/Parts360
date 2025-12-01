import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';

const Dashboard = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = React.useState({
        totalParts: 0,
        lowStock: 0,
        recentParts: []
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/parts?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search parts..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Parts" value={stats.totalParts} subtext="In Inventory" color="indigo" />
                <StatCard title="Low Stock Parts" value={stats.lowStock} subtext="Needs Reordering" color="white" />
                <StatCard title="Recent Searches" value="-" subtext="Last 24 Hours" color="white" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Recently Added Parts</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">Part Name</th>
                                <th className="px-6 py-4 font-medium">Part Number</th>
                                <th className="px-6 py-4 font-medium">Stock</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats.recentParts.length > 0 ? (
                                stats.recentParts.map((part) => (
                                    <tr key={part.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-900 font-medium">{part.name}</td>
                                        <td className="px-6 py-4 text-slate-500">{part.number}</td>
                                        <td className="px-6 py-4 text-slate-900">{part.stock}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        No parts added yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
