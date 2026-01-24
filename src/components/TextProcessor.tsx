import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { BrailleConverter } from "./BrailleConverter";
import { FeedbackForm } from "./FeedbackForm";
import { Id } from "../../convex/_generated/dataModel";

interface TextProcessorProps {
  extractedText: string;
  imageFile: File | null;
}

export function TextProcessor({ extractedText, imageFile }: TextProcessorProps) {
  const [summarizedText, setSummarizedText] = useState("");
  const [explainedText, setExplainedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [documentId, setDocumentId] = useState<Id<"documents"> | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "explanation">("summary");

  const summarizeAction = useAction(api.ai.summarizeText);
  const explainAction = useAction(api.ai.explainText);
  const createDocument = useMutation(api.documents.create);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);

  const handleSummarize = async () => {
    setIsProcessing(true);
    try {
      const summary = await summarizeAction({ text: extractedText });
      setSummarizedText(summary);
      toast.success("Text summarized successfully!");
    } catch (error) {
      console.error("Summarization error:", error);
      toast.error("Failed to summarize text");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExplain = async () => {
    setIsProcessing(true);
    try {
      const explanation = await explainAction({ text: extractedText });
      setExplainedText(explanation);
      toast.success("Text explained successfully!");
    } catch (error) {
      console.error("Explanation error:", error);
      toast.error("Failed to explain text");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast.error("Speech synthesis failed");
      };

      window.speechSynthesis.speak(utterance);
      toast.success("Playing audio...");
    } else {
      toast.error("Text-to-speech not supported in this browser");
    }
  };

  const handleSaveDocument = async () => {
    try {
      let imageId: Id<"_storage"> | undefined;
      
      if (imageFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        
        if (result.ok) {
          const { storageId } = await result.json();
          imageId = storageId;
        }
      }

      const docId = await createDocument({
        originalText: extractedText,
        summarizedText: summarizedText || explainedText,
        imageId,
      });
      
      setDocumentId(docId);
      toast.success("Document saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save document");
    }
  };

  return (
    <div className="space-y-6">
      {/* Original Text */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">📄 Extracted Text</h3>
          <button
            onClick={() => handleSpeakText(extractedText)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isSpeaking 
                ? "bg-red-600 text-white hover:bg-red-700" 
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            aria-label={isSpeaking ? "Stop reading" : "Read original text aloud"}
          >
            {isSpeaking ? "🔇 Stop" : "🔊 Listen"}
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
          <p className="text-gray-700 whitespace-pre-wrap">{extractedText}</p>
        </div>
      </div>

      {/* Processing Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleSummarize}
          disabled={isProcessing}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Summarize the extracted text"
        >
          {isProcessing ? "Processing..." : "📝 Summarize"}
        </button>
        <button
          onClick={handleExplain}
          disabled={isProcessing}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Get detailed explanation of the text"
        >
          {isProcessing ? "Processing..." : "💡 Explain"}
        </button>
        {(summarizedText || explainedText) && (
          <button
            onClick={handleSaveDocument}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            aria-label="Save this document"
          >
            💾 Save Document
          </button>
        )}
      </div>

      {/* Processed Text */}
      {(summarizedText || explainedText) && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "summary"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                disabled={!summarizedText}
              >
                📝 Summary
              </button>
              <button
                onClick={() => setActiveTab("explanation")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "explanation"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                disabled={!explainedText}
              >
                💡 Explanation
              </button>
            </div>
            <button
              onClick={() => handleSpeakText(activeTab === "summary" ? summarizedText : explainedText)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isSpeaking 
                  ? "bg-red-600 text-white hover:bg-red-700" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              aria-label={isSpeaking ? "Stop reading" : "Read processed text aloud"}
            >
              {isSpeaking ? "🔇 Stop" : "🔊 Listen"}
            </button>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <p className="text-gray-800 whitespace-pre-wrap">
              {activeTab === "summary" ? summarizedText : explainedText}
            </p>
          </div>
        </div>
      )}

      {/* Braille Converter */}
      {(summarizedText || explainedText) && (
        <BrailleConverter text={activeTab === "summary" ? summarizedText : explainedText} />
      )}

      {/* Feedback Form */}
      {documentId && <FeedbackForm documentId={documentId} />}
    </div>
  );
}
