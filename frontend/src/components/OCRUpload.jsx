import { useState } from 'react';
import { ocrAPI, cookbookAPI } from '../services/api';

function OCRUpload({ cookbooks, onComplete }) {
  const [selectedCookbook, setSelectedCookbook] = useState('');
  const [newCookbookTitle, setNewCookbookTitle] = useState('');
  const [newCookbookAuthor, setNewCookbookAuthor] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResults, setOcrResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showRawResponse, setShowRawResponse] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processOCR = async () => {
    if (!selectedImage) {
      alert('Please select an image');
      return;
    }

    let cookbookId = selectedCookbook;

    if (selectedCookbook === 'new') {
      if (!newCookbookTitle.trim()) {
        alert('Please enter a cookbook title');
        return;
      }

      try {
        const response = await cookbookAPI.create({
          title: newCookbookTitle,
          author: newCookbookAuthor || null,
        });
        cookbookId = response.data.id;
      } catch (error) {
        console.error('Error creating cookbook:', error);
        const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
        alert(`Error creating cookbook: ${errorMessage}`);
        return;
      }
    } else if (!cookbookId) {
      alert('Please select a cookbook');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        
        const response = await ocrAPI.extractAndSave({
          cookbook_id: parseInt(cookbookId),
          image_base64: base64Data,
        });

        setOcrResults(response.data);
        setShowResults(true);
      } catch (error) {
        console.error('OCR Error:', error);
        alert('Error processing image. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsDataURL(selectedImage);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setOcrResults(null);
    setShowResults(false);
    setNewCookbookTitle('');
    setNewCookbookAuthor('');
  };

  const handleComplete = () => {
    handleReset();
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#fffdf7] border-2 border-[#1a1a1a] p-6">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-8 bg-[#2851A3]"></div>
          <h2 className="text-lg font-bold text-[#1a1a1a] uppercase tracking-wide">Add Cookbook Index Pages</h2>
        </div>

        {!showResults ? (
          <>
            {/* Cookbook selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
                Select Cookbook
              </label>
              <select
                value={selectedCookbook}
                onChange={(e) => setSelectedCookbook(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] focus:outline-none focus:border-[#2851A3] cursor-pointer"
              >
                <option value="">-- Choose a cookbook --</option>
                {cookbooks.map((cb) => (
                  <option key={cb.id} value={cb.id}>
                    {cb.title} ({cb.recipe_count} recipes)
                  </option>
                ))}
                <option value="new">+ Create new cookbook</option>
              </select>
            </div>

            {/* New cookbook form */}
            {selectedCookbook === 'new' && (
              <div className="mb-6 p-4 bg-[#E6A817]/10 border-2 border-[#E6A817]/30">
                <div className="mb-4">
                  <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
                    Cookbook Title *
                  </label>
                  <input
                    type="text"
                    value={newCookbookTitle}
                    onChange={(e) => setNewCookbookTitle(e.target.value)}
                    placeholder="e.g., Mediterranean Cookbook"
                    className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] placeholder-[#1a1a1a]/40 focus:outline-none focus:border-[#2851A3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
                    Author (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCookbookAuthor}
                    onChange={(e) => setNewCookbookAuthor(e.target.value)}
                    placeholder="e.g., Jamie Oliver"
                    className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] placeholder-[#1a1a1a]/40 focus:outline-none focus:border-[#2851A3]"
                  />
                </div>
              </div>
            )}

            {/* Upload area */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
                Upload Index Page Photo
              </label>
              <label className="block border-2 border-dashed border-[#1a1a1a]/30 p-12 text-center hover:border-[#2851A3] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="w-16 h-16 mx-auto mb-4 bg-[#2851A3]/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#2851A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-[#1a1a1a]/70 mb-2">Click to upload or drag and drop</p>
                <p className="text-[#1a1a1a]/40 text-sm">PNG, JPG up to 10MB</p>
              </label>
            </div>

            {/* Image preview */}
            {imagePreview && (
              <div className="mb-6">
                <p className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">Preview:</p>
                <img
                  src={imagePreview}
                  alt="Index page preview"
                  className="max-w-full h-auto border-2 border-[#1a1a1a]"
                />
              </div>
            )}

            {/* Extract button */}
            <button
              onClick={processOCR}
              disabled={isProcessing || !selectedImage}
              className="w-full py-4 bg-[#2851A3] text-white font-bold uppercase tracking-wider text-lg hover:bg-[#1f4280] disabled:bg-[#1a1a1a]/20 disabled:text-[#1a1a1a]/40 disabled:cursor-not-allowed transition-colors border-2 border-[#1a1a1a]"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing with AI...
                </span>
              ) : (
                'Extract Recipes with AI'
              )}
            </button>

            <p className="mt-4 text-sm text-[#1a1a1a]/50 text-center">
              Uses Claude Vision to extract recipe names, page numbers, and ingredients
            </p>
          </>
        ) : (
          <div>
            {/* Success message */}
            <div className="mb-6 p-4 bg-[#2d7d46]/10 border-2 border-[#2d7d46]/30">
              <h3 className="text-lg font-bold text-[#2d7d46] mb-2 uppercase tracking-wide">
                Success!
              </h3>
              <p className="text-[#2d7d46]">
                {ocrResults.message}
              </p>
              <div className="mt-2 text-sm text-[#2d7d46]/80">
                <p>Recipes saved: {ocrResults.saved}</p>
                <p>Duplicates skipped: {ocrResults.skipped}</p>
              </div>
            </div>

            {/* Raw Claude Response */}
            {ocrResults.raw_response && (
              <div className="mb-6">
                <button
                  onClick={() => setShowRawResponse(!showRawResponse)}
                  className="w-full flex justify-between items-center p-4 bg-[#2851A3]/10 border-2 border-[#2851A3]/30 hover:bg-[#2851A3]/20 transition-colors"
                >
                  <span className="font-bold text-[#2851A3] uppercase tracking-wide text-sm">
                    Raw Claude Vision Response
                  </span>
                  <span className="text-[#2851A3] text-xl">
                    {showRawResponse ? '−' : '+'}
                  </span>
                </button>
                
                {showRawResponse && (
                  <div className="mt-2 p-4 bg-[#1a1a1a]/5 border-2 border-[#1a1a1a]/10">
                    <pre className="text-xs text-[#1a1a1a] whitespace-pre-wrap overflow-x-auto font-mono">
                      {ocrResults.raw_response}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-4 bg-[#E6A817] text-[#1a1a1a] font-bold uppercase tracking-wide hover:bg-[#d49a15] transition-colors border-2 border-[#1a1a1a]"
              >
                Add Another Page
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 py-4 bg-[#2d7d46] text-white font-bold uppercase tracking-wide hover:bg-[#256b3a] transition-colors border-2 border-[#1a1a1a]"
              >
                Done — Go to Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips box */}
      <div className="mt-6 bg-[#2851A3]/10 border-2 border-[#2851A3]/30 p-5">
        <h3 className="font-bold text-[#2851A3] mb-3 uppercase text-sm tracking-wide">Tips</h3>
        <ul className="text-sm text-[#1a1a1a]/70 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-[#2851A3] mt-0.5">→</span>
            Take clear, well-lit photos of your cookbook index pages
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#2851A3] mt-0.5">→</span>
            Process each index page separately
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#2851A3] mt-0.5">→</span>
            The AI will automatically detect duplicate recipes across pages
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#2851A3] mt-0.5">→</span>
            You can add multiple pages from the same cookbook
          </li>
        </ul>
      </div>
    </div>
  );
}

export default OCRUpload;
