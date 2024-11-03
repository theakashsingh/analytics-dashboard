/* eslint-disable react/prop-types */
import { useCallback } from "react";
import { parseCSVData } from "./utils/dataProcessing";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

export const FileUploader = ({ onFileProcess, isLoading, error }) => {
    const onDrop = useCallback(async acceptedFiles => {
      const file = acceptedFiles[0];
      if (!file) return;
      
      try {
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.onerror = () => reject(new Error("File reading failed"));
          reader.readAsText(file);
        });
        
        const parsedData = parseCSVData(text);
        onFileProcess(parsedData);
      } catch (err) {
        console.error("Error processing file:", err);
      }
    }, [onFileProcess]);
  
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: { "text/csv": [".csv"] },
      multiple: false,
    });
  
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8
            ${isDragActive ? "border-blue-500 bg-blue-50" : "border-blue-200"}
            ${isLoading ? "opacity-50 cursor-wait" : "cursor-pointer"}
            transition-all duration-200 hover:border-blue-400
            flex flex-col items-center justify-center
          `}
        >
          <input {...getInputProps()} />
          <Upload className={`w-12 h-12 ${isDragActive ? "text-blue-500" : "text-blue-400"} mb-4`} />
          {isLoading ? (
            <p className="text-blue-900 text-lg font-medium">Processing file...</p>
          ) : (
            <>
              <p className="text-blue-900 text-lg font-medium text-center">
                {isDragActive ? "Drop your CSV file here!" : "Drop your CSV file here, or click to select"}
              </p>
              <p className="text-blue-500 text-sm mt-2">Supports CSV files only</p>
            </>
          )}
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-600">{error}</div>
        )}
      </div>
    );
  };