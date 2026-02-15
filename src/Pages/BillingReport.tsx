import React, { useState, useEffect } from "react";
import { api } from "../Helpers/backendRequest";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PageNumbers } from "../Components/PageNumbers";
import { FormateTime } from "../Helpers/formateTime";
import { 
  FiCalendar, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiFilter, 
  FiRefreshCw,
  FiDownload,
  FiArrowUp,
  FiArrowDown,
  
} from "react-icons/fi";
import { 
  TbCalendarStats, 
  TbArrowUpRight, 
  TbArrowDownRight,
  TbWallet,
  TbReceipt,
  TbChartBar,
  TbChevronDown,
  TbChevronUp,
  TbAlertCircle,
} from "react-icons/tb";

interface Payment {
  amount_paid: number;
  created_at: string;
  description: string;
}

interface BillingReportData {
  date: string;
  description: string;
  credit: number;
  debit: number;
  balance: number;
}

interface SpentMoney {
  id: string;
  created_at: string;
  description: string;
  spent_money: number;
}

const ITEMS_PER_PAGE = 10;

const BillingReport: React.FC = () => {
  const [billingData, setBillingData] = useState<BillingReportData[]>([]);
  const [credit, setCredit] = useState<number>(0);
  const [debit, setDebit] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFilters, setShowFilters] = useState<boolean>(true);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    setStartDate(dates[0]);
    setEndDate(dates[1]);
  };

  const applyQuickFilter = (filterType: string) => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (filterType) {
      case "today": {
        const today = new Date();
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case "thisWeek": {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case "thisMonth": {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = firstDay;
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case "lastMonth": {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        startDate = firstDay;
        startDate.setHours(0, 0, 0, 0);
        endDate = lastDay;
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case "allTime": {
        startDate = null;
        endDate = null;
        break;
      }
      default: {
        startDate = null;
        endDate = null;
        break;
      }
    }

    setStartDate(startDate);
    setEndDate(endDate);
    setCurrentPage(1);
  };

  const formatDateRange = () => {
    if (!startDate || !endDate) return "All Time";
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const {data: paymentsResponse} = await api.get<Payment[]>(
        "/payments"
      );
      const {data: spentMoneyResponse} = await api.get(`/spent-money`);

      const payments: Payment[] = paymentsResponse?.payments || [];
      const spent_money: SpentMoney[] = spentMoneyResponse || [];

      if (!Array.isArray(payments) || !Array.isArray(spent_money)) {
        throw new Error("Unexpected response format");
      }

      const filteredPayments =
        startDate && endDate
          ? payments.filter((payment) => {
              const paymentDate = new Date(payment.created_at);
              return paymentDate >= startDate && paymentDate <= endDate;
            })
          : payments;

      const filteredSpentPayment =
        startDate && endDate
          ? spent_money.filter((spent) => {
              const spentDate = new Date(spent.created_at);
              return spentDate >= startDate && spentDate <= endDate;
            })
          : spent_money;

      let runningBalance = 0;

      const billingEntries: BillingReportData[] = [
        ...filteredPayments.map((payment) => ({
          date: new Date(payment.created_at).toISOString(),
          description: payment.description || "Payment Received",
          credit: payment.amount_paid,
          debit: 0,
          balance: 0,
        })),
        ...filteredSpentPayment.map((spent) => ({
          date: new Date(spent.created_at).toISOString(),
          description: spent.description,
          credit: 0,
          debit: spent.spent_money,
          balance: 0,
        })),
      ];

      billingEntries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      for (let i = billingEntries.length - 1; i >= 0; i--) {
        runningBalance += billingEntries[i].credit - billingEntries[i].debit;
        billingEntries[i].balance = runningBalance;
      }

      const formattedEntries = billingEntries.map((entry) => ({
        ...entry,
        date: new Date(entry.date).toISOString(),
      }));

      setBillingData(formattedEntries);

      const totalCredit = filteredPayments.reduce(
        (sum, payment) => sum + payment.amount_paid,
        0
      );
      const totalDebit = filteredSpentPayment.reduce(
        (sum, log) => sum + log.spent_money,
        0
      );

      setCredit(totalCredit);
      setDebit(totalDebit);
      setBalance(runningBalance);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to fetch billing data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = billingData.slice(indexOfFirstItem, indexOfLastItem);
  const pagesCount = Math.ceil(billingData.length / ITEMS_PER_PAGE);
  const pageNumbers = Array.from({ length: pagesCount }, (_, i) => i + 1);

  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Date', 'Description', 'Credit', 'Debit', 'Balance'];
    const csvContent = [
      headers.join(','),
      ...billingData.map(entry => [
        new Date(entry.date).toLocaleDateString(),
        `"${entry.description}"`,
        entry.credit.toFixed(2),
        entry.debit.toFixed(2),
        entry.balance.toFixed(2)
      ].join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
              <TbReceipt className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Billing Report</h1>
              <p className="text-gray-500 mt-1">Track your payments, expenses, and account balance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TbCalendarStats className="w-4 h-4 text-primary-400" />
                <span>{formatDateRange()}</span>
              </div>
            </div>
            <button
              onClick={exportToCSV}
              className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              title="Export to CSV"
            >
              <FiDownload className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats Cards - Modern Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Total Credit Card */}
          <div className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Credit</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">${credit.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-800 to-green-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <FiArrowUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                <TbArrowUpRight className="w-3 h-3" />
                +{((credit / (credit + debit)) * 100 || 0).toFixed(1)}%
              </span>
              <span className="text-gray-400">of total flow</span>
            </div>
          </div>

          {/* Total Debit Card */}
          <div className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Debit</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">${debit.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-800 to-red-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <FiArrowDown className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-600 bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1">
                <TbArrowDownRight className="w-3 h-3" />
                +{((debit / (credit + debit)) * 100 || 0).toFixed(1)}%
              </span>
              <span className="text-gray-400">of total flow</span>
            </div>
          </div>

          {/* Current Balance Card */}
          <div className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Balance</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">${balance.toFixed(2)}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${
                balance >= 0 
                  ? 'bg-gradient-to-br from-primary-400 to-primary-500' 
                  : 'bg-gradient-to-br from-red-400 to-red-500'
              }`}>
                <TbWallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {balance < 10 && balance > 0 && (
                <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg flex items-center gap-1">
                  <TbAlertCircle className="w-3 h-3" />
                  Low Balance
                </span>
              )}
              {balance < 0 && (
                <span className="text-red-600 bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1">
                  <TbAlertCircle className="w-3 h-3" />
                  Negative Balance
                </span>
              )}
              {balance >= 10 && (
                <span className="text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                  <TbAlertCircle className="w-3 h-3" />
                  Healthy Balance
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filters Section - Collapsible */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                <FiFilter className="w-4 h-4 text-primary-500" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">Filters & Date Range</h2>
                <p className="text-sm text-gray-500">Filter transactions by date period</p>
              </div>
            </div>
            {showFilters ? (
              <TbChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <TbChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showFilters && (
            <div className="px-6 pb-6">
              {/* Quick Filters */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Quick Filters
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "allTime", label: "All Time" },
                    { key: "today", label: "Today" },
                    { key: "thisWeek", label: "This Week" },
                    { key: "thisMonth", label: "This Month" },
                    { key: "lastMonth", label: "Last Month" },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => applyQuickFilter(filter.key)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-primary-100 hover:text-primary-600 hover:border-primary-200 transition-all border border-transparent"
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Custom Date Range
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <DatePicker
                      selected={startDate}
                      onChange={handleDateChange}
                      startDate={startDate}
                      endDate={endDate}
                      selectsRange
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholderText="Select start and end date"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStartDate(null);
                      setEndDate(null);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <TbChartBar className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
                  <p className="text-sm text-gray-500">Detailed breakdown of all transactions</p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="relative inline-block">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-500">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-2">Failed to load data</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credit
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Debit
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.length > 0 ? (
                      currentItems.map((entry, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-600">
                              <FiCalendar className="w-3.5 h-3.5 text-gray-400 mr-2" />
                              {FormateTime(entry.date)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {entry.credit > 0 ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                <FiArrowUp className="w-3 h-3" />
                                +${entry.credit.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {entry.debit > 0 ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                <FiArrowDown className="w-3 h-3" />
                                -${entry.debit.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                              entry.balance >= 0 
                                ? 'text-green-700 bg-green-50 border border-green-200' 
                                : 'text-red-700 bg-red-50 border border-red-200'
                            }`}>
                              ${entry.balance.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-16">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <TbReceipt className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              No transactions found
                            </h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                              {startDate || endDate 
                                ? "No transactions in the selected date range. Try adjusting your filters."
                                : "Your billing transactions will appear here once you start making payments."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination & Summary */}
              {pagesCount > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, billingData.length)}</span> of{' '}
                      <span className="font-medium text-gray-900">{billingData.length}</span> transactions
                    </div>
                    
                    {pagesCount > 1 && (
                      <PageNumbers
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        pageNumbers={pageNumbers}
                        pagesCount={pagesCount}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Credit Summary</p>
                <p className="text-2xl font-bold text-green-800">${credit.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">Total payments received</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <FiTrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-700 font-medium">Debit Summary</p>
                <p className="text-2xl font-bold text-red-800">${debit.toFixed(2)}</p>
                <p className="text-xs text-red-600 mt-1">Total expenses incurred</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingReport;