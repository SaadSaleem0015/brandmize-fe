import React, { useState } from "react";
import { BiPhoneCall } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { twilioSupportedCountries, TwilioCountry } from "../../Helpers/twilioSupportedCountries";

interface SearchNumbersModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, string | string[]>) => void;
  buttonText?: string;
}

export const SearchNumbersModal: React.FC<SearchNumbersModalProps> = ({
  show,
  onClose,
  onSubmit,
  buttonText = "Search Numbers",
}) => {
  const [country, setCountry] = useState<string>("US");
  const [digitValue, setDigitValue] = useState("");

  const selectedCountry = twilioSupportedCountries.find((c) => c.code === country) ?? twilioSupportedCountries[0];
  const isAreaCode = selectedCountry.type === "area_code";
  const fieldLabel = isAreaCode ? "Area Code" : "Contains";
  const fieldPlaceholder = isAreaCode
    ? "e.g. 415, 212, 218 (3 digits)"
    : "e.g. 30, 20, 11 (digits to match)";
  const maxLength = isAreaCode ? 3 : undefined;

  const handleSubmit = () => {
    const trimmed = digitValue.trim();
    if (!trimmed) return;
    // For area_code: send as single 3-digit; for contains: send as-is (can be multiple digits)
    onSubmit({ country, area_code: [trimmed] });
    setDigitValue("");
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 px-2 sm:px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BiPhoneCall className="text-primary w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Search Phone Numbers</h2>
              <p className="text-xs text-gray-500">Select country and enter {isAreaCode ? "area code" : "contains"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <IoMdClose className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Country dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setDigitValue("");
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-800"
            >
              {twilioSupportedCountries.map((c: TwilioCountry) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic field: Area Code (3 digit) or Contains */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{fieldLabel}</label>
            <input
              type="text"
              inputMode="numeric"
              pattern={isAreaCode ? "[0-9]{0,3}" : undefined}
              maxLength={maxLength}
              value={digitValue}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                if (isAreaCode && v.length > 3) return;
                setDigitValue(v);
              }}
              placeholder={fieldPlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-800"
            />
            <p className="text-xs text-gray-500">{selectedCountry.note}</p>
          </div>
        </div>

        <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!digitValue.trim()}
            className="flex-1 px-4 py-3 bg-primary-400 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchNumbersModal;
