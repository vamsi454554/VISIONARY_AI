import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export function DocumentHistory() {
  const documents = useQuery(api.documents.list) || [];
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-4xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Documents Yet</h3>
        <p className="text-gray-600">
          Upload and process your first image to see your document history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📚 Your Document History</h2>
      
      {documents.map((doc) => (
        <div key={doc._id} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(doc.createdAt).toLocaleDateString()} at{" "}
                  {new Date(doc.createdAt).toLocaleTimeString()}
                </span>
              </div>
              {doc.imageUrl && (
                <img 
                  src={doc.imageUrl} 
                  alt="Document" 
                  className="w-20 h-20 object-cover rounded-lg mb-3"
                />
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSpeakText(doc.summarizedText)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  isSpeaking 
                    ? "bg-red-600 text-white hover:bg-red-700" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                aria-label="Read document aloud"
              >
                {isSpeaking ? "🔇" : "🔊"}
              </button>
              <button
                onClick={() => setSelectedDoc(selectedDoc === doc._id ? null : doc._id)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label={selectedDoc === doc._id ? "Hide details" : "Show details"}
              >
                {selectedDoc === doc._id ? "Hide" : "View"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Summary:</h4>
              <p className="text-gray-700 text-sm line-clamp-3">
                {doc.summarizedText}
              </p>
            </div>

            {selectedDoc === doc._id && (
              <div className="border-t pt-4 space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Original Text:</h4>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {doc.originalText}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">AI Summary:</h4>
                  <div className="bg-blue-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">
                      {doc.summarizedText}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
