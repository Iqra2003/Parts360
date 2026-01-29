import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, Plus } from 'lucide-react';

const AddPart = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const [images, setImages] = useState([]);
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
        if (isEditMode) {
            fetchPartDetails();
        }

        // Add paste listener
        const handlePaste = (e) => {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setImages(prev => [...prev, event.target.result]);
                    };
                    reader.readAsDataURL(blob);
                    // Continue loop to allow pasting multiple images if copied together
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [id]);

    const fetchPartDetails = async () => {
        try {
            const response = await fetch('/api/parts');
            const data = await response.json();
            const part = data.find(p => p.id === id);
            if (part) {
                setFormData({
                    name: part.name,
                    number: part.number,
                    category: part.category,
                    stock: part.stock,
                    description: part.description || ''
                });
                // Handle legacy parts that only have 'image' vs new ones with 'images'
                if (part.images && part.images.length > 0) {
                    setImages(part.images);
                } else if (part.image) {
                    setImages([part.image]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch part details:', error);
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

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (indexToRemove) => {
        setImages(images.filter((_, index) => index !== indexToRemove));
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
        if (images.length === 0) {
            alert('Please upload at least one image');
            return;
        }

        setLoading(true);
        try {
            const url = isEditMode ? `/api/parts/${id}` : '/api/parts';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    images // Send array of images
                }),
            });

            if (response.ok) {
                alert(`Part ${isEditMode ? 'updated' : 'added'} successfully!`);
                if (isEditMode) {
                    navigate('/parts');
                } else {
                    setFormData({
                        name: '',
                        number: '',
                        category: '',
                        stock: '',
                        description: ''
                    });
                    setImages([]);
                    fetchCategories();
                }
            } else {
                alert(`Failed to ${isEditMode ? 'update' : 'add'} part`);
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} part:`, error);
            alert(`Error ${isEditMode ? 'updating' : 'adding'} part`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">{isEditMode ? 'Edit Spare Part' : 'Add New Spare Part'}</h1>

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
                        <label className="block text-sm font-medium text-slate-700 mb-2">Part Images (Upload Multiple)</label>

                        {/* Image Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {images.map((img, index) => (
                                <div key={index} className="relative group">
                                    <img src={img} alt={`Part view ${index + 1}`} className="h-32 w-full object-cover rounded-lg border border-slate-200" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}

                            {/* Upload Button Block */}
                            <label className="relative cursor-pointer h-32 flex flex-col items-center justify-center border-2 border-slate-300 border-dashed rounded-lg hover:bg-slate-50 transition-colors">
                                <Upload className="h-8 w-8 text-slate-400 mb-1" />
                                <span className="text-xs text-slate-500 font-medium">Add Image</span>
                                <input
                                    type="file"
                                    multiple
                                    className="sr-only"
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                />
                            </label>
                        </div>

                        <p className="text-xs text-slate-500">Supported formats: PNG, JPG, GIF. Max 50MB total.</p>
                        <p className="text-xs text-indigo-500 font-medium mt-2">Tip: You can paste (Ctrl+V) images directly!</p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Part' : 'Add Part')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPart;
