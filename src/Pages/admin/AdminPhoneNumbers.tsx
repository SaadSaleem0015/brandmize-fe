import { useEffect, useMemo, useState } from "react";
import { filterAndPaginate } from "../../Helpers/filterAndPaginate";
import { FaSearch, FaExclamationTriangle, FaPhone, FaUser, FaEnvelope, FaBuilding, FaUndo, FaTimes, FaSpinner, FaCheckCircle, FaClock } from "react-icons/fa";
import { PageNumbers } from "../../Components/PageNumbers";
import { api } from "../../Helpers/BackendRequest";

interface PhoneNumber {
    id: number;
    phone_number: string;
    friendly_name: string;
    region: string | null;
    postal_code: string | null;
    iso_country: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        is_active: boolean;
        created_at: string;
    };
}

interface ApiError {
    message: string;
    status?: number;
}

interface ReturnNumberResponse {
    message: string;
    success: boolean;
}

export function AdminPhoneNumbers() {
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
    const [returning, setReturning] = useState(false);
    const [returnError, setReturnError] = useState<string | null>(null);

    const { filteredItems: filteredPhoneNumbers, pagesCount, pageNumbers } = useMemo(
        () => filterAndPaginate(phoneNumbers, search, currentPage),
        [phoneNumbers, search, currentPage]
    );

    async function fetchPhoneNumbers() {
        setLoading(true);
        setError(null);
        
        try {
            const { data } = await api.get("/admin/phone-numbers-with-users");
            setPhoneNumbers(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error("Error fetching phone numbers:", err);
            setError({
                message: err.response?.data?.message || err.message || "Failed to fetch phone numbers",
                status: err.response?.status
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPhoneNumbers();
    }, []);

    async function handleReturnNumber(phoneNumber: PhoneNumber) {
        setSelectedNumber(phoneNumber);
        setShowReturnModal(true);
        setReturnError(null);
    }

    async function confirmReturnNumber() {
        if (!selectedNumber || !selectedNumber.id) return;

        setReturning(true);
        setReturnError(null);

        try {
            const { data } = await api.post(`/return-phone-number/${selectedNumber.id}`);

            if (data.success) {
                await fetchPhoneNumbers();
                setShowReturnModal(false);
                setSelectedNumber(null);
            } else {
                setReturnError(data.message || "Failed to return phone number");
            }
        } catch (err: any) {
            console.error("Error returning phone number:", err);
            setReturnError(err.response?.data?.message || err.message || "Failed to return phone number");
        } finally {
            setReturning(false);
        }
    }

    function closeReturnModal() {
        setShowReturnModal(false);
        setSelectedNumber(null);
        setReturnError(null);
    }

    // Stats
    const stats = {
        total: phoneNumbers.length,
        assigned: phoneNumbers.filter(p => p.user && p.user.name).length,
        unassigned: phoneNumbers.filter(p => !p.user || !p.user.name).length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="flex flex-col items-center justify-center py-12">
                        <FaSpinner className="text-primary-500 text-3xl animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Loading phone numbers...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md mx-auto">
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="bg-red-100 p-4 rounded-full mb-4">
                            <FaExclamationTriangle className="text-red-600 text-2xl" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Phone Numbers</h2>
                        <p className="text-gray-500 text-center mb-6">{error.message}</p>
                        <button
                            onClick={fetchPhoneNumbers}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary-200"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
                                <FaPhone className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Phone Numbers</h1>
                                <p className="text-sm text-gray-500 mt-0.5">Manage and view all registered phone numbers</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by number, user, or email..."
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            className="bg-white border border-gray-200 text-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none w-full lg:w-96 pl-11 pr-4 py-2.5 shadow-sm transition-all duration-200"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Numbers</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                            <FaPhone className="w-6 h-6 text-primary-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Assigned</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.assigned}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <FaUser className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Unassigned</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.unassigned}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <FaUser className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Stats Bar */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <FaPhone className="text-primary-500 text-sm" />
                                <span className="text-sm font-medium text-gray-700">
                                    Total: {phoneNumbers.length} phone numbers
                                </span>
                            </div>
                            {search && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        • Showing {filteredPhoneNumbers.length} results
                                    </span>
                                    <button
                                        onClick={() => setSearch("")}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                                    >
                                        <FaTimes className="text-xs" />
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Phone Number
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Assigned To
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    User Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredPhoneNumbers?.length > 0 ? (
                                filteredPhoneNumbers.map((phone, index) => (
                                    <tr 
                                        key={phone.id} 
                                        className={`hover:bg-gray-50 transition-colors duration-150 ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                        }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FaPhone className="text-primary-500 text-sm" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {phone.friendly_name || phone.phone_number}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-mono">
                                                        {phone.phone_number}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {phone.user ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-semibold text-primary-700">
                                                            {phone.user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {phone.user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            ID: {phone.user.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic flex items-center gap-2">
                                                    <FaUser className="text-xs" />
                                                    Not assigned
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {phone.user?.email ? (
                                                <a 
                                                    href={`mailto:${phone.user.email}`}
                                                    className="text-sm text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1"
                                                >
                                                    <FaEnvelope className="text-xs" />
                                                    {phone.user.email}
                                                </a>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">No email</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {phone.user ? (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                                                    phone.user.is_active
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}>
                                                    {phone.user.is_active ? (
                                                        <FaCheckCircle className="text-xs" />
                                                    ) : (
                                                        <FaTimes className="text-xs" />
                                                    )}
                                                    {phone.user.is_active ? "Active" : "Inactive"}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-500">
                                                    <FaTimes className="text-xs" />
                                                    No user
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <FaClock className="text-xs text-gray-400" />
                                                <span className="text-sm text-gray-500">
                                                    {new Date(phone.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleReturnNumber(phone)}
                                                disabled={!phone.user}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                                    phone.user
                                                        ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer'
                                                        : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                                }`}
                                                title={!phone.user ? "Cannot return unassigned number" : "Return number"}
                                            >
                                                <FaUndo className="text-xs" />
                                                Return
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-gray-100 p-4 rounded-full mb-4">
                                                <FaPhone className="text-gray-400 text-2xl" />
                                            </div>
                                            <h3 className="text-base font-medium text-gray-700 mb-1">
                                                {search ? 'No results found' : 'No phone numbers found'}
                                            </h3>
                                            <p className="text-sm text-gray-400 max-w-md">
                                                {search 
                                                    ? `No phone numbers match your search. Try adjusting your search terms.`
                                                    : 'No phone numbers have been registered yet.'
                                                }
                                            </p>
                                            {search && (
                                                <button
                                                    onClick={() => setSearch("")}
                                                    className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                                                >
                                                    Clear search
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredPhoneNumbers.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between flex-wrap gap-3">
                        <div className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, filteredPhoneNumbers.length)} of {filteredPhoneNumbers.length} results
                        </div>
                        <PageNumbers
                            pageNumbers={pageNumbers}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            pagesCount={pagesCount}
                            className="flex justify-center"
                        />
                    </div>
                )}
            </div>

            {/* Return Modal */}
            {showReturnModal && selectedNumber && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                    <FaUndo className="text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Return Phone Number</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>
                            <button
                                onClick={closeReturnModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={returning}
                            >
                                <FaTimes className="text-lg" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                                <p className="text-sm font-medium text-gray-800 mb-2">
                                    {selectedNumber.friendly_name || selectedNumber.phone_number}
                                </p>
                                {selectedNumber.user && (
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>User: <span className="font-medium text-gray-800">{selectedNumber.user.name}</span></p>
                                        <p>Email: <span className="font-medium text-gray-800">{selectedNumber.user.email}</span></p>
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm">
                                Are you sure you want to return this phone number? The user will lose access to this number.
                            </p>
                        </div>

                        {returnError && (
                            <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-700">{returnError}</p>
                            </div>
                        )}

                        <div className="flex gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={closeReturnModal}
                                disabled={returning}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReturnNumber}
                                disabled={returning}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                            >
                                {returning ? (
                                    <>
                                        <FaSpinner className="text-sm animate-spin" />
                                        Returning...
                                    </>
                                ) : (
                                    <>
                                        <FaUndo className="text-xs" />
                                        Return Number
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}