import { ChangeEvent, useState } from "react";
import { api } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { useNavigate } from "react-router-dom";

// Icons
import { 
  FiUploadCloud, 
  FiCheckCircle, 
  FiXCircle, 
  FiFileText,
  FiAlertCircle 
} from "react-icons/fi";
import { 
  TbFileDescription,
  TbTrash 
} from "react-icons/tb";

export interface UploadFileProps {
    onSuccess?: (x: object) => unknown;
    onStart?: (...x: unknown[]) => unknown;
}

export function UploadFile({ onSuccess, onStart }: UploadFileProps) {
    const [fileName, setFileName] = useState<string>("");
    const [file, setFile] = useState<File | null>(null); 
    const [fileUploaded, setFileUploaded] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [dragActive, setDragActive] = useState<boolean>(false);
    const navigate = useNavigate();

    async function handleUpload() {
        if (!file || !fileName.trim()) {
            notifyResponse({ success: false, detail: "Please provide both a file and a list name" });
            return;
        }

        if (onStart) onStart();
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", fileName.trim());

        try {
            const { data } = await api.post<{ success?: boolean; detail?: string; message?: string }>("/files", formData);
            
            // Handle the response data
            if (data?.success) {
                notifyResponse({ success: true, detail: data.message || "File uploaded successfully" });
                setFileUploaded(true);
                
                // Navigate after successful upload
                setTimeout(() => {
                    navigate("/view-leads");
                }, 1000);
                
                if (onSuccess) onSuccess(data);
            } else {
                notifyResponse({ success: false, detail: data?.detail || "Upload failed" });
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.detail || error?.message || "Upload failed";
            notifyResponse({ success: false, detail: errorMessage });
        } finally {
            setIsUploading(false);
        }
    }

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            
            // Check if it's a CSV file
            if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
                notifyResponse({ success: false, detail: "Please upload a CSV file only" });
                return;
            }
            
            // Check file size (10MB max)
            if (selectedFile.size > 10 * 1024 * 1024) {
                notifyResponse({ success: false, detail: "File size must be less than 10MB" });
                return;
            }
            
            setFile(selectedFile);
            setFileUploaded(true);
            
            // Auto-fill name from filename if empty
            if (!fileName) {
                const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
                setFileName(nameWithoutExt);
            }
        }
    }

    function resetFileSelection() {
        setFile(null);
        setFileUploaded(false);
        // Don't reset fileName to allow keeping the name
    }

    function handleDrag(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            
            // Check if it's a CSV file
            if (!droppedFile.name.toLowerCase().endsWith('.csv')) {
                notifyResponse({ success: false, detail: "Please upload a CSV file only" });
                return;
            }
            
            // Check file size (10MB max)
            if (droppedFile.size > 10 * 1024 * 1024) {
                notifyResponse({ success: false, detail: "File size must be less than 10MB" });
                return;
            }
            
            setFile(droppedFile);
            setFileUploaded(true);
            
            // Auto-fill name from filename if empty
            if (!fileName) {
                const nameWithoutExt = droppedFile.name.replace(/\.[^/.]+$/, "");
                setFileName(nameWithoutExt);
            }
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="w-full">
            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                    dragActive 
                        ? 'border-primary-400 bg-primary-50' 
                        : fileUploaded 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/30'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".csv"
                />
                
                <label
                    htmlFor="file-upload"
                    className="w-full flex flex-col items-center justify-center text-center cursor-pointer"
                >
                    {fileUploaded && file ? (
                        <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <FiCheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="mb-2">
                                <span className="text-sm font-medium text-gray-900">File selected:</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <TbFileDescription className="w-5 h-5 text-primary-600" />
                                <span className="text-sm font-semibold text-gray-900">{file.name}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                                <FiUploadCloud className="w-8 h-8 text-primary-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                                {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                                or <span className="text-primary-600 font-medium">browse</span> to select a file
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <TbFileDescription className="w-3 h-3" />
                                <span>CSV only · Max 10MB</span>
                            </div>
                        </>
                    )}
                </label>

                {/* Remove file button */}
                {fileUploaded && file && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            resetFileSelection();
                        }}
                        className="absolute top-4 right-4 p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors group"
                        title="Remove file"
                    >
                        <FiXCircle className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                    </button>
                )}
            </div>

            {/* List Name Input */}
            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    List Names
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <TbFileDescription className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="e.g., Q1 2024 Leads, Customer List, etc."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        disabled={isUploading}
                    />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                    Choose a descriptive name for your lead list
                </p>
            </div>

            {/* Upload Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleUpload}
                    disabled={!file || !fileName.trim() || isUploading}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        !file || !fileName.trim() || isUploading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                    }`}
                >
                    {isUploading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <FiUploadCloud className="w-4 h-4" />
                            <span>Upload List</span>
                        </>
                    )}
                </button>
            </div>

            {/* File Info */}
            {file && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                        <FiAlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-blue-800">File ready for upload</p>
                            <p className="text-xs text-blue-600 mt-1">
                                Click upload to save this file. You'll be redirected to view your leads.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}