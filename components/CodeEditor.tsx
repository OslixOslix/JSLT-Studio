import React from 'react';

interface CodeEditorProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  language?: 'json' | 'jslt';
  error?: string | null;
  onFormat?: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  label, 
  value, 
  onChange, 
  readOnly = false, 
  language = 'json',
  error,
  onFormat
}) => {
  return (
    <div className="flex flex-col h-full bg-editor-bg border border-gray-200 rounded-lg overflow-hidden shadow-sm flex-1 min-h-[300px]">
      <div className="flex items-center justify-between px-4 py-2 bg-editor-sidebar border-b border-gray-200 select-none">
        <div className="flex items-center gap-2">
           <div className={`w-3 h-3 rounded-full ${
             language === 'json' ? 'bg-amber-400' : 'bg-blue-500'
           }`} />
           <span className="text-sm font-semibold text-gray-700 tracking-wide">{label}</span>
        </div>
        {!readOnly && onFormat && (
          <button 
            onClick={onFormat}
            className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-black/5 transition-colors font-medium"
            title="Format Code"
          >
            Prettify
          </button>
        )}
      </div>
      
      <div className="relative flex-1 overflow-hidden">
        <textarea
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          className={`w-full h-full resize-none bg-editor-bg text-editor-fg font-mono text-sm p-4 outline-none custom-scrollbar leading-relaxed ${readOnly ? 'cursor-text' : 'cursor-text'}`}
          placeholder={readOnly ? "Result will appear here..." : "Enter code here..."}
        />
        
        {error && (
          <div className="absolute bottom-4 right-4 left-4 bg-red-50 text-red-800 px-4 py-3 rounded-md text-sm border border-red-200 shadow-lg animate-bounce-short">
            <div className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-mono whitespace-pre-wrap">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;