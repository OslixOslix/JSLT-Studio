import React, { useState, useEffect } from 'react';
import CodeEditor from './components/CodeEditor';
import { JSLTService } from './services/jsltService';
import { DEFAULT_INPUT_JSON, DEFAULT_JSLT_SCHEMA, DEFAULT_OUTPUT_PREVIEW } from './constants';

enum Status {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

const App: React.FC = () => {
  const [inputJson, setInputJson] = useState<string>(DEFAULT_INPUT_JSON);
  const [jsltSchema, setJsltSchema] = useState<string>(DEFAULT_JSLT_SCHEMA);
  const [outputJson, setOutputJson] = useState<string>(DEFAULT_OUTPUT_PREVIEW);
  
  const [inputError, setInputError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // Auto-validate Input JSON on change
  useEffect(() => {
    if (!inputJson.trim()) {
      setInputError(null);
      return;
    }
    if (!JSLTService.validateJson(inputJson)) {
      setInputError("Invalid JSON Syntax");
    } else {
      setInputError(null);
    }
  }, [inputJson]);

  const handleTransform = async () => {
    if (inputError) return;
    
    setStatus(Status.LOADING);
    const startTime = performance.now();
    
    try {
      const result = await JSLTService.transform(inputJson, jsltSchema);
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      
      // Check if the result itself indicates an error from the service
      if (result.includes('"error":')) {
         try {
            const parsed = JSON.parse(result);
            if (parsed.error) {
               // It's a logic error caught by the engine
               setOutputJson(result); 
               setStatus(Status.ERROR);
               return;
            }
         } catch {
             // Continue if it wasn't actually an error object
         }
      }

      setOutputJson(result);
      setStatus(Status.SUCCESS);
    } catch (e) {
      setStatus(Status.ERROR);
      setOutputJson(JSON.stringify({ error: "Unknown application error" }, null, 2));
    }
  };

  const handleFormat = (type: 'input' | 'schema') => {
    try {
      if (type === 'input') {
        const parsed = JSON.parse(inputJson);
        setInputJson(JSON.stringify(parsed, null, 2));
      } else {
        // JSLT is not strict JSON, but often resembles it. 
        // If it parses as JSON, format it. If not, leave it (simple heuristic).
        try {
           const parsed = JSON.parse(jsltSchema);
           setJsltSchema(JSON.stringify(parsed, null, 2));
        } catch {
           // If it's complex JSLT with functions/expressions, standard JSON prettify fails.
           // We'll just trim it.
           setJsltSchema(jsltSchema.trim());
        }
      }
    } catch (e) {
      // Ignore format errors
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">JSLT <span className="text-indigo-600">Studio</span></h1>
            <p className="text-xs text-gray-500">Schibsted JSON Transformation Previewer</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {status === Status.SUCCESS && executionTime && (
            <span className="text-xs text-green-600 font-mono font-medium">
              Completed in {executionTime}ms
            </span>
          )}
          
          <button
            onClick={handleTransform}
            disabled={status === Status.LOADING || !!inputError}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-all shadow-sm
              ${status === Status.LOADING 
                ? 'bg-gray-200 cursor-not-allowed text-gray-500' 
                : inputError 
                  ? 'bg-red-50 text-red-600 cursor-not-allowed border border-red-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/20 active:transform active:scale-95'
              }
            `}
          >
            {status === Status.LOADING ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Run Transform
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 p-4 lg:p-6 overflow-hidden">
        {/* Left to right layout: Input -> Schema -> Output */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[calc(100vh-140px)]">
          
          {/* Pane 1: Input JSON */}
          <div className="flex flex-col h-full gap-2 order-1">
            <CodeEditor
              label="Input JSON"
              value={inputJson}
              onChange={setInputJson}
              language="json"
              error={inputError}
              onFormat={() => handleFormat('input')}
            />
             <p className="text-xs text-gray-500 px-1 font-medium">
               Source data object to be transformed.
             </p>
          </div>

          {/* Pane 2: JSLT Schema */}
          <div className="flex flex-col h-full gap-2 order-2">
            <CodeEditor
              label="JSLT Schema"
              value={jsltSchema}
              onChange={setJsltSchema}
              language="jslt"
              onFormat={() => handleFormat('schema')}
            />
            <p className="text-xs text-gray-500 px-1 font-medium">
               Use <a href="https://github.com/schibsted/jslt" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">JSLT syntax</a> to define rules.
            </p>
          </div>

          {/* Pane 3: Output JSON */}
          <div className="flex flex-col h-full gap-2 order-3">
            <CodeEditor
              label="Output Result"
              value={outputJson}
              readOnly={true}
              language="json"
              error={status === Status.ERROR ? "Transformation failed or returned invalid JSON" : null}
            />
            <p className="text-xs text-gray-500 px-1 font-medium">
               The computed result of the transformation.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;