import React, { useState } from 'react';

interface FormData {
  name: string;
}

interface CallFormProps {
  onSubmit: (data: FormData, action: 'phoneCall' | 'testCall') => void;
  onClose: () => void;
}

const CallForm: React.FC<CallFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
  });

  const isFormValid = (): boolean => {
    return formData.name.trim() !== '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAction = (action: 'phoneCall' | 'testCall') => {
    if (isFormValid()) {
      onSubmit(formData, action);
    } else {
      console.warn('Form is invalid');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800/50  flex justify-center items-center p-12 z-90">
      <div className="bg-white py-6 px-6 md:px-10 rounded-lg shadow-lg max-w-full md:max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-8 text-gray-500 hover:text-red-500 text-4xl focus:outline-none"
          aria-label="Close Form"
        >
          &times;
        </button>
        <h2 className="text-xl md:text-2xl font-semibold sm:font-bold mb-6 text-primary">Enter Call Details</h2>
        
        <div className="flex flex-col mb-8">
          <label className="mb-2 text-base text-gray-700 font-semibold">Name</label>
            <input
              type="text"
            name="name"
            value={formData.name}
              onChange={handleChange}
            placeholder="Enter your name"
            className="border text-base border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-3"
            />
          </div>

        <div className="flex justify-end space-x-4">
          <button
            className="border bg-white text-gray-950 text-base border-primary-400 hover:bg-primary-400 hover:text-white py-2 px-4 rounded-md transition duration-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`bg-primary-400 text-white py-2 text-base px-4 rounded-md transition duration-300 ${
              isFormValid() ? 'hover:bg-primary-600' : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => handleAction('testCall')}
            disabled={!isFormValid()}
          >
            Start
          </button>
          {/* <button
            type="button"
            className={`bg-primary-400 text-white py-2 text-base px-4 rounded-md transition duration-300 ${
              isFormValid() ? 'hover:bg-primary-600' : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => handleAction('phoneCall')}
            disabled={!isFormValid()}
          >
            Make Phone Call
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default CallForm;
