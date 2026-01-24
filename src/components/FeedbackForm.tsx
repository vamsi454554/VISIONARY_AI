import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface FeedbackFormProps {
  documentId: Id<"documents">;
}

export function FeedbackForm({ documentId }: FeedbackFormProps) {
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);
  const [comments, setComments] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitFeedback = useMutation(api.feedback.submit);

  const handleSubmit = async () => {
    if (wasHelpful === null) {
      toast.error("Please indicate if this was helpful");
      return;
    }

    try {
      await submitFeedback({
        documentId,
        wasHelpful,
        comments: comments.trim() || undefined,
      });
      
      setIsSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback");
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-2xl mb-2">✅</div>
        <p className="text-green-800 font-medium">Thank you for your feedback!</p>
        <p className="text-green-600 text-sm mt-1">Your input helps us improve VisionEd</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">💬 How was this helpful?</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-gray-700 mb-3">Was the AI explanation clear and helpful?</p>
          <div className="flex space-x-4">
            <button
              onClick={() => setWasHelpful(true)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                wasHelpful === true
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-green-100"
              }`}
              aria-label="Mark as helpful"
            >
              👍 Yes, helpful
            </button>
            <button
              onClick={() => setWasHelpful(false)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                wasHelpful === false
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-red-100"
              }`}
              aria-label="Mark as not helpful"
            >
              👎 Not helpful
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="comments" className="block text-gray-700 mb-2">
            Additional comments (optional):
          </label>
          <textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Tell us how we can improve..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={wasHelpful === null}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Submit feedback"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
