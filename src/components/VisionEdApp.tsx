import { useState } from "react";
import { ImageUpload } from "./ImageUpload";
import { TextProcessor } from "./TextProcessor";
import { DocumentHistory } from "./DocumentHistory";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function VisionEdApp() {
  const [activeTab, setActiveTab] = useState<"upload" | "history">("upload");
  const [extractedText, setExtractedText] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const user = useQuery(api.auth.loggedInUser);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          Welcome to VisionEd, {user?.name || user?.email || "Student"}!
        </h1>
        <p className="text-gray-600 text-lg">
          Upload an image to extract, summarize, and listen to your study materials
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg p-1 shadow-sm border">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === "upload"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-blue-600"
            }`}
            aria-label="Upload new image"
          >
            📷 New Upload
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === "history"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-blue-600"
            }`}
            aria-label="View document history"
          >
            📚 History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "upload" && (
        <div className="space-y-6">
          <ImageUpload 
            onTextExtracted={setExtractedText}
            onImageSelected={setImageFile}
          />
          {extractedText && (
            <TextProcessor 
              extractedText={extractedText}
              imageFile={imageFile}
            />
          )}
        </div>
      )}

      {activeTab === "history" && <DocumentHistory />}
    </div>
  );
}
