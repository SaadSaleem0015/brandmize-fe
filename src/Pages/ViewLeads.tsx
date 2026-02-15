import { useEffect, useMemo, useState } from "react";
import { api } from "../Helpers/backendRequest";
import { Card } from "../Components/Card";
import { TbEye, TbTrash, TbUpload, TbSearch, TbCopy, TbFile, TbCalendar, TbUsers } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { notifyResponse } from "../Helpers/notyf";
import { Loading } from "../Components/Loading";
import ConfirmationModal from "../Components/ConfirmationModal";
import { filterAndPaginate } from "../Helpers/filterAndPaginate";
import { PageNumbers } from "../Components/PageNumbers";
import { FormateTime } from "../Helpers/formateTime";

export interface File {
  id: number;
  name: string;
  user_id: number;
  url: string;
  created_at: string;
  leads_count: number;
  alphanumeric_id: string;
}

export function ViewLeads() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    filteredItems = [],
    pagesCount = 1,
    pageNumbers = [],
  } = useMemo(
    () => filterAndPaginate(files, search, currentPage),
    [files, search, currentPage]
  );

  async function fetchFiles() {
    setLoading(true);
    try {
      const { data } = await api.get<File[]>("/files");
      if (Array.isArray(data)) {
        setFiles(data);
      } else {
        console.error("Fetched data is not an array:", data);
        setFiles([]);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  const confirmDeleteFile = (id: number) => {
    setFileToDelete(id);
    setShowModal(true);
  };

  async function deleteFile() {
    if (fileToDelete === null) return;

    try {
      const { data } = await api.delete<{ success?: boolean; detail?: string }>(`/files/${fileToDelete}`);
      notifyResponse(data ?? {});
      if (data?.success) {
        setFiles((oldFiles) =>
          oldFiles.filter((file) => file.id !== fileToDelete)
        );
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      notifyResponse({ success: false, detail: (error as any)?.response?.data?.detail ?? "Failed to delete file" });
    } finally {
      setShowModal(false);
      setFileToDelete(null);
    }
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  const uploadFile = () => {
    navigate("/files");
  };

  const handleCopy = (fileId: string, alphanumericId: string) => {
    navigator.clipboard.writeText(alphanumericId).then(() => {
      setCopiedId(fileId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/files")}
        className="flex items-center gap-2 text-primary-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Files
      </button>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Files</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and view all uploaded lead files</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative">
            <TbSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setCurrentPage(1);
              }}
              placeholder="Search files..."
              className="pl-10 pr-4 py-2.5 w-full sm:w-64 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Upload Button */}
          <button
            onClick={uploadFile}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-400 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <TbUpload className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{files.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TbFile className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {files.reduce((sum, file) => sum + (file.leads_count || 0), 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <TbUsers className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Upload</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {files.length > 0 
                  ? FormateTime(new Date(files[0].created_at))
                  : "No files"
                }
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TbCalendar className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Files Table */}
      <Card className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  File ID
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  File Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Source
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Records
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                  {/* File ID with Copy */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        {file.alphanumeric_id}
                      </code>
                      <button
                        onClick={() => handleCopy(file.id.toString(), file.alphanumeric_id)}
                        className="p-1 rounded hover:bg-gray-200 transition-colors relative"
                        title="Copy ID"
                      >
                        <TbCopy className={`w-4 h-4 ${copiedId === file.id.toString() ? 'text-green-600' : 'text-gray-500'}`} />
                        {copiedId === file.id.toString() && (
                          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            Copied!
                          </span>
                        )}
                      </button>
                    </div>
                  </td>

                  {/* File Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TbFile className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {file.name}
                        </p>
                      
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TbFile className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium text-gray-900 truncate max-w-[200px] ${file.type == "zoho" ? "bg-primary text-white px-2 py-1 rounded-md" : file.type == "hubspot" ? "bg-green-100 text-green-700 px-2 py-1 rounded-md" : "bg-yellow-100 text-gray-500 px-2 py-1 rounded-md"}`}>
                          {file.type ? file.type : "Custom"}
                        </p>
                      
                      </div>
                    </div>
                  </td>
                  {/* Records Count */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        file.leads_count > 1000 
                          ? 'bg-green-100 text-green-700' 
                          : file.leads_count > 100 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        <span className="text-sm font-bold">{file.leads_count}</span>
                      </div>
                      <span className="text-sm text-gray-600">leads</span>
                    </div>
                  </td>

                  {/* Upload Date */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <TbCalendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {file.created_at ? FormateTime(new Date(file.created_at)) : "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/leads?url=${file.url ? "true" : "false"}&file_id=${file.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors"
                        title="View Leads"
                      >
                        <TbEye className="w-3.5 h-3.5" />
                        View
                      </Link>
                      
                      <button
                        onClick={() => confirmDeleteFile(file.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete File"
                      >
                        <TbTrash className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <TbFile className="w-12 h-12 mb-3 opacity-30" />
                      <p className="text-sm font-medium">No lead files found</p>
                      <p className="text-xs mt-1">
                        {search ? "Try a different search term" : "Upload your first file to get started"}
                      </p>
                      {!search && (
                        <button
                          onClick={uploadFile}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-400 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                        >
                          <TbUpload className="w-4 h-4" />
                          Upload File
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {filteredItems.length > 0 && (
        <PageNumbers
          pageNumbers={pageNumbers}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pagesCount={pagesCount}
          totalItems={files.length}
          itemsPerPage={10}
          showInfo={true}
          className="mt-6"
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={deleteFile}
        title="Delete File"
        message="Are you sure you want to delete this file? All associated leads will also be removed. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />
    </div>
  );
}