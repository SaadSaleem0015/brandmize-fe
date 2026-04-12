import { useEffect, useMemo, useState, useCallback } from "react";
import { filterAndPaginate } from "../../Helpers/filterAndPaginate";
import { FaSearch, FaExclamationTriangle, FaPhone, FaUser, FaEnvelope, FaBuilding, FaUndo, FaTimes, FaSpinner } from "react-icons/fa";
import { PageNumbers } from "../../Components/PageNumbers";
import { api } from "../../Helpers/BackendRequest";

interface PhoneNumber {
    phone_number: string;
    phone_sid: string | null;
    username: string | null;
    email: string | null;
    company_name: string | null;
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
    const [returning, setReturning] = useState(false);
    const [returnError, setReturnError] = useState<string | null>(null);

    const { filteredItems: filteredPhoneNumbers, pagesCount, pageNumbers } = useMemo(
        () => filterAndPaginate(
            phoneNumbers,
            search,
            currentPage
        ),
        [phoneNumbers, search, currentPage]
    );

    const fetchPhoneNumbers = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const { data } = await api.get<PhoneNumber[]>("/phone_numbers");
            const phoneNumbersList: PhoneNumber[] = Array.isArray(data) ? data : [];
            setPhoneNumbers(phoneNumbersList);
        } catch (err: any) {
            console.error("Error fetching phone numbers:", err);
            setError({
                message: err.response?.data?.message || err.message || "Failed to fetch phone numbers",
                status: err.response?.status
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const handleRetry = () => {
        fetchPhoneNumbers();
    };

    const handleReturnNumber = (phoneNumber: PhoneNumber) => {
        setSelectedNumber(phoneNumber);
        setShowReturnModal(true);
        setReturnError(null);
    };

    const confirmReturnNumber = async () => {
        if (!selectedNumber || !selectedNumber.phone_sid) return;

        setReturning(true);
        setReturnError(null);

        try {
            const { data } = await api.post<ReturnNumberResponse>(`/return-phone-number/${selectedNumber.phone_sid}`);

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
    };

    const closeReturnModal = () => {
        setShowReturnModal(false);
        setSelectedNumber(null);
        setReturnError(null);
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                    <div className="flex flex-col items-center justify-center py-12">
                        <FaSpinner className="text-primary-500 text-3xl animate-spin mb-4" />
                        <p className="text-gray-500">Loading phone numbers...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="bg-red-100 p-4 rounded-full mb-4">
                            <FaExclamationTriangle className="text-red-700 text-2xl" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Phone Numbers</h2>
                        <p className="text-gray-500 text-center mb-6 max-w-md">
                            {error.message}
                            {error.status && ` (Status: ${error.status})`}
                        </p>
                        <button
                            onClick={handleRetry}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">Phone Numbers</h1>
                        <p className="text-sm text-gray-500">Manage and view all registered phone numbers</p>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search phone numbers, users, or companies..."
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            className="bg-white border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none w-full lg:w-80 pl-11 pr-4 py-2.5 shadow-sm transition-all duration-200"
                        />
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Stats Bar */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
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
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <FaPhone className="text-gray-400 text-xs" />
                                        Phone Number
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <FaUser className="text-gray-400 text-xs" />
                                        Username
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <FaEnvelope className="text-gray-400 text-xs" />
                                        Email
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <FaBuilding className="text-gray-400 text-xs" />
                                        Company
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredPhoneNumbers?.length > 0 ? (
                                filteredPhoneNumbers.map((phone, index) => (
                                    <tr 
                                        key={phone.phone_number} 
                                        className={`hover:bg-gray-50 transition-colors duration-150 ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                        }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {phone.phone_number}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">
                                                {phone.username || (
                                                    <span className="text-gray-400 italic">Not assigned</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                {phone.email ? (
                                                    <a 
                                                        href={`mailto:${phone.email}`}
                                                        className="text-primary-600 hover:text-primary-700 transition-colors"
                                                    >
                                                        {phone.email}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 italic">No email</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">
                                                {phone.company_name || (
                                                    <span className="text-gray-400 italic">No company</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleReturnNumber(phone)}
                                                disabled={!phone.phone_sid}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                                    phone.phone_sid
                                                        ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer'
                                                        : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                                }`}
                                                title={!phone.phone_sid ? "Cannot return this number" : "Return number"}
                                            >
                                                <FaUndo className="text-xs" />
                                                Return
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-gray-100 p-3 rounded-full mb-4">
                                                <FaSearch className="text-gray-400 text-xl" />
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
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/30 flex items-center justify-between flex-wrap gap-3">
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                            <h3 className="text-lg font-semibold text-gray-800">Return Phone Number</h3>
                            <button
                                onClick={closeReturnModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={returning}
                            >
                                <FaTimes className="text-lg" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to return this phone number? This action cannot be undone.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-sm font-medium text-gray-800 mb-1">
                                    {selectedNumber.phone_number}
                                </p>
                                {selectedNumber.company_name && (
                                    <p className="text-sm text-gray-600">
                                        Company: <span className="font-medium text-gray-700">{selectedNumber.company_name}</span>
                                    </p>
                                )}
                                {selectedNumber.username && (
                                    <p className="text-sm text-gray-600">
                                        User: <span className="font-medium text-gray-700">{selectedNumber.username}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {returnError && (
                            <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{returnError}</p>
                            </div>
                        )}

                        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                            <button
                                onClick={closeReturnModal}
                                disabled={returning}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReturnNumber}
                                disabled={returning}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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