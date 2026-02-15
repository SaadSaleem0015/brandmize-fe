import { useEffect, useState } from "react";
import { api } from "../Helpers/BackendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { Mail, User, Lock } from "lucide-react";

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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get<{ name?: string; email?: string } | { data?: { name?: string; email?: string } }>("/profile");
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

    if (form.newPassword || form.confirmNewPassword || form.password) {
      if (!form.password) newErrors.password = "Current password is required to change password";
      if (form.newPassword && form.newPassword.length < 8) {
        newErrors.newPassword = "New password must be at least 8 characters";
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
        password: form.password || null,
        newPassword: form.newPassword || null,
      };

      const { data } = await api.post<{ success?: boolean; detail?: string }>("/update-profile", payload);
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

  if (initialLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your personal information and password.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6"
      >
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`block w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary/60 outline-none transition ${
                  errors.name ? "border-red-400" : "border-gray-200"
                }`}
                placeholder="Your name"
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`block w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary/60 outline-none transition ${
                  errors.email ? "border-red-400" : "border-gray-200"
                }`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-1">Change password</h2>
          <p className="text-xs text-gray-500 mb-4">
            Leave these fields empty if you don&apos;t want to change your password.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary/60 outline-none transition ${
                    errors.password ? "border-red-400" : "border-gray-200"
                  }`}
                  placeholder="Enter current password"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => handleChange("newPassword", e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary/60 outline-none transition ${
                      errors.newPassword ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="New password"
                  />
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm new password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={form.confirmNewPassword}
                    onChange={(e) => handleChange("confirmNewPassword", e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary/60 outline-none transition ${
                      errors.confirmNewPassword ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="Confirm new password"
                  />
                </div>
                {errors.confirmNewPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmNewPassword}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                password: "",
                newPassword: "",
                confirmNewPassword: "",
              }))
            }
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition"
            disabled={loading}
          >
            Reset changes
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-400 hover:bg-primary-600 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

