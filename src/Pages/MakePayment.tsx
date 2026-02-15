import React, { useState, useEffect } from "react";
import { api } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { useNavigate } from "react-router-dom";
import { FaCreditCard, FaInfoCircle, FaCheck, FaArrowRight } from "react-icons/fa";

interface PaymentMethod {
  id: number;
  last4: string;
  expiration_date: string;
  is_primary: boolean;
}

const CustomDropdown = ({
  options,
  selectedOption,
  onSelect,
}: {
  options: PaymentMethod[];
  selectedOption: PaymentMethod | null;
  onSelect: (option: PaymentMethod) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: PaymentMethod) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left flex items-center justify-between hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <FaCreditCard className="text-gray-600" />
          </div>
          <div>
            {selectedOption ? (
              <>
                <p className="font-medium text-gray-800">
                  Card ending in {selectedOption.last4}
                </p>
                <p className="text-sm text-gray-500">
                  Expires {selectedOption.expiration_date}
                  {selectedOption.is_primary && (
                    <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                      Primary
                    </span>
                  )}
                </p>
              </>
            ) : (
              <p className="text-gray-500">Select a payment method</p>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 overflow-hidden">
          {options && options.length > 0 ? (
            <div className="py-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    selectedOption?.id === option.id ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedOption?.id === option.id ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"}`}>
                      <FaCreditCard />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Card ending in {option.last4}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expires {option.expiration_date}
                      </p>
                    </div>
                  </div>
                  {selectedOption?.id === option.id && (
                    <FaCheck className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <FaCreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No payment methods available</p>
              <p className="text-sm text-gray-400 mt-1">
                Add a payment method to continue
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MakePayment = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [autoReplenishment, setAutoReplenishment] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [togglingReplenishment, setTogglingReplenishment] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaymentMethod[]>(
        "/user/payment-methods"
      );
      const list = Array.isArray(data) ? data : [];
      if (list.length > 0) {
        setPaymentMethods(list);
        const primaryMethod = list.find((method) => method.is_primary);
        setSelectedPaymentMethod(primaryMethod || list[0]);
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      notifyResponse({
        success: false,
        detail: "Failed to load payment methods",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReplenishmentStatus = async () => {
    try {
      const { data } = await api.get<{ success: boolean; replenishment: boolean; detail: string }>(
        "/replenishment-status"
      );
      if (data?.success) {
        setAutoReplenishment(data.replenishment ?? false);
      }
    } catch (error) {
      console.error("Failed to fetch replenishment status:", error);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
    fetchReplenishmentStatus();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setPaymentAmount(value);
    }
  };

  const handleSubmitPayment = async () => {
    const amount = parseFloat(paymentAmount);
    
    if (!amount || amount <= 0) {
      notifyResponse({
        success: false,
        detail: "Please enter a valid amount greater than 0.",
      });
      return;
    }

    if (!selectedPaymentMethod) {
      notifyResponse({
        success: false,
        detail: "Please select a payment method.",
      });
      return;
    }

    const newPayment = {
      amount,
      paymentMethodId: selectedPaymentMethod.id,
    };

    try {
      setLoading(true);
      const { data } = await api.post<{ success?: boolean; detail?: string }>(
        "/make-payment",
        newPayment
      );
      if (data?.success) {
        localStorage.removeItem("trialMessage");
        notifyResponse({
          success: true,
          detail: `Payment of $${amount} was successful!`,
        });
        navigate("/bl-report");
      } else {
        notifyResponse(data ?? { success: false, detail: "Payment failed." });
      }
    } catch (error) {
      console.error("Failed to make payment:", error);
      notifyResponse({
        success: false,
        detail: "Payment failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoReplenishment = async () => {
    const newValue = !autoReplenishment;
    
    try {
      setTogglingReplenishment(true);
      const { data } = await api.post<{ success?: boolean; detail?: string }>(
        "/toggle-replenishment",
        { enabled: newValue }
      );
      if (data?.success) {
        setAutoReplenishment(newValue);
        notifyResponse({
          success: true,
          detail: newValue 
            ? "Auto replenishment has been enabled" 
            : "Auto replenishment has been disabled",
        });
      } else {
        notifyResponse({
          success: false,
          detail: data?.detail ?? "Failed to update auto replenishment",
        });
      }
    } catch (error) {
      console.error("Failed to toggle auto replenishment:", error);
      notifyResponse({
        success: false,
        detail: "Failed to update auto replenishment. Please try again.",
      });
    } finally {
      setTogglingReplenishment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/payment")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Payment
        </button>
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Make a Payment
          </h1>
          <p className="text-gray-600 text-sm  mt-2">
            Add funds to your account to continue using our services
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FaCreditCard className="text-primary text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Payment Details
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Select your payment method and enter the amount
                </p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 md:p-6">
            <div className="space-y-8">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <CustomDropdown
                  options={paymentMethods}
                  selectedOption={selectedPaymentMethod}
                  onSelect={(option) => setSelectedPaymentMethod(option)}
                />
                {paymentMethods.length === 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                      <FaInfoCircle className="text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800">
                          No payment methods found
                        </p>
                        <button
                          onClick={() => navigate("/payment")}
                          className="text-sm text-primary hover:text-primary-dark font-medium mt-1"
                        >
                          Add a payment method →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Amount
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      id="paymentAmount"
                      type="text"
                      value={paymentAmount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleSubmitPayment}
                    disabled={loading || !paymentAmount || !selectedPaymentMethod}
                    className="px-8 py-3 bg-primary-400 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Make Payment
                        <FaArrowRight />
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Minimum payment amount: $1.00
                </p>
              </div>

              {/* Auto Replenishment */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      id="autoReplenishment"
                      checked={autoReplenishment}
                      onChange={toggleAutoReplenishment}
                      disabled={togglingReplenishment}
                      className="h-5 w-5 border-gray-300 rounded text-primary focus:ring-primary focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="autoReplenishment" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Enable Auto Replenishment
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Automatically add $100 when your balance falls below $20
                    </p>
                    
                    {autoReplenishment && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-start gap-3">
                          <FaInfoCircle className="text-green-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-green-800 font-medium">
                              Auto Replenishment Enabled
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                              Your account will automatically be replenished when the balance goes below $200
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-2">Secure Payments</h3>
            <p className="text-sm text-gray-600">
              Your payment information is encrypted and secure.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-2">No Fees</h3>
            <p className="text-sm text-gray-600">
              We don't charge any additional fees for payments.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-2">Instant Processing</h3>
            <p className="text-sm text-gray-600">
              Payments are processed instantly and added to your balance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakePayment;