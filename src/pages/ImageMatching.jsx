import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

const ImageMatching = () => {
    const [queryImage, setQueryImage] = useState(null);
    const [isMatching, setIsMatching] = useState(false);
    const [results, setResults] = useState([]);

    useEffect(() => {
        // Add paste listener
        const handlePaste = (e) => {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setQueryImage(event.target.result);
                        matchImage(event.target.result);
                    };
                    reader.readAsDataURL(blob);
                    break; // Only take the first image
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setQueryImage(reader.result);
                // Trigger matching automatically
                matchImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const matchImage = async (imageBase64) => {
        setIsMatching(true);
        try {
            const response = await fetch('/api/match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: imageBase64 }),
            });

            if (response.ok) {
                const data = await response.json();
                setResults(data.matches);
            } else {
                console.error('Failed to match image');
                setResults([]);
            }
        } catch (error) {
            console.error('Error matching image:', error);
            setResults([]);
        } finally {
            setIsMatching(false);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">Image Matching</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Upload Query Image</h2>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center h-64 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                            {queryImage ? (
                                <img src={queryImage} alt="Query" className="max-h-full max-w-full rounded-lg object-contain" />
                            ) : (
                                <>
                                    <Upload className="h-12 w-12 text-slate-400 mb-4" />
                                    <p className="text-slate-600 font-medium">Drop image here</p>
                                    <p className="text-sm text-slate-400 mt-1">or click to upload</p>
                                    <p className="text-xs text-indigo-500 font-medium mt-2">Tip: Paste (Ctrl+V) image here!</p>
                                </>
                            )}
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleImageUpload}
                                accept="image/*"
                            />
                        </div>
                        {queryImage && (
                            <button
                                onClick={() => {
                                    setQueryImage(null);
                                    setResults([]);
                                }}
                                className="w-full mt-4 px-4 py-2 text-slate-600 font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Clear Image
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Matching Results</h2>

                        {isMatching ? (
                            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                <p className="text-slate-500">Analyzing image features...</p>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {results.map((result, index) => (
                                    <div key={result.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="relative h-40 bg-slate-100">
                                            <img src={result.image} alt={result.name} className="w-full h-full object-cover" />
                                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                {result.accuracy}% Match
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-slate-900 mb-1">{result.name}</h3>
                                            <div className="flex items-center gap-2 mb-3">
                                                {result.stock > 0 ? (
                                                    <CheckCircle size={14} className="text-green-500" />
                                                ) : (
                                                    <AlertCircle size={14} className="text-orange-500" />
                                                )}
                                                <span className={`text-xs font-medium ${result.stock > 0 ? 'text-green-600' : 'text-orange-600'
                                                    }`}>
                                                    {result.stock > 0 ? 'In Stock' : 'Out of Stock'} ({result.stock})
                                                </span>
                                            </div>
                                            <button className="w-full py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100 transition-colors text-sm">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <p>Upload an image to see matching parts</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageMatching;
