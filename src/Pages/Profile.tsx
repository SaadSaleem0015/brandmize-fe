import { useEffect, useState } from "react";
import { api } from "../Helpers/BackendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { Mail, User, Lock, Eye, EyeOff, Save, RotateCcw, UserCircle } from "lucide-react";

interface ProfileForm {
  name: string;
  email: string;
  password: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export function Profile() {
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    email: "",
    password: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get<{ name?: string; email?: string } | { data?: { name?: string; email?: string } }>("/auth/profile");
        const payload = data && typeof data === "object" && "data" in data ? (data as { data?: { name?: string; email?: string } }).data : data;
        const profile = payload && typeof payload === "object" ? payload : {};
        setForm((prev) => ({
          ...prev,
          name: (profile as { name?: string })?.name ?? "",
          email: (profile as { email?: string })?.email ?? "",
        }));
      } catch {
        // ignore; notify could be added if needed
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: ValidationErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (form.newPassword || form.confirmNewPassword || form.password) {
      if (!form.password) newErrors.password = "Current password is required to change password";
      if (form.newPassword && form.newPassword.length < 8) {
        newErrors.newPassword = "New password must be at least 8 characters";
      }
      if (form.newPassword && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword)) {
        newErrors.newPassword = "Password must contain uppercase, lowercase, and numbers";
      }
      if (form.newPassword !== form.confirmNewPassword) {
        newErrors.confirmNewPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: any = {
        email: form.email,
        name: form.name,
        role: "user",
        password: form.password || null,
        newPassword: form.newPassword || null,
      };

      const { data } = await api.post<{ success?: boolean; detail?: string }>("/auth/update-profile", payload);
      notifyResponse(data ?? {}, "Profile updated successfully", "Failed to update profile");

      setForm((prev) => ({
        ...prev,
        password: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to update profile";
      notifyResponse({ success: false, detail: message }, "", "");
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordFields = () => {
    setForm((prev) => ({
      ...prev,
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    }));
    setErrors((prev) => ({
      ...prev,
      password: undefined,
      newPassword: undefined,
      confirmNewPassword: undefined,
    }));
  };

  if (initialLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header with Avatar */}
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
          <UserCircle className="w-8 h-8 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal information and account security
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
            <p className="text-xs text-gray-500 mt-0.5">Update your name and email address</p>
          </div>
          
          <div className="p-6 space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.email ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Password Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Leave these fields empty if you don't want to change your password
            </p>
          </div>
          
          <div className="p-6 space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`block w-full pl-11 pr-12 py-3 bg-gray-50 border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.password ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* New Password and Confirm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={form.newPassword}
                    onChange={(e) => handleChange("newPassword", e.target.value)}
                    className={`block w-full pl-11 pr-12 py-3 bg-gray-50 border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.newPassword ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    placeholder="New password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {form.newPassword && (
                  <div className="mt-2 flex gap-1.5">
                    <div className={`h-1 flex-1 rounded-full ${form.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${/(?=.*[a-z])(?=.*[A-Z])/.test(form.newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${/\d/.test(form.newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                  </div>
                )}
                {errors.newPassword && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmNewPassword}
                    onChange={(e) => handleChange("confirmNewPassword", e.target.value)}
                    className={`block w-full pl-11 pr-12 py-3 bg-gray-50 border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.confirmNewPassword ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmNewPassword && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.confirmNewPassword}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={resetPasswordFields}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
            disabled={loading}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:from-primary-700 hover:to-secondary-700 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}