import React, { useState, useEffect } from 'react';
import { Upload, X, Plus } from 'lucide-react';

const AddPart = () => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        number: '',
        category: '',
        stock: '',
        description: ''
    });

    useEffect(() => {
        fetchCategories();

        // Add paste listener
        const handlePaste = (e) => {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setImage(event.target.result);
                    };
                    reader.readAsDataURL(blob);
                    break; // Only take the first image
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddCategory = () => {
        if (newCategory.trim()) {
            // Optimistically add to list (backend will save it on submit)
            setCategories([...categories, newCategory.trim()]);
            setFormData({ ...formData, category: newCategory.trim() });
            setNewCategory('');
            setIsAddingCategory(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) {
            alert('Please upload an image');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/parts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    image
                }),
            });

            if (response.ok) {
                alert('Part added successfully!');
                setFormData({
                    name: '',
                    number: '',
                    category: '',
                    stock: '',
                    description: ''
                });
                setImage(null);
                fetchCategories(); // Refresh categories in case backend normalized something
            } else {
                alert('Failed to add part');
            }
        } catch (error) {
            console.error('Error adding part:', error);
            alert('Error adding part');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Add New Spare Part</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Part Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="e.g. Brake Pad"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Part Number</label>
                            <input
                                type="text"
                                name="number"
                                value={formData.number}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="e.g. BP-2051"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                            {isAddingCategory ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="New Category Name"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCategory}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingCategory(false)}
                                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat, index) => (
                                            <option key={index} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingCategory(true)}
                                        className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                        title="Add New Category"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Stock Quantity</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                        <textarea
                            rows="4"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter part description..."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Part Image</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:bg-slate-50 transition-colors cursor-pointer relative">
                            {image ? (
                                <div className="relative">
                                    <img src={image} alt="Preview" className="max-h-64 rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                    <div className="flex text-sm text-slate-600 justify-center">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                                        >
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                                    <p className="text-xs text-indigo-500 font-medium mt-2">Tip: You can paste (Ctrl+V) an image here!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Adding...' : 'Add Part'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPart;
