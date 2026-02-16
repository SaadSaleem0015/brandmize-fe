import React, { useState, useEffect, ChangeEvent } from "react";
import { FiPlus } from "react-icons/fi";
import { MdSearch, MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { api } from "../../Helpers/BackendRequest";
import { notifyResponse } from "../../Helpers/notyf";
import { Input } from "../Input";
import { Loading } from "../Loading";
import { PageNumbers } from "../PageNumbers";
import TwilioModal from "../TwilioModal";
import { SearchNumbersModal } from "./SearchNumbersModal";
import ConfirmationModal from "../ConfirmationModal";
import { IoSearchOutline, IoPhonePortraitOutline } from "react-icons/io5";

interface NumberCapabilities {
  voice: boolean;
  SMS: boolean;
}

interface PhoneNumber {
  friendly_name: string;
  phone_number: string;
  region: string;
  postal_code: string;
  iso_country: string;
  capabilities: NumberCapabilities;
}

const AvailableNumbers: React.FC = () => {
  const [showModal, setShowModal] = useState("");
  const [availableNumbers, setAvailableNumbers] = useState<PhoneNumber[]>([]);
  const [search] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);

  const itemsPerPage = 10;
  const filteredNumbers = availableNumbers?.filter(
    (num) =>
      num.phone_number.includes(search) || num.friendly_name.includes(search)
  );
  const pagesCount = Math.ceil(filteredNumbers.length / itemsPerPage);
  const pageNumbers = Array.from({ length: pagesCount }, (_, i) => i + 1);
  const currentNumbers: PhoneNumber[] = filteredNumbers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenModal = (type: string) => {
    setShowModal(type);
  };

  const handleCloseModal = () => {
    setShowModal("");
    setSelectedNumber(null);
  };

  const handleNumberBuyModal = (phoneNumber: string) => {
    setSelectedNumber(phoneNumber);
    setShowModal("BuyNumber");
  };

  const handleCheckboxChange = (phoneNumber: PhoneNumber, checked: boolean) => {
    setSelectedNumbers((prev: string[]) => {
      if (checked) {
        return [...prev, phoneNumber.phone_number];
      } else {
        return prev.filter((num: string) => num !== phoneNumber.phone_number);
      }
    });
  };

  const handleSelectAllNumbers = () => {
    if (selectedNumbers.length === availableNumbers.length) {
      setSelectedNumbers([]);
    } else {
      setSelectedNumbers(availableNumbers.map(num => num.phone_number));
    }
  };

  async function handleSubmit(values: Record<string, string | string[]>) {
    setLoading(true);
    try {
      const areaCodes = values.area_code;
      const { data } = await api.post<{ available_numbers?: PhoneNumber[]; success?: boolean; detail?: string }>(
        "/available_phone_numbers",
        { area_codes: areaCodes, country: values.country }
      );
      notifyResponse(data ?? {});
      if (Array.isArray(data?.available_numbers)) {
        setAvailableNumbers(data.available_numbers);
      } else {
        setAvailableNumbers([]);
      }
    } catch (error) {
      console.error("Error fetching available numbers:", error);
      notifyResponse({ success: false, detail: (error as any)?.response?.data?.detail ?? "Failed to fetch numbers" });
    } finally {
      setLoading(false);
    }
  }

  async function handleBuyNumber() {
    if (!selectedNumber) return;
    setLoading(true);
    try {
      const { data } = await api.post<{ success?: boolean; detail?: string }>("/purchase_phone_number", {
        phone_number: [selectedNumber],
      });
      notifyResponse(data ?? {});
      if (data?.success) {
        setAvailableNumbers((prevNumbers) =>
          prevNumbers.filter((number) => number.phone_number !== selectedNumber)
        );
      }
    } catch (error) {
      console.error("Error purchasing phone number:", error);
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  }

  async function handleBuyNumbers() {
    if (selectedNumbers.length === 0) return;
    setLoading(true);
    try {
      const { data } = await api.post<{ success?: boolean; detail?: string }>("/purchase_phone_number", {
        phone_number: selectedNumbers,
      });
      notifyResponse(data ?? {});
      if (data?.success) {
        setAvailableNumbers((prevNumbers) =>
          prevNumbers.filter(
            (number) => !selectedNumbers.includes(number.phone_number)
          )
        );
        setSelectedNumbers([]);
      }
    } catch (error) {
      console.error("Error purchasing phone numbers:", error);
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  }


  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loading />
    </div>
  );

  return (
    <>
      {/* Search and Actions Bar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
     
        
        </div>

        {/* Bulk Purchase Banner */}
        {selectedNumbers.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <MdCheckBox className="w-5 h-5 text-primary" />
                <span className="font-medium text-gray-800">
                  {selectedNumbers.length} number{selectedNumbers.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedNumbers([])}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleOpenModal("ConfirmBuyNumbers")}
                  className="px-4 py-2 bg-primary-400 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Purchase Selected ({selectedNumbers.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Numbers Table */}
      <div className="p-4 md:p-6">
        {currentNumbers.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <div className="flex items-center">
                        <button
                          onClick={handleSelectAllNumbers}
                          className="text-gray-400 hover:text-primary-dark transition-colors"
                        >
                          {selectedNumbers.length === availableNumbers.length && availableNumbers.length > 0 ? (
                            <MdCheckBox className="w-5 h-5" />
                          ) : (
                            <MdCheckBoxOutlineBlank className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capabilities
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentNumbers.map((num) => (
                    <tr key={num.phone_number} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleCheckboxChange(num, e.target.checked)
                          }
                          checked={selectedNumbers.includes(num.phone_number)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {num.friendly_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {num.phone_number}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{num.region || "N/A"}</div>
                        <div className="text-xs text-gray-500">{num.iso_country}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {num.capabilities?.voice && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Voice
                            </span>
                          )}
                          {num.capabilities?.SMS && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              SMS
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleNumberBuyModal(num.phone_number)}
                          disabled={selectedNumbers.includes(num.phone_number)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                            selectedNumbers.includes(num.phone_number)
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-primary-400 hover:bg-primary-600 text-white"
                          }`}
                        >
                          Buy Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagesCount > 1 && (
              <div className="mt-6">
                <PageNumbers
                  pageNumbers={pageNumbers}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  pagesCount={pagesCount}
                />
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoPhonePortraitOutline className="w-8 h-8 text-gray-400" />
              </div>
         
              <p className="text-gray-600 mb-6">
                {search ? "Try a different search term" : "Start by searching for available numbers"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => handleOpenModal('Numbers')}
                  className="px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 bg-primary-400 hover:bg-primary-600 text-white"
                >
                  Search by Area Code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Need help choosing?
          </h3>
          <ul className="text-gray-600 text-sm space-y-1">
            <li>• Local numbers help build trust with local customers</li>
            <li>• Toll-free numbers work nationwide at no extra cost to callers</li>
            <li>• You can purchase multiple numbers for different departments</li>
            <li>• Numbers are activated instantly after purchase</li>
          </ul>
        </div>
      {/* Modals */}
      {showModal === "Numbers" && (
        <SearchNumbersModal
          show={true}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          buttonText="Search Numbers"
        />
      )}

      {showModal === "BuyNumber" && selectedNumber && (
        <TwilioModal
          showModal={"BuyNumber"}
          title="Confirm Purchase"
          fields={[]}
          onSubmit={handleBuyNumber}
          handleCloseModal={handleCloseModal}
          buttonText={`Purchase ${selectedNumber}`}
          showCountrySelection={false}
        />
      )}

      {showModal === "ConfirmBuyNumbers" && selectedNumbers.length > 0 && (
        <TwilioModal
          showModal={"ConfirmBuyNumbers"}
          title="Confirm Bulk Purchase"
          fields={[]}
          onSubmit={handleBuyNumbers}
          handleCloseModal={handleCloseModal}
          buttonText={`Purchase ${selectedNumbers.length} Numbers`}
          showCountrySelection={false}
        />
      )}
    </>
  );
};

export default AvailableNumbers;