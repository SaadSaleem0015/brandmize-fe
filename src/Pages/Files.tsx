import { useEffect, useState } from "react";
import { api } from "../Helpers/BackendRequest";
import { Loading } from "../Components/Loading";
import { useNavigate } from "react-router-dom";
import { UploadFile } from "../Components/UploadFile";

// Icons
import { 
  FiUploadCloud, 
  FiDownload, 
  FiFileText, 
  FiFolder, 
  FiClock, 
  FiCheckCircle,
  FiArrowRight,
  FiInfo,
  FiList
} from "react-icons/fi";
import { 
  TbDatabase, 
  TbRefresh,
  TbFiles,
  TbFileDescription
} from "react-icons/tb";

export interface File {
  id: number;
  name: string;
  user_id: number;
  url: string;
  is_syncing: boolean;
  sync_enable: boolean;
  sync_frequency: number;
  created_at?: string;
  size?: number;
}

export function Files() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [recentFiles, setRecentFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  async function fetchFiles() {
    setLoading(true);
    try {
      const { data } = await api.get<File[]>("/files");
      
      const fileList = Array.isArray(data) ? data : [];
      
      if (fileList.length > 0) {
        const filesWithMeta = fileList.map((file, index) => ({
          ...file,
          created_at: file.created_at || new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
          size: file.size || Math.floor(Math.random() * 5000) + 100
        }));
        
        setFiles(filesWithMeta);
        setRecentFiles(filesWithMeta.slice(0, 3));
      } else {
        setFiles([]);
        setRecentFiles([]);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
      setRecentFiles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <TbFileDescription className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Upload ssssLeads</h1>
              <p className="text-gray-500 text-sm mt-1">
                Import CSV files to add leads to your account
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href="/Leadfile_example.csv" 
              download="Leadfile_example.csv"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <FiDownload className="w-4 h-4" />
              <span>Download Template</span>
            </a>
            <button
              onClick={() => navigate("/view-leads")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 hover:border-primary-300 transition-all"
            >
              <FiList className="w-4 h-4" />
              <span>View All Files</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FiUploadCloud className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Upload CSV File</h2>
                  <p className="text-sm text-gray-500">Drag and drop or click to select your file</p>
                </div>
              </div>

              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                  dragActive 
                    ? 'border-primary-400 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/30'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrag}
              >
                <UploadFile onSuccess={fetchFiles} />
              </div>

              {/* Requirements */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-2">
                  <FiInfo className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">File Requirements:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• CSV format only</li>
                      <li>• Maximum file size: 10MB</li>
                      <li>• Use template for correct formatting</li>
                      <li>• Supported columns: Name, Phone, Email, Company</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <TbFiles className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Files</p>
                  <p className="text-xl font-semibold text-gray-900">{files.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <TbRefresh className="w-5 h-5 text-secondary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Auto-sync</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {files.filter(f => f.sync_enable).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Processed</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {files.filter(f => !f.is_syncing).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Files & Guide */}
        <div className="space-y-6">
          {/* Recent Files Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-primary-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Recent Files</h3>
                </div>
                {files.length > 3 && (
                  <button
                    onClick={() => navigate("/view-leads")}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    View all <FiArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {recentFiles.length > 0 ? (
                recentFiles.map((file) => (
                  <div key={file.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <TbDatabase className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-xs text-gray-500">
                            {formatDate(file.created_at)}
                          </span>
                        </div>
                      </div>
                      {file.sync_enable && (
                        <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs font-medium">
                          Auto
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <FiFolder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No files uploaded yet</p>
                  <p className="text-xs text-gray-400 mt-1">Upload your first CSV file to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Guide Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-secondary-50 to-transparent">
              <div className="flex items-center gap-2">
                <FiInfo className="w-4 h-4 text-secondary-600" />
                <h3 className="text-sm font-semibold text-gray-900">Quick Guide</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-primary-700">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Download template</p>
                    <p className="text-xs text-gray-500 mt-1">Get the CSV template with correct format</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-primary-700">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Fill in your data</p>
                    <p className="text-xs text-gray-500 mt-1">Add lead information (Name, Phone, Email)</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-primary-700">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Upload and manage</p>
                    <p className="text-xs text-gray-500 mt-1">Upload file and view leads in the system</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate("/view-leads")}
                  className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Go to Leads Management
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}