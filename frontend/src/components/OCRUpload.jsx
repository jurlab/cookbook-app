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
        alert('Error creating cookbook');
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📸 Add Cookbook Index Pages
        </h2>

        {!showResults ? (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select cookbook
              </label>
              <select
                value={selectedCookbook}
                onChange={(e) => setSelectedCookbook(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

            {selectedCookbook === 'new' && (
              <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cookbook title *
                  </label>
                  <input
                    type="text"
                    value={newCookbookTitle}
                    onChange={(e) => setNewCookbookTitle(e.target.value)}
                    placeholder="e.g., Mediterranean Cookbook"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author (optional)
                  </label>
                  <input
                    type="text"
                    value={newCookbookAuthor}
                    onChange={(e) => setNewCookbookAuthor(e.target.value)}
                    placeholder="e.g., Jamie Oliver"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload index page photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {imagePreview && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <img
                  src={imagePreview}
                  alt="Index page preview"
                  className="max-w-full h-auto rounded-lg border border-gray-300"
                />
              </div>
            )}

            <button
              onClick={processOCR}
              disabled={isProcessing || !selectedImage}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Processing with AI...
                </span>
              ) : (
                '🤖 Extract Recipes with AI'
              )}
            </button>

            <p className="mt-4 text-sm text-gray-500 text-center">
              This uses Claude Vision to extract recipe names, page numbers, and ingredients from your index photo.
            </p>
          </>
        ) : (
          <div>
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Success!
              </h3>
              <p className="text-green-700">
                {ocrResults.message}
              </p>
              <div className="mt-2 text-sm text-green-600">
                <p>Recipes saved: {ocrResults.saved}</p>
                <p>Duplicates skipped: {ocrResults.skipped}</p>
              </div>
            </div>

            {/* Raw Claude Response */}
            {ocrResults.raw_response && (
              <div className="mb-6">
                <button
                  onClick={() => setShowRawResponse(!showRawResponse)}
                  className="w-full flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="font-semibold text-blue-900">
                    🤖 Raw Claude Vision Response
                  </span>
                  <span className="text-blue-600">
                    {showRawResponse ? '▼' : '▶'}
                  </span>
                </button>
                
                {showRawResponse && (
                  <div className="mt-2 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                      {ocrResults.raw_response}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                📸 Add Another Page
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                ✓ Done - Go to Search
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Take clear, well-lit photos of your cookbook index pages</li>
          <li>• Process each index page separately</li>
          <li>• The AI will automatically detect duplicate recipes across pages</li>
          <li>• You can add multiple pages from the same cookbook</li>
        </ul>
      </div>
    </div>
  );
}

export default OCRUpload;
