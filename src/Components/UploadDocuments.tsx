import React, { ChangeEvent, useState } from "react";
import { api } from "../Helpers/BackendRequest";
import { 
  TbUpload, 
  TbFileUpload, 
  TbFileInfo, 
  TbChecklist, 
  TbAlertTriangle,
  TbX,
  TbFileDescription,
  TbFileText,
  TbFiles,
  TbArrowRight,
  TbBulb,
  TbBook,
  TbInfoCircle,
  TbDownload,
  TbTrash
} from "react-icons/tb";
import { FcCheckmark } from "react-icons/fc";
import { 
  AiOutlineCloseCircle, 
  AiOutlineInfoCircle, 
  AiOutlineWarning, 
  AiOutlineCheckCircle 
} from "react-icons/ai";
import { MdOutlineTipsAndUpdates, MdOutlineDescription, MdOutlineLibraryBooks } from "react-icons/md";
import { FiExternalLink, FiFile, FiFileText } from "react-icons/fi";
import { 
  RiFileTextLine, 
  RiUploadCloudLine, 
  RiDeleteBin6Line,
  RiFileCopyLine,
  RiFileSearchLine
} from "react-icons/ri";
import { 
  BsFiletypePdf, 
  BsFiletypeDoc, 
  BsFiletypeDocx, 
  BsFiletypeTxt,
  BsFileEarmarkRichtext 
} from "react-icons/bs";
import { notifyResponse } from "../Helpers/notyf";
import { useNavigate } from "react-router-dom";

export interface UploadFileProps {
    onSuccess?: (response: object) => void;
    onStart?: () => void;
}

export const UploadDocuments: React.FC<UploadFileProps> = ({ onSuccess, onStart }) => {
    const [fileName, setFileName] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [fileUploaded, setFileUploaded] = useState<boolean>(false);
    const [showInstructions, setShowInstructions] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [sizeWarning, setSizeWarning] = useState<string>("");
    const [dragActive, setDragActive] = useState<boolean>(false);
    const navigate = useNavigate();

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
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSizeWarning("");
        
        if (e.currentTarget.files && e.currentTarget.files.length > 0) {
            handleFile(e.currentTarget.files[0]);
        } else {
            resetFileSelection();
        }
    };

    const handleFile = (selectedFile: File) => {
        const fileSizeMB = selectedFile.size / 1048576;
        
        if (fileSizeMB > 5) {
            notifyResponse({ 
                success: false, 
                detail: "File size must be less than 5MB. Please upload a smaller file." 
            });
            return;
        }
        
        if (fileSizeMB > 1) {
            setSizeWarning(`File size is ${fileSizeMB.toFixed(1)}MB. For optimal performance, we recommend files under 1MB.`);
        }
        
        setFile(selectedFile);
        setFileUploaded(true);
        
        if (!fileName) {
            const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
            setFileName(nameWithoutExt);
        }
    };

    const resetFileSelection = () => {
        setFile(null);
        setFileUploaded(false);
        setFileName("");
        setSizeWarning("");
    };

    const getFileIcon = (size: 'sm' | 'lg' = 'lg') => {
        if (!file) return <RiFileTextLine className={size === 'lg' ? "text-5xl" : "text-3xl"} />;
        
        const extension = file.name.split('.').pop()?.toLowerCase();
        const iconClass = size === 'lg' ? "text-5xl" : "text-3xl";
        
        switch (extension) {
            case 'pdf': return <BsFiletypePdf className={`${iconClass} text-red-500`} />;
            case 'doc': return <BsFiletypeDoc className={`${iconClass} text-blue-500`} />;
            case 'docx': return <BsFiletypeDocx className={`${iconClass} text-blue-600`} />;
            case 'txt': return <BsFiletypeTxt className={`${iconClass} text-gray-500`} />;
            default: return <RiFileTextLine className={`${iconClass} text-gray-500`} />;
        }
    };

    const getFileTypeColor = () => {
        if (!file) return 'bg-gray-100';
        
        const extension = file.name.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf': return 'bg-red-50';
            case 'doc':
            case 'docx': return 'bg-blue-50';
            case 'txt': return 'bg-gray-50';
            default: return 'bg-gray-100';
        }
    };

    const upload = async () => {
        if (!file || !fileName.trim()) {
            notifyResponse({ 
                success: false, 
                detail: "Please provide both a file and a knowledge base name" 
            });
            return;
        }

        const fileSizeMB = file.size / 1048576;
        if (fileSizeMB > 5) {
            notifyResponse({ 
                success: false, 
                detail: "File size must be less than 5MB. Please compress your file." 
            });
            return;
        }

        setIsUploading(true);
        if (onStart) onStart();

        const data = new FormData();
        data.append("file", file);
        data.append("name", fileName.trim());

        try {
            const { data: resData } = await api.post<{ success?: boolean; detail?: string }>("/documents", data, {});
            notifyResponse(resData ?? {});
            if (resData?.success) {
                if (onSuccess) onSuccess(resData);
                navigate("/documents");
                resetFileSelection();
            }
        } catch (error) {
            console.error("Upload error:", error);
            notifyResponse({ 
                success: false, 
                detail: "Upload failed. Please try again." 
            });
        } finally {
            setIsUploading(false);
        }
    };

    const InstructionsModal = () => (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-gray-200 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                <MdOutlineTipsAndUpdates className="text-2xl text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Knowledge Base Guidelines</h2>
                                <p className="text-sm text-gray-600 mt-1">Best practices for optimal AI performance</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowInstructions(false)}
                            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                        >
                            <TbX className="text-xl text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="space-y-6">
                        {/* File Size Card */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-5">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <TbAlertTriangle className="text-xl text-yellow-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-yellow-800 mb-2">File Size Recommendations</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-yellow-700 mb-1">Maximum Limit</p>
                                            <p className="text-2xl font-bold text-yellow-800">5MB</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-yellow-700 mb-1">Recommended</p>
                                            <p className="text-2xl font-bold text-green-600">&lt; 1MB</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-yellow-700 mt-3">
                                        Larger files take longer to process and may impact response times. Split large documents into smaller, focused knowledge bases.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Requirements */}
                            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <TbChecklist className="text-lg text-primary-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">Requirements</h3>
                                </div>
                                <ul className="space-y-3">
                                    {[
                                        "Maximum 5MB per document",
                                        "PDF, DOC, DOCX, TXT formats",
                                        "Plain text recommended",
                                        "Clear, structured content"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <AiOutlineCheckCircle className="text-xs text-green-600" />
                                            </div>
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Best Practices */}
                            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <TbBulb className="text-lg text-purple-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">Best Practices</h3>
                                </div>
                                <ul className="space-y-3">
                                    {[
                                        "Use clear section headings",
                                        "Keep under 1MB for speed",
                                        "Update regularly for accuracy",
                                        "Split large documents"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-xs text-purple-600 font-bold">✓</span>
                                            </div>
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Example Section */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <BsFileEarmarkRichtext className="text-lg text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Example Document Structure</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">Medical Treatment Guidelines • ~45KB</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="bg-gray-900 rounded-xl p-5 font-mono text-sm">
                                    <div className="text-primary-400 font-semibold mb-3"># TREATMENT PROTOCOLS</div>
                                    <div className="ml-4 space-y-3">
                                        <div>
                                            <div className="text-green-400">• Common Cold Treatment:</div>
                                            <div className="ml-4 text-gray-300">- Rest and hydration recommended</div>
                                            <div className="ml-4 text-gray-300">- Acetaminophen for fever</div>
                                            <div className="ml-4 text-gray-300">- Symptoms resolve in 7-10 days</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
                                    <p className="text-xs text-primary-700">
                                        <span className="font-semibold">System Prompt:</span> "You are a medical assistant. Reference the treatment guidelines document when answering questions about medical protocols."
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Tips Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { icon: TbFileText, label: "Descriptive names", color: "text-blue-600", bg: "bg-blue-50" },
                                { icon: TbFiles, label: "Split large files", color: "text-green-600", bg: "bg-green-50" },
                                { icon: RiFileSearchLine, label: "Test responses", color: "text-purple-600", bg: "bg-purple-50" },
                                { icon: TbBook, label: "Update regularly", color: "text-orange-600", bg: "bg-orange-50" }
                            ].map((tip, i) => {
                                const Icon = tip.icon;
                                return (
                                    <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                                        <div className={`${tip.bg} w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                                            <Icon className={`${tip.color} text-lg`} />
                                        </div>
                                        <p className="text-xs text-gray-700">{tip.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                    <button
                        onClick={() => setShowInstructions(false)}
                        className="w-full py-3.5 bg-primary-400 text-white rounded-xl hover:bg-primary-600 font-medium transition-all shadow-lg"
                    >
                        Start Uploading
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8">
                <button
                    type="button"
                    onClick={() => navigate("/documents")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Knowledge Base
                </button>
                {/* Page Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl mb-4">
                        <RiUploadCloudLine className="text-3xl text-primary-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Upload Knowledge Base</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Add documents that your AI assistant can reference during conversations. 
                        We support PDF, DOC, DOCX, and TXT files up to 5MB.
                    </p>
                </div>

                {/* Main Upload Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Header with Guidelines */}
                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-gray-200 px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                                    <TbFileInfo className="text-xl text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Upload Guidelines</h3>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        Max 5MB • Recommended: under 1MB • PDF, DOC, DOCX, TXT
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowInstructions(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 rounded-xl hover:bg-primary-50 transition-colors text-sm font-medium border border-gray-200 shadow-sm"
                            >
                                <MdOutlineTipsAndUpdates className="text-lg" />
                                View Full Guidelines
                                <TbArrowRight className="text-lg" />
                            </button>
                        </div>
                    </div>

                    {/* Upload Area */}
                    <div className="p-8">
                        {/* File Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Document
                            </label>
                            <div
                                className={`relative transition-all duration-200 ${
                                    dragActive ? 'scale-[1.02]' : ''
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
                                    accept=".pdf,.doc,.docx,.txt"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className={`flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                                        fileUploaded
                                            ? 'border-green-300 bg-green-50'
                                            : dragActive
                                            ? 'border-primary-400 bg-primary-50 scale-[1.02]'
                                            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                                    }`}
                                >
                                    {fileUploaded && file ? (
                                        <div className="flex flex-col items-center">
                                            <div className={`${getFileTypeColor()} w-20 h-20 rounded-2xl flex items-center justify-center mb-4`}>
                                                {getFileIcon('lg')}
                                            </div>
                                            <div className="text-center mb-3">
                                                <p className="font-semibold text-gray-900 mb-1">{file.name}</p>
                                                <div className="flex items-center gap-3 justify-center">
                                                    <span className="text-sm text-gray-500">
                                                        {(file.size / 1048576).toFixed(2)} MB
                                                    </span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <span className="text-sm text-gray-500 capitalize">
                                                        {file.type || 'Document'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    resetFileSelection();
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium border border-gray-200"
                                            >
                                                <TbTrash className="text-lg" />
                                                Remove file
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                                <TbUpload className="text-3xl text-gray-400" />
                                            </div>
                                            <p className="font-semibold text-gray-900 mb-1">
                                                {dragActive ? 'Drop your file here' : 'Click to select or drag and drop'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                PDF, DOC, DOCX, TXT (max 5MB)
                                            </p>
                                        </>
                                    )}
                                </label>
                            </div>
                            
                            {/* Size Warning */}
                            {sizeWarning && (
                                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl animate-in slide-in-from-top-2">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <AiOutlineWarning className="text-yellow-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-yellow-800 mb-1">File Size Notice</p>
                                            <p className="text-sm text-yellow-700">{sizeWarning}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Knowledge Base Name */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Knowledge Base Name
                                </label>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    Required
                                </span>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <TbFileDescription className="text-gray-400 text-lg" />
                                </div>
                                <input
                                    type="text"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    placeholder="e.g., Product FAQ 2024, Support Guidelines, Company Policies"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Choose a descriptive, unique name for easy identification in your knowledge base
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => navigate("/documents")}
                                className="w-full sm:w-auto px-6 py-3.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={upload}
                                disabled={!file || !fileName.trim() || isUploading}
                                className={`flex-1 inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-medium transition-all ${
                                    !file || !fileName.trim() || isUploading
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-primary-400 text-white hover:bg-primary-600 shadow-lg shadow-primary-200'
                                }`}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Uploading Knowledge Base...</span>
                                    </>
                                ) : (
                                    <>
                                        <RiUploadCloudLine className="text-xl" />
                                        <span>Upload Knowledge Base</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Tips Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <TbFileText className="text-xl text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">1. Choose a name</h4>
                                <p className="text-xs text-gray-500">Be descriptive</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Use clear, specific names like <span className="font-mono text-primary-600 bg-primary-50 px-2 py-1 rounded">"Product-FAQ-2024"</span>
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <TbFiles className="text-xl text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">2. Optimize size</h4>
                                <p className="text-xs text-gray-500">Keep under 1MB</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Split large documents into smaller, focused knowledge bases for better performance
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                <RiFileSearchLine className="text-xl text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">3. Test & refine</h4>
                                <p className="text-xs text-gray-500">Verify responses</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Test your AI assistant with sample questions after uploading
                        </p>
                    </div>
                </div>

                {/* Supported Formats */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FiFile className="text-gray-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">Supported File Formats</h4>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { icon: BsFiletypePdf, name: "PDF", color: "text-red-500", bg: "bg-red-50" },
                            { icon: BsFiletypeDoc, name: "DOC", color: "text-blue-500", bg: "bg-blue-50" },
                            { icon: BsFiletypeDocx, name: "DOCX", color: "text-blue-600", bg: "bg-blue-50" },
                            { icon: BsFiletypeTxt, name: "TXT", color: "text-gray-500", bg: "bg-gray-100" },
                        ].map((format, i) => {
                            const Icon = format.icon;
                            return (
                                <div key={i} className={`flex items-center gap-2 px-4 py-2 ${format.bg} rounded-lg border border-gray-200`}>
                                    <Icon className={`${format.color} text-lg`} />
                                    <span className="text-sm font-medium text-gray-700">{format.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Instructions Modal */}
            {showInstructions && <InstructionsModal />}
        </>
    );
};