import { useEffect, useState } from "react";
import { MessageCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../Helpers/BackendRequest";
import { notyf } from "../Helpers/notyf";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setEmail(searchParams.get("email") ? String(searchParams.get("email")) : "");
  }, [searchParams]);

  const handleVerify = async () => {
    setError("");

    const cleanEmail = email.trim();
    const cleanCode = code.trim();

    if (!cleanEmail) {
      setError("Email is missing. Please sign up again.");
      return;
    }

    if (cleanCode.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/verify-email", { email: cleanEmail, code: cleanCode });
      notyf.success("Email verified successfully");
      navigate("/login", { replace: true });
    } catch (err: any) {
      const apiMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail;

      const message = typeof apiMessage === "string" && apiMessage.trim() ? apiMessage : "Verification failed.";
      setError(message);
      notyf.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Email is missing. Please sign up again.");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post<{ success: boolean; message: string }>(
        "/auth/resend-verification",
        { email: cleanEmail }
      );
      setCode("");
      notyf.success(data?.message || "Verification code sent again");
    } catch (err: any) {
      const apiMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail;

      const message = typeof apiMessage === "string" && apiMessage.trim() ? apiMessage : "Failed to resend code.";
      setError(message);
      notyf.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image Section (same design as Login) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-800">
        {/* Background Image */}
        <img
          src="/login.png"
          alt="Login"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />

        <div className="absolute top-8 left-8 z-20">
          <img src="/Logo.png" alt="BrandMize" className="h-12 w-auto" />
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">
                Brand<span className="text-primary-300">Mize</span>
              </span>
            </div>

            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Verify your email and <span className="text-primary-300">activate</span> your account
            </h2>

            <p className="text-white/90 text-sm">
              Enter the 6-digit code we sent to your inbox to finish setting up your account.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => window.location.href = "/login"}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-8 group transition"
            disabled={isLoading}
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </button>

          <div className="mb-10">
            <h3 className="text-3xl font-bold text-gray-900">Check your inbox</h3>
            <p className="text-gray-600 mt-2">
              {email ? `Enter the 6-digit code sent to ${email}` : "Enter the 6-digit code sent to your email"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-700 text-sm flex-1">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                6-digit OTP code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="block w-full px-4 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-gray-400 text-center text-2xl tracking-widest font-semibold"
                placeholder="000000"
                disabled={isLoading}
              />
              <div className="mt-2 text-sm text-gray-500 text-center">
                {email ? "Did not get the code?" : "Missing email. Please sign up again."}
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleVerify}
                disabled={isLoading}
                className="w-full bg-primary-400 hover:bg-primary-500 text-white font-semibold py-4 px-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Verify Email
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="w-full py-3.5 px-4 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-gray-700 font-medium"
              >
                Resend Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

