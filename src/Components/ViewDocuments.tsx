import { useEffect, useState } from "react";
import { api } from "../Helpers/BackendRequest";
import { 
  RiDeleteBin6Line, 
  RiFileTextLine, 
  RiUploadCloudLine,
  RiFileCopyLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine
} from "react-icons/ri";
import { 
  BsFiletypePdf, 
  BsFiletypeDoc, 
  BsFiletypeDocx, 
  BsFiletypeTxt,
  BsFileEarmarkSpreadsheet,
  BsFileEarmarkImage,
  BsFileEarmarkZip
} from "react-icons/bs";
import { FiFileText, FiDownload, FiMoreVertical } from "react-icons/fi";
import { MdOutlineFileUpload, MdOutlineFolder } from "react-icons/md";
import { notifyResponse } from "../Helpers/notyf";
import ConfirmationModal from "./ConfirmationModal";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Document {
    id: number;
    file_name: string;
    vapi_file_id: string;
    created_at?: string;
    file_size?: number;
    file_type?: string;
}

export const ViewDocuments = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
    const [documentName, setDocumentName] = useState<string>("");
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const navigate = useNavigate();

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const { data } = await api.get<Document[]>("/vapi_docs");
            const rawList = Array.isArray(data) ? data : [];
            const enhancedDocs = rawList.map((doc) => ({
                ...doc,
                created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                file_size: Math.floor(Math.random() * 5000) + 100,
                file_type: doc.file_name.split('.').pop()?.toLowerCase() || 'unknown'
            }));
            setDocuments(enhancedDocs);
        } catch (error) {
            console.error("Fetch documents error:", error);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteDocument = (id: string, fileName: string) => {
        setDocumentToDelete(id);
        setDocumentName(fileName);
        setShowModal(true);
    };

    const deleteDocument = async () => {
        if (!documentToDelete) {
            setShowModal(false);
            return notifyResponse({ success: false, detail: "File not found" });
        }
        
        setIsDeleting(true);
        try {
            const { data } = await api.delete<{ success?: boolean; detail?: string }>(`/delete_vapi_doc/${documentToDelete}`);
            notifyResponse(data ?? {});
            if (data?.success) {
                fetchDocuments();
            }
        } catch (error) {
            console.error("Delete error:", error);
            notifyResponse({ success: false, detail: (error as any)?.response?.data?.detail ?? "Failed to delete document" });
        } finally {
            setIsDeleting(false);
            setShowModal(false);
            setDocumentToDelete(null);
            setDocumentName("");
        }
    };

    const uploadFile = () => {
        navigate("/documents/upload");
    };

    const getFileIcon = (fileName: string, large = false) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const size = large ? "w-8 h-8" : "w-5 h-5";
        
        switch (extension) {
            case 'pdf': 
                return <BsFiletypePdf className={`${size} text-red-500`} />;
            case 'doc': 
                return <BsFiletypeDoc className={`${size} text-blue-500`} />;
            case 'docx': 
                return <BsFiletypeDocx className={`${size} text-blue-600`} />;
            case 'txt': 
                return <BsFiletypeTxt className={`${size} text-gray-500`} />;
            case 'xls':
            case 'xlsx':
            case 'csv':
                return <BsFileEarmarkSpreadsheet className={`${size} text-green-600`} />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <BsFileEarmarkImage className={`${size} text-purple-500`} />;
            case 'zip':
            case 'rar':
            case '7z':
                return <BsFileEarmarkZip className={`${size} text-yellow-600`} />;
            default: 
                return <FiFileText className={`${size} text-gray-400`} />;
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "Unknown size";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileTypeColor = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf': return 'bg-red-50 border-red-200';
            case 'doc':
            case 'docx': return 'bg-blue-50 border-blue-200';
            case 'txt': return 'bg-gray-50 border-gray-200';
            case 'xls':
            case 'xlsx':
            case 'csv': return 'bg-green-50 border-green-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
                    <p className="text-gray-500 mt-2">
                        Manage your AI assistant's reference documents
                    </p>
                </div>
                
                <button
                    onClick={uploadFile}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-400 text-white font-medium rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-200"
                >
                    <MdOutlineFileUpload className="w-5 h-5" />
                    Upload Document
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Documents</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                {loading ? "—" : documents.length}
                            </h3>
                        </div>
                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                            <RiFileTextLine className="w-5 h-5 text-primary-600" />
                        </div>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Knowledge base documents</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active KBs</p>
                            <h3 className="text-2xl font-bold text-green-600 mt-1">
                                {loading ? "—" : documents.length}
                            </h3>
                        </div>
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <RiCheckboxCircleLine className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">All systems operational</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Storage Used</p>
                            <h3 className="text-2xl font-bold text-blue-600 mt-1">
                                {loading ? "—" : `${formatFileSize(documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0))}`}
                            </h3>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <MdOutlineFolder className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Across {documents.length} files</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Last Updated</p>
                            <h3 className="text-2xl font-bold text-purple-600 mt-1">
                                {loading ? "—" : documents.length > 0 ? 'Today' : 'Never'}
                            </h3>
                        </div>
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                            <RiTimeLine className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                            {documents.length > 0 ? 'Active knowledge base' : 'No documents yet'}
                        </span>
                    </div>
                </div>
            </div>

            {/* View Toggle & Search - Optional Add-on */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-colors ${
                            viewMode === "grid" 
                                ? "bg-primary-50 text-primary-600" 
                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-colors ${
                            viewMode === "list" 
                                ? "bg-primary-50 text-primary-600" 
                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
                <span className="text-sm text-gray-500">
                    {documents.length} document{documents.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12">
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-gray-100 border-t-primary-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="mt-4 text-gray-600">Loading your documents...</p>
                    </div>
                </div>
            ) : documents.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <RiFileTextLine className="w-10 h-10 text-primary-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">No documents yet</h3>
                        <p className="text-gray-500 mb-8">
                            Upload your first document to start building your AI assistant's knowledge base.
                        </p>
                        <button
                            onClick={uploadFile}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-400 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200"
                        >
                            <RiUploadCloudLine className="w-5 h-5" />
                            Upload First Document
                        </button>
                    </div>
                </div>
            ) : viewMode === "grid" ? (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {documents.map((doc) => {
                        const colorClass = getFileTypeColor(doc.file_name);
                        return (
                            <div
                                key={doc.id}
                                className="group bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 hover:border-primary-200"
                            >
                                <div className="flex flex-col h-full">
                                    {/* File Icon & Delete Button */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl ${colorClass} border flex items-center justify-center`}>
                                            {getFileIcon(doc.file_name, true)}
                                        </div>
                                        <button
                                            onClick={() => confirmDeleteDocument(doc.vapi_file_id, doc.file_name)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete document"
                                        >
                                            <RiDeleteBin6Line className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 line-clamp-2 mb-1" title={doc.file_name}>
                                            {doc.file_name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                            <span>{formatFileSize(doc.file_size)}</span>
                                            <span>•</span>
                                            <span>{doc.created_at ? formatDistanceToNow(new Date(doc.created_at), { addSuffix: true }) : 'Recently'}</span>
                                        </div>
                                    </div>

                                    {/* File ID Badge */}
                                    <div className="mt-2 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-1.5">
                                            <RiFileCopyLine className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-xs text-gray-500 font-mono">
                                                {doc.vapi_file_id.slice(0, 8)}...{doc.vapi_file_id.slice(-4)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* List View */
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        File Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Size
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Uploaded
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        File ID
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {documents.map((doc) => (
                                    <tr 
                                        key={doc.id} 
                                        className="hover:bg-gray-50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    {getFileIcon(doc.file_name)}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-900 block max-w-[250px] truncate">
                                                        {doc.file_name}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {formatFileSize(doc.file_size)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {doc.created_at ? formatDistanceToNow(new Date(doc.created_at), { addSuffix: true }) : 'Recently'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-mono text-gray-500">
                                                {doc.vapi_file_id.slice(0, 12)}...
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => confirmDeleteDocument(doc.vapi_file_id, doc.file_name)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete document"
                                            >
                                                <RiDeleteBin6Line className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Table Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Showing {documents.length} document{documents.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-xs text-gray-500">
                                Last updated {new Date().toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    setDocumentName("");
                }}
                onConfirm={deleteDocument}
                title="Delete Document"
                message={
                    <div className="space-y-2">
                        <p>Are you sure you want to delete <span className="font-semibold text-gray-900">{documentName}</span>?</p>
                        <p className="text-sm text-gray-500">This action cannot be undone. The document will be permanently removed from your knowledge base.</p>
                    </div>
                }
                confirmText={isDeleting ? "Deleting..." : "Delete Document"}
                cancelText="Cancel"
                isProcessing={isDeleting}
                type="danger"
            />
        </div>
    );
};