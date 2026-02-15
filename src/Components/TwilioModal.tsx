import React from "react";
import { BiPhoneCall } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";

interface Field {
  label: string;
  type: string;
  placeholder: string;
}

interface TwilioModalProps {
  showModal: string;
  handleCloseModal: () => void;
  title: string;
  fields: Field[];
  buttonText: string;
  onSubmit: (values: Record<string, string | string[]>) => void;
  showCountrySelection?: boolean;
}

const TwilioModal: React.FC<TwilioModalProps> = ({
  showModal,
  handleCloseModal,
  title,
  fields,
  onSubmit,
  buttonText,
  showCountrySelection = true,
}) => {
  const [formValues, setFormValues] = React.useState<Record<string, string>>(
    {}
  );
  const [areaCodes, setAreaCodes] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [country, setCountry] = React.useState<string>("US");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleAreaCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCountry(e.target.value);
  };

  const handleAddAreaCode = () => {
    if (inputValue && !areaCodes.includes(inputValue)) {
      setAreaCodes([...areaCodes, inputValue]);
      setInputValue("");
    }
  };

  const handleRemoveAreaCode = (index: number) => {
    setAreaCodes((prevCodes) => prevCodes.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const submitData: Record<string, string | string[]> = { 
      ...formValues, 
      area_code: areaCodes
    };
    if (showCountrySelection) {
      submitData.country = country;
    }
    onSubmit(submitData);
    handleCloseModal();
  };

  return (
    <div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 px-2 sm:px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-md lg:max-w-lg mx-auto transform transition-all duration-300 hover:shadow-3xl">
            
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <BiPhoneCall className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{title}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Configure your settings</p>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
              >
                <IoMdClose className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 group-hover:text-gray-700 group-hover:rotate-90 transition-all duration-200" />
              </button>
            </div>


            <div className="p-4 sm:p-6 space-y-6">
              
              <div className="space-y-4">
                {fields?.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {field.label}
                    </label>
                    {field.label.toLowerCase().includes('area') ? (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type={field.type}
                            name={field.label}
                            placeholder={field.placeholder}
                            required
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 text-gray-800"
                            onChange={handleAreaCodeChange}
                            value={inputValue}
                          />
                          <button
                            type="button"
                            onClick={handleAddAreaCode}
                            className="px-4 sm:px-6 py-3 bg-primary-400 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap"
                          >
                            Add Code
                          </button>
                        </div>
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        name={field.label}
                        placeholder={field.placeholder}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 text-gray-800"
                        onChange={handleChange}
                      />
                    )}
                  </div>
                ))}
              </div>

              {showCountrySelection && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Country
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${country === "US" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                      <input
                        type="radio"
                        id="country_us"
                        name="country"
                        value="US"
                        checked={country === "US"}
                        onChange={handleCountryChange}
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇺🇸</span>
                        <span className="text-sm font-medium text-gray-700">United States</span>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${country === "CA" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                      <input
                        type="radio"
                        id="country_ch"
                        name="country"
                        value="CA"
                        checked={country === "CA"}
                        onChange={handleCountryChange}
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇨🇦</span>
                        <span className="text-sm font-medium text-gray-700">Canada</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {areaCodes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700">Added Area Codes</h3>
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">
                      {areaCodes.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {areaCodes.map((code, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary px-3 py-2 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-200 group"
                      >
                        <span className="font-semibold text-sm">{code}</span>
                        <button
                          onClick={() => handleRemoveAreaCode(index)}
                          className="w-5 h-5 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-full flex items-center justify-center transition-all duration-200 font-bold text-xs hover:scale-110 active:scale-95"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

           
            <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
              <button
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="w-full sm:w-auto px-6 py-3 bg-primary-400 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TwilioModalProps2 {
  showModal: string;
  handleCloseModal: () => void;
  title: string;
  fields: Field[];
  buttonText: string;
  onSubmit: (values: Record<string, string | string[]>) => void;
}

const TwilioModal2: React.FC<TwilioModalProps2> = ({
  showModal,
  handleCloseModal,
  title,
  fields,
  onSubmit,
  buttonText,
}) => {
  const [countryCode, setCountryCode] = React.useState<string>("");
  const [country, setCountry] = React.useState<string>("US");

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCountryCode(e.target.value);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCountry(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit({ 
      area_code: [countryCode], // Send as array to maintain compatibility with existing API
      country: country 
    });
    handleCloseModal();
  };

  return (
    <div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 px-2 sm:px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto transform transition-all duration-300">
            
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BiPhoneCall className="text-primary w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                  <p className="text-xs text-gray-500">Enter country code to search</p>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
              >
                <IoMdClose className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* <div className="space-y-4">
                {fields?.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                      <input
                        type={field.type}
                        name={field.label}
                        placeholder={field.placeholder}
                        required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-gray-800"
                      onChange={handleCountryCodeChange}
                      value={countryCode}
                    />
                  </div>
                ))}
              </div> */}

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${country === "US" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                    <input
                      type="radio"
                      id="country_us"
                      name="country"
                      value="US"
                      checked={country === "US"}
                      onChange={handleCountryChange}
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🇺🇸</span>
                      <span className="text-sm font-medium text-gray-700">United States</span>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${country === "CA" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                    <input
                      type="radio"
                      id="country_ca"
                      name="country"
                      value="CA"
                      checked={country === "CA"}
                      onChange={handleCountryChange}
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🇨🇦</span>
                      <span className="text-sm font-medium text-gray-700">Canada</span>
                    </div>
                  </label>
                </div>
              </div>

              {countryCode && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">Country Code to Search:</span>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">
                      {countryCode}
                  </span>
                </div>
                  </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
              <button
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                // disabled={!countryCode}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-all duration-200
                    bg-primary-400 hover:bg-primary-600 text-white
                }`}
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwilioModal;
export { TwilioModal2 };