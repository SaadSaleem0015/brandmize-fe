import React, { useState, useEffect } from 'react';
import { api } from '../../Helpers/BackendRequest';
import { Loading } from '../Loading';
import { PageNumbers } from '../PageNumbers';
import { notifyResponse } from '../../Helpers/notyf';
import { formatDate } from '../../Helpers/date.helper';
import { FaSearch, FaPhone, FaUser, FaCalendar, FaTrash } from 'react-icons/fa';

interface User {
  username: string;
  email: string;
}

interface PurchasedNumber {
  friendly_name: string;
  phone_number: string;
  user: User;
  date_purchased: string;
  attached_assistant: number;
  number_type?: 'purchased' | 'vv_admin';
}

interface Assistant {
  id: string;
  name: string;
  attached_Number: string | null;
}

const PurchasedNumbers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [numbers, setNumbers] = useState<PurchasedNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNumber, setSelectedNumber] = useState<PurchasedNumber | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const itemsPerPage = 9;

  useEffect(() => {
    fetchNumbers();
  }, []);

  const fetchNumbers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PurchasedNumber[]>('/purchased_numbers');
      const purchased = Array.isArray(data)
        ? data.map(num => ({ ...num, number_type: 'purchased' as const }))
        : [];



      setNumbers([...purchased]);
    } catch (error) {
      console.error('Error fetching numbers:', error);
    } finally {
      setLoading(false);
    }
  };



  const filteredNumbers = numbers.filter(
    num =>
      num.phone_number.includes(search) ||
      num.friendly_name?.toLowerCase().includes(search.toLowerCase()) ||
      num.user?.username.toLowerCase().includes(search.toLowerCase())
  );

  const pagesCount = Math.ceil(filteredNumbers.length / itemsPerPage);
  const currentNumbers = filteredNumbers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const handleDeleteClick = (number: PurchasedNumber) => {
    if (number.number_type === 'vv_admin') return;
    setSelectedNumber(number);
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedNumber) return;
    
    setLoading(true);
    try {
      const { data } = await api.post<{ success?: boolean; detail?: string }>('/remove-phone-number', {
        phone_number: selectedNumber.phone_number
      });
      notifyResponse(data ?? {});

      if (data?.success) {
        setShowDeleteModal(false);
        await fetchNumbers();
      }
    } catch (error) {
      console.error('Error deleting number:', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Numbers</h2>
            <p className="text-gray-600 text-sm">Manage your purchased phone numbers</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search numbers..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Numbers</div>
            <div className="text-2xl font-semibold text-gray-900">{numbers.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Attached</div>
            <div className="text-2xl font-semibold text-primary">
              {numbers.filter(n => n.attached_assistant).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Available</div>
            <div className="text-2xl font-semibold text-gray-900">
              {numbers.filter(n => !n.attached_assistant).length}
            </div>
          </div>
        </div>
      </div>

      {/* Numbers Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading />
        </div>
      ) : currentNumbers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentNumbers.map((num) => (
              <div
                key={num.phone_number}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-4">
                  {/* Number Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        num.number_type === 'vv_admin' ? 'bg-primary' : 'bg-gray-400'
                      }`} />
                      <span className={`text-xs px-2 py-1 rounded ${
                        num.number_type === 'vv_admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {num.number_type === 'vv_admin' ? 'Shared' : 'Owned'}
                      </span>
                    </div>
                    {num.number_type === 'purchased' && (
                      <button
                        onClick={() => handleDeleteClick(num)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Number Details */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center text-gray-600 text-sm mb-1">
                        <FaPhone className="w-3.5 h-3.5 mr-2" />
                        Phone Number
                      </div>
                      <div className="font-mono font-semibold text-lg text-gray-900">
                        {num.phone_number}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center text-gray-600 text-sm mb-1">
                        <FaUser className="w-3.5 h-3.5 mr-2" />
                        Owner
                      </div>
                      <div className="font-medium text-gray-800">
                        {num.user?.username || 'VV Admin'}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center text-gray-600 text-sm mb-1">
                        <FaCalendar className="w-3.5 h-3.5 mr-2" />
                        Added
                      </div>
                      <div className="text-gray-700">
                        {formatDate(num.date_purchased)}
                      </div>
                    </div>

                    {/* Status */}
                    {/* <div className="pt-3 border-t">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${
                        num.attached_assistant
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <FaLink className={`w-3 h-3 mr-1.5 ${
                          num.attached_assistant ? 'text-green-600' : 'text-gray-500'
                        }`} />
                        {num.attached_assistant
                          ? `Attached to ${getAssistantName(num.attached_assistant)}`
                          : 'Not attached'}
                      </div>
                    </div> */}
                  </div>

                  {/* Actions */}
                  {/* {num.number_type === 'purchased' && (
                    <div className="mt-4 flex gap-2">
                      {num.attached_assistant ? (
                        <button
                          onClick={() => handleDetachClick(num)}
                          className="flex-1 py-2 px-3 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          <FaUnlink className="inline w-3.5 h-3.5 mr-1.5" />
                          Detach
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAttachClick(num)}
                          className="flex-1 py-2 px-3 bg-primary-400 text-white hover:bg-primary-600 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          <FaLink className="inline w-3.5 h-3.5 mr-1.5" />
                          Attach
                        </button>
                      )}
                    </div>
                  )} */}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagesCount > 1 && (
            <div className="mt-6">
              <PageNumbers
                pageNumbers={Array.from({ length: pagesCount }, (_, i) => i + 1)}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pagesCount={pagesCount}
              />
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaPhone className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No numbers found</h3>
          <p className="text-gray-500">Try a different search term</p>
        </div>
      )}

      {/* Attach Modal */}
 

      {/* Detach Modal */}


      {/* Delete Modal */}
      {showDeleteModal && selectedNumber && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Return Number?</h3>
            <p className="text-gray-600 mb-6">
              Return {selectedNumber.phone_number}? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                {loading ? 'Returning...' : 'Return Number'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasedNumbers;