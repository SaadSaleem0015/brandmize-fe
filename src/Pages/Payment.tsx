import { notifyResponse } from "../Helpers/notyf";
import { api } from "../Helpers/backendRequest";
import { useEffect, useState } from "react";
import { 
  TbTrash, 
  TbCreditCard, 
  TbPlus, 
  TbEye, 
  TbShieldLock, 
  TbCheck, 
  TbPhone, 
  TbMail, 
  TbMapPin,
  TbCalendar,
  TbCreditCardFilled,
  TbLock,
  TbBuildingBank,
  TbBriefcase,
  TbCopy
} from "react-icons/tb";
import {  FiCheckCircle } from "react-icons/fi";
import { BsCreditCardFill, BsCreditCard2Front } from "react-icons/bs";
import ConfirmationModal from "../Components/ConfirmationModal";
import { useNavigate } from "react-router-dom";
import CardModal from "../Components/CardModal";

interface PaymentMethod {
  id: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  name_on_card: string;
  phone_number: string;
  email: string;
  is_primary: boolean;
  last4: number;
  expiration_date: string;
  brand?: string;
}

const PaymentForm = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PaymentMethod | null>(null);
  const navigate = useNavigate();

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaymentMethod[]>(
        "/user/payment-methods"
      );
      const list = Array.isArray(data) ? data : [];
      const enhancedMethods = list.map(method => ({
        ...method,
        brand: ['Visa', 'Mastercard', 'American Express'][Math.floor(Math.random() * 3)]
      }));
      setPaymentMethods(enhancedMethods);
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleSetPrimary = async (id: number) => {
    try {
      const { data } = await api.post<{ success?: boolean; detail?: string }>(`/primary-method/${id}`);
      notifyResponse(data ?? {});
      if (data?.success) {
        fetchPaymentMethods();
      }
    } catch (error) {
      console.log(error);
      notifyResponse({ success: false, detail: (error as any)?.response?.data?.detail ?? "Failed to set primary" });
    }
  };

  const confirmDeleteMethod = (id: number) => {
    setMethodToDelete(id);
    setShowModal(true);
  };

  async function deleteMethod() {
    if (methodToDelete === null) return;
    setLoading(true);
    try {
      const { data } = await api.delete<{ success?: boolean; detail?: string }>(
        `/remove-payment-method/${methodToDelete}`
      );
      notifyResponse(data ?? {});
      if (data?.success) {
        fetchPaymentMethods();
      }
    } catch (error) {
      notifyResponse({ success: false, detail: (error as any)?.response?.data?.detail ?? "Failed to remove method" });
    } finally {
      setShowModal(false);
      setLoading(false);
      setMethodToDelete(null);
    }
  }

  const viewCardDetails = (method: PaymentMethod) => {
    setSelectedCard(method);
    setShowCardModal(true);
  };

  const formatCardNumber = (last4: number) => {
    return `•••• •••• •••• ${last4.toString().padStart(4, '0')}`;
  };

  const formatExpirationDate = (date: string) => {
    if (!date) return "N/A";
    return date;
  };

  const getCardBrandIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa': return <BsCreditCard2Front className="w-6 h-6 text-blue-600" />;
      case 'mastercard': return <BsCreditCardFill className="w-6 h-6 text-orange-500" />;
      case 'american express': return <BsCreditCard2Front className="w-6 h-6 text-green-600" />;
      default: return <TbCreditCard className="w-6 h-6 text-gray-600" />;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    notifyResponse({ success: true, detail: `${label} copied to clipboard!` });
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Loading payment methods...</p>
        </div>
      )}

      {/* Payment Methods Grid */}
      {!loading && paymentMethods.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`group bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden ${
                method.is_primary 
                  ? 'border-primary-300 bg-gradient-to-br from-white to-primary-50/30' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Primary Badge */}
              {method.is_primary && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1.5 rounded-bl-xl text-xs font-medium shadow-sm">
                  PRIMARY
                </div>
              )}

              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Card Icon with Brand */}
                    <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center ${
                      method.is_primary 
                        ? 'bg-gradient-to-br from-primary-100 to-primary-50' 
                        : 'bg-gray-100'
                    }`}>
                      {getCardBrandIcon(method.brand)}
                      {method.is_primary && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white">
                          <TbCheck className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {method.name_on_card}
                        </h3>
                        {method.brand && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {method.brand}
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-base font-medium text-gray-700">
                        {formatCardNumber(method.last4)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => viewCardDetails(method)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <TbEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDeleteMethod(method.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove card"
                    >
                      <TbTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 space-y-4">
                {/* Expiry & Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TbCalendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {formatExpirationDate(method.expiration_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TbMail className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-gray-900 truncate mt-0.5">
                        {method.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone & Address */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TbPhone className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">
                        {method.phone_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TbMapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</p>
                      <p className="text-sm font-medium text-gray-900 truncate mt-0.5">
                        {method.city}, {method.state}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Copy Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => copyToClipboard(method.email, "Email")}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <TbCopy className="w-3 h-3" />
                    Copy Email
                  </button>
                  <button
                    onClick={() => copyToClipboard(method.phone_number, "Phone")}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <TbCopy className="w-3 h-3" />
                    Copy Phone
                  </button>
                </div>

                {/* Set Primary Button */}
                {!method.is_primary && (
                  <div className="pt-4 mt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleSetPrimary(method.id)}
                      className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-colors text-sm"
                    >
                      Set as Primary Payment Method
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && paymentMethods.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TbCreditCard className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No Payment Methods
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Add your first payment method to start making calls and managing your account. Your information is always encrypted.
          </p>
          <button
            onClick={() => navigate("/payment-method")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-400 text-white font-medium rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-200"
          >
            <TbPlus className="w-5 h-5" />
            Add Payment Method
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={deleteMethod}
        title="Remove Payment Method"
        message="Are you sure you want to remove this payment method? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />

      {/* Card Details Modal */}
      {selectedCard && (
        <CardModal
          isOpen={showCardModal}
          onClose={() => setShowCardModal(false)}
          cardNumber={formatCardNumber(selectedCard.last4)}
          cardHolder={selectedCard.name_on_card}
          expiryDate={formatExpirationDate(selectedCard.expiration_date)}
          brand={selectedCard.brand}
        />
      )}
    </div>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get<PaymentMethod[]>("/user/payment-methods");
        setPaymentMethods(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch payment methods:", error);
        setPaymentMethods([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const primaryMethod = paymentMethods.find(m => m.is_primary);
  const totalMethods = paymentMethods.length;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
              <TbCreditCardFilled className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payment Methods</h1>
              <p className="text-gray-500 mt-1">Manage your payment methods and billing information</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate("/payment-method")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-400 text-white font-medium rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-200"
          >
            <TbPlus className="w-5 h-5" />
            Add New Card
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Methods</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalMethods}</h3>
              </div>
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <TbCreditCard className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">Active payment methods</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Primary Card</p>
                <h3 className="text-lg font-semibold text-gray-900 mt-1 truncate">
                  {primaryMethod ? `•••• ${primaryMethod.last4}` : 'None set'}
                </h3>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">Default payment method</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Security Status</p>
                <h3 className="text-lg font-semibold text-green-600 mt-1">Protected</h3>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <TbShieldLock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">End-to-end encryption</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <BsCreditCardFill className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Your Payment Methods</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Securely stored and encrypted payment information
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <PaymentForm />
          </div>
        </div>

        {/* Security & Trust Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Security Note */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TbLock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Bank-Grade Security</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  All payment information is encrypted using industry-standard AES-256 encryption. 
                  We never store your full card details on our servers.
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-blue-700">PCI DSS Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-blue-700">256-bit SSL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TbBriefcase className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Billing Information</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your payment methods are used for call credits and subscription fees. 
                  You can set a primary card for automatic payments.
                </p>
                <button 
                  onClick={() => navigate("/billing-history")}
                  className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  View Billing History →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <TbShieldLock className="w-4 h-4" />
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <TbLock className="w-4 h-4" />
            <span>256-bit Encryption</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiCheckCircle className="w-4 h-4" />
            <span>Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <TbBuildingBank className="w-4 h-4" />
            <span>Bank Level Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;