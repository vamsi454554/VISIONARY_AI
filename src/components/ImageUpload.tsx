import { useState, useRef } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  onTextExtracted: (text: string) => void;
  onImageSelected: (file: File) => void;
}

export function ImageUpload({ onTextExtracted, onImageSelected }: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    setIsProcessing(true);
    onImageSelected(file);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      // Import Tesseract.js dynamically
      const Tesseract = await import('tesseract.js');
      
      toast.info("Processing image... This may take a moment");
      
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            toast.info(`Processing: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      if (text.trim()) {
        onTextExtracted(text.trim());
        toast.success("Text extracted successfully!");
      } else {
        toast.error("No text found in the image. Please try a clearer image.");
      }
    } catch (error) {
      console.error("OCR Error:", error);
      toast.error("Failed to extract text from image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        📷 Upload Image
      </h2>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <div className="space-y-4">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-64 mx-auto rounded-lg shadow-sm"
            />
            <p className="text-sm text-gray-600">
              Click to select a different image
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl">📸</div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop an image here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports textbook pages, handwritten notes, and documents
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
        aria-label="Select image file"
      />

      {isProcessing && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-700 font-medium">
              Extracting text from image...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
