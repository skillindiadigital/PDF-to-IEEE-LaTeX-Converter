import React, { useRef, useState } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        alert("Please upload a PDF file.");
        return;
      }
      setSelectedFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!disabled && e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const triggerInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div
        className={`relative group border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer
          ${dragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
        
        <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:bg-indigo-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>

        {selectedFileName ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <p className="text-sm font-semibold text-indigo-600 mb-1">Selected File</p>
             <p className="text-slate-800 font-medium truncate max-w-[250px]">{selectedFileName}</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-slate-700 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-slate-500">
              PDF files only (Abstract extraction)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;