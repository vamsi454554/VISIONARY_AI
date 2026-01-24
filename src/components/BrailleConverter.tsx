import { useState } from "react";

interface BrailleConverterProps {
  text: string;
}

// Basic Braille mapping (Grade 1 Braille)
const brailleMap: Record<string, string> = {
  'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
  'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
  'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵',
  '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑', '6': '⠼⠋', '7': '⠼⠛', '8': '⠼⠓', '9': '⠼⠊', '0': '⠼⠚',
  ' ': '⠀', '.': '⠲', ',': '⠂', '?': '⠦', '!': '⠖', ':': '⠒', ';': '⠆', '-': '⠤', '(': '⠐⠣', ')': '⠐⠜'
};

export function BrailleConverter({ text }: BrailleConverterProps) {
  const [showBraille, setShowBraille] = useState(false);

  const convertToBraille = (input: string): string => {
    return input
      .toLowerCase()
      .split('')
      .map(char => brailleMap[char] || char)
      .join('');
  };

  const brailleText = convertToBraille(text);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(brailleText);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy Braille text:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">⠃⠗⠁⠊⠇⠇⠑ Braille Conversion</h3>
        <button
          onClick={() => setShowBraille(!showBraille)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          aria-label={showBraille ? "Hide Braille text" : "Show Braille text"}
        >
          {showBraille ? "Hide Braille" : "Show Braille"}
        </button>
      </div>

      {showBraille && (
        <div className="space-y-4">
          <div className="bg-indigo-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <p className="text-2xl leading-relaxed font-mono" style={{ fontFamily: 'monospace' }}>
              {brailleText}
            </p>
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-600">
            <p>Grade 1 Braille (character-by-character conversion)</p>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              aria-label="Copy Braille text to clipboard"
            >
              📋 Copy
            </button>
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
            <p><strong>Note:</strong> This is a basic Grade 1 Braille conversion. For professional use, consider specialized Braille translation software that supports contractions and proper formatting.</p>
          </div>
        </div>
      )}
    </div>
  );
}
