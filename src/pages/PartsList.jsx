import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Filter } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const PartsList = () => {
    const [searchParams] = useSearchParams();
    const [parts, setParts] = useState([]);
    const [filteredParts, setFilteredParts] = useState([]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [showFilter, setShowFilter] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchParts();
        fetchCategories();
    }, []);

    useEffect(() => {
        filterParts();
    }, [parts, searchQuery, selectedCategory]);

    const fetchParts = async () => {
        try {
            const response = await fetch('/api/parts');
            const data = await response.json();
            setParts(data);
        } catch (error) {
            console.error('Failed to fetch parts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const filterParts = () => {
        let result = parts;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(part =>
                part.name.toLowerCase().includes(query) ||
                part.number.toLowerCase().includes(query)
            );
        }

        if (selectedCategory) {
            result = result.filter(part => part.category === selectedCategory);
        }

        setFilteredParts(result);
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading parts...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Parts Inventory</h1>

                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search parts..."
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <button
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilter ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            onClick={() => setShowFilter(!showFilter)}
                        >
                            <Filter size={20} />
                            <span>Filter</span>
                        </button>

                        {showFilter && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-10">
                                <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">Category</div>
                                {categories.map((category, index) => (
                                    <button
                                        key={index}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${selectedCategory === category ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-slate-600'}`}
                                        onClick={() => {
                                            setSelectedCategory(selectedCategory === category ? '' : category);
                                            setShowFilter(false);
                                        }}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">Image</th>
                                <th className="px-6 py-4 font-medium">Part Name</th>
                                <th className="px-6 py-4 font-medium">Part Number</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Stock</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredParts.length > 0 ? (
                                filteredParts.map((part) => (
                                    <tr key={part.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <img src={part.image || 'https://placehold.co/100x100'} alt={part.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                                        </td>
                                        <td className="px-6 py-4 text-slate-900 font-medium">{part.name}</td>
                                        <td className="px-6 py-4 text-slate-500">{part.number}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                                                {part.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-900">{part.stock}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                        No parts found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
                    <span>Showing {filteredParts.length} entries</span>
                </div>
            </div>
        </div>
    );
};

export default PartsList;
