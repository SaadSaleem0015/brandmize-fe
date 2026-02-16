import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { notifyResponse } from "../Helpers/notyf";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "../Helpers/BackendRequest";
import { useNavigate } from "react-router-dom";
import { FaCreditCard, FaUser, FaPhone, FaEnvelope, FaLock } from "react-icons/fa";

// test key
// const stripePromise = loadStripe("pk_test_51L9ED5Hx4scm5E4HAgCLw1qlqZcaE1Az39EE2XI7f4YpIPmNjW9wcRspEmjBYrZ5tWETrwuQuzRR5l1uHKDfSpPb0049HMH9GG");

// live key
// const stripePromise = loadStripe("pk_live_51QH8drGHzljfWhIHqETtDPTJYXS1uuc9BQRpIGzRHwO50oLl2niqyfmInXFX9fV2Xl5YaSBcVNiIl8bontV48H6900sCaeSsDr");
const stripePromise = loadStripe("pk_test_51S1RuCIynxmoy2Ro0CtGFaOti2dT3p24RDKV3DGugY1f8gMD1MxzWqkmWQJNkqBiS9FgTiG5GFxM6uM3mxTUekMu00UnqXgA9k");
interface FormValues {
  name_on_card: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone_number: string;
  email: string;
}

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const initialValues: FormValues = {
    name_on_card: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone_number: "",
    email: "",
  };

  const validationSchema = Yup.object().shape({
    name_on_card: Yup.string().required("Name on card is required"),
    address: Yup.string().required("Billing address is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    zip_code: Yup.string()
      .matches(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code")
      .required("ZIP code is required"),
    phone_number: Yup.string()
      .transform((value) => value.trim())
      .matches(/^\+?1?\d{10,15}$/, "Please enter a valid phone number")
      .required("Phone number is required"),
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
  });

  const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    try {
      if (!stripe || !elements) {
        throw new Error("Payment system is not ready. Please try again.");
      }

      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error("Card information is required.");
      }

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: values.name_on_card,
          email: values.email,
          phone: values.phone_number,
          address: {
            line1: values.address,
            city: values.city,
            state: values.state,
            postal_code: values.zip_code,
          },
        },
      });

      if (error) {
        notifyResponse({ success: false, detail: error.message || "Card validation failed" });
        return;
      }

      const last4 = paymentMethod.card?.last4;
      const exp_month = paymentMethod.card?.exp_month;
      const exp_year = paymentMethod.card?.exp_year;

      const { data } = await api.post<{ success?: boolean; detail?: string }>( "/payment-method", {
        paymentMethodId: paymentMethod.id,
        last4,
        exp_month,
        exp_year,
        ...values,
      });

      notifyResponse(data ?? {});
      if (data?.success) {
        navigate("/payment");
      }
    } catch (error) {
      console.error("Payment request failed:", error);
      notifyResponse({ 
        success: false, 
        detail: "An error occurred during the payment process. Please try again." 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-2">
      <div className="max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/payment")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Payment Methods
        </button>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Payment Form Section */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FaCreditCard className="text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Add Payment Method</h1>
                    <p className="text-gray-600 mt-1">Securely add your payment details</p>
                  </div>
                </div>
              </div>
              
              <hr className="text-gray-500"></hr>
              {/* Form Content */}
              <div className="p-4 md:p-6">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <FaLock className="text-green-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Your payment information is encrypted and secure
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>PCI DSS Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>256-bit SSL Encryption</span>
                    </div>
                  </div>
                </div>

                <Formik 
                  initialValues={initialValues} 
                  validationSchema={validationSchema} 
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, isValid, dirty }) => (
                    <Form className="space-y-6">
                      {/* Card Information Section */}
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          Card Information
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Cardholder Name */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                              <FaUser className="text-gray-400" />
                              Cardholder Name
                            </label>
                            <div className="relative">
                              <Field
                                name="name_on_card"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                placeholder="John Doe"
                              />
                              <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                            </div>
                            <ErrorMessage name="name_on_card" component="div" className="text-red-500 text-sm mt-1" />
                          </div>

                          {/* Card Details */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Card Details
                            </label>
                            <div className="border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-colors">
                              <CardElement
                                options={{
                                  style: {
                                    base: {
                                      fontSize: "16px",
                                      color: "#374151",
                                      fontFamily: "'Inter', sans-serif",
                                      fontWeight: "500",
                                      "::placeholder": {
                                        color: "#9CA3AF",
                                      },
                                    },
                                    invalid: {
                                      color: "#EF4444",
                                    },
                                  },
                                  hidePostalCode: true,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Billing Address Section */}
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          Billing Address
                        </h2>
                        
                        <div className="space-y-4">
                          {/* Address Line */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Street Address
                            </label>
                            <Field
                              name="address"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                              placeholder="123 Main Street"
                            />
                            <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
                          </div>

                          {/* City, State, ZIP Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                City
                              </label>
                              <Field
                                name="city"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                placeholder="New York"
                              />
                              <ErrorMessage name="city" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                State
                              </label>
                              <Field
                                name="state"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                placeholder="NY"
                              />
                              <ErrorMessage name="state" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                ZIP Code
                              </label>
                              <Field
                                name="zip_code"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                placeholder="10001"
                              />
                              <ErrorMessage name="zip_code" component="div" className="text-red-500 text-sm mt-1" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information Section */}
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Email */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                              <FaEnvelope className="text-gray-400" />
                              Email Address
                            </label>
                            <div className="relative">
                              <Field
                                name="email"
                                type="email"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                placeholder="john.doe@example.com"
                              />
                              <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                            </div>
                            <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                          </div>

                          {/* Phone */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                              <FaPhone className="text-gray-400" />
                              Phone Number
                            </label>
                            <div className="relative">
                              <Field
                                name="phone_number"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                placeholder="+1 (555) 123-4567"
                              />
                              <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                            </div>
                            <ErrorMessage name="phone_number" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-sm text-gray-600">
                            <p>By continuing, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.</p>
                          </div>
                          <button
                            type="submit"
                            disabled={isSubmitting || !isValid || !dirty}
                            className="w-full sm:w-auto px-8 py-3.5 bg-primary-400 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </span>
                            ) : (
                              <span className="flex items-center bg-primary text-black justify-center gap-2">
                                <FaCreditCard />
                                Add Payment Method
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-xl p-4 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-sm text-blue-800 mb-2">Accepted Cards</h4>
                  <div className="flex items-center text-sm gap-2">
                    <div className="p-2 bg-white rounded border">
                      <svg className="w-6 h-4" viewBox="0 0 38 24">
                        <path fill="#FF5F00" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.3 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3z"></path>
                        <path fill="#EB001B" d="M15 12c0-2.8 1.5-5.2 3.8-6.5C16.6 3.7 13.3 2 9.5 2 4.3 2 0 6.3 0 12s4.3 10 9.5 10c3.8 0 7.1-1.7 9.3-4.5-2.3-1.3-3.8-3.7-3.8-6.5z"></path>
                        <path fill="#F79E1B" d="M38 12c0 5.7-4.3 10-9.5 10-3.8 0-7.1-1.7-9.3-4.5 2.3-1.3 3.8-3.7 3.8-6.5s-1.5-5.2-3.8-6.5C21.4 3.7 24.7 2 28.5 2 33.7 2 38 6.3 38 12z"></path>
                      </svg>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <svg className="w-6 h-4" viewBox="0 0 38 24">
                        <path fill="#016FD0" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.3 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3z"></path>
                        <path fill="#fff" d="M18.2 7.2h1.6v9.6h-1.6z"></path>
                        <path fill="#fff" d="M24.8 12c0-1.3-.3-2.4-.9-3.2-.6-.8-1.5-1.2-2.7-1.2-1.2 0-2.1.4-2.7 1.2-.6.8-.9 1.9-.9 3.2s.3 2.4.9 3.2c.6.8 1.5 1.2 2.7 1.2 1.2 0 2.1-.4 2.7-1.2.6-.8.9-1.9.9-3.2zm-1.6 0c0 .9-.2 1.6-.5 2.1-.3.5-.7.7-1.3.7s-1-.2-1.3-.7c-.3-.5-.5-1.2-.5-2.1s.2-1.6.5-2.1c.3-.5.7-.7 1.3-.7s1 .2 1.3.7c.3.5.5 1.2.5 2.1z"></path>
                        <path fill="#fff" d="M30.4 12c0-1.3-.3-2.4-.9-3.2-.6-.8-1.5-1.2-2.7-1.2-1.2 0-2.1.4-2.7 1.2-.6.8-.9 1.9-.9 3.2s.3 2.4.9 3.2c.6.8 1.5 1.2 2.7 1.2 1.2 0 2.1-.4 2.7-1.2.6-.8.9-1.9.9-3.2zm-1.6 0c0 .9-.2 1.6-.5 2.1-.3.5-.7.7-1.3.7s-1-.2-1.3-.7c-.3-.5-.5-1.2-.5-2.1s.2-1.6.5-2.1c.3-.5.7-.7 1.3-.7s1 .2 1.3.7c.3.5.5 1.2.5 2.1z"></path>
                      </svg>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <svg className="w-6 h-4" viewBox="0 0 38 24">
                        <path fill="#252525" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.3 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3z"></path>
                        <path fill="#fff" d="M30.4 12c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6 6 2.7 6 6z"></path>
                        <path fill="#252525" d="M24.4 12c0 2.2 1.8 4 4 4s4-1.8 4-4-1.8-4-4-4-4 1.8-4 4z"></path>
                      </svg>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <svg className="w-6 h-4" viewBox="0 0 38 24">
                        <path fill="#FF5F00" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.3 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3z"></path>
                        <path fill="#EB001B" d="M15 12c0-2.8 1.5-5.2 3.8-6.5C16.6 3.7 13.3 2 9.5 2 4.3 2 0 6.3 0 12s4.3 10 9.5 10c3.8 0 7.1-1.7 9.3-4.5-2.3-1.3-3.8-3.7-3.8-6.5z"></path>
                        <path fill="#F79E1B" d="M38 12c0 5.7-4.3 10-9.5 10-3.8 0-7.1-1.7-9.3-4.5 2.3-1.3 3.8-3.7 3.8-6.5s-1.5-5.2-3.8-6.5C21.4 3.7 24.7 2 28.5 2 33.7 2 38 6.3 38 12z"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaLock className="text-green-600 text-sm" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Secure Payment</h4>
                      <p className="text-sm text-gray-600 mt-1">Your payment information is encrypted and never stored on our servers.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">No Immediate Charges</h4>
                      <p className="text-sm text-gray-600 mt-1">Adding a payment method won't result in any immediate charges.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Easy Updates</h4>
                      <p className="text-sm text-gray-600 mt-1">Update or remove your payment method anytime in your account settings.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Need Help?</h4>
                  <p className="text-sm text-gray-600 mb-3">Contact our support team for assistance with payment methods.</p>
                  <button className="text-primary hover:text-primary-dark font-medium text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentPage = () => (
  <Elements stripe={stripePromise}>
    <PaymentForm />
  </Elements>
);

export default PaymentPage;