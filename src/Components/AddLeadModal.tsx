import { useState } from "react";
import { Input } from "./Input";
import { Button } from "./Button";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lead: { 
    first_name: string; 
    last_name: string; 
    email: string; 
    mobile: string; 
    startDate: string; 
    salesforce_id: string;
    other_data: string[]; 
  }) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [startDate, setStartDate] = useState("");
  const [salesforceId, setSalesforceId] = useState("");
  const [customField01, setCustomField01] = useState("");
  const [customField02, setCustomField02] = useState(""); 
  const [error, setError] = useState("");  

  const resetFields = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setMobile("");
    setStartDate("");
    setSalesforceId("");
    setCustomField01("");
    setCustomField02("");  
    setError("");
  };

  const handleSubmit = () => {
    if (
      !firstName.trim() || 
      !lastName.trim() || 
      !email.trim() || 
      !mobile.trim() || 
      !startDate.trim() || 
      !salesforceId.trim() ||
      !customField01.trim() ||  
      !customField02.trim()
    ) {
      setError("All fields are required");
      return; 
    }

    onSubmit({
      first_name: firstName,
      last_name: lastName,
      email,
      mobile,
      startDate,
      salesforce_id: salesforceId,
      other_data: [customField01, customField02], 
    });

    setError("");
    // resetFields();
    onClose();
  };

  const handleClose = () => {
    // resetFields();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white py-6 px-6 md:px-10 rounded-lg shadow-lg max-w-full md:max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-8 text-gray-500 hover:text-red-500 text-4xl focus:outline-none"
          aria-label="Close Modal"
        >
          &times;
        </button>
        <h2 className="text-2xl texi-semibold sm:font-bold mb-6 text-primary">Add New Lead</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col">
            <label className="mb-2 text-gray-700 font-semibold">First Name</label>
            <input
              value={firstName}
              onChange={e => setFirstName(e.currentTarget.value)}
              placeholder="Enter First Name"
              className="border border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-gray-700 font-semibold">Last Name</label>
            <input
              value={lastName}
              onChange={e => setLastName(e.currentTarget.value)}
              placeholder="Enter Last Name"
              className="border border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-gray-700 font-semibold">Email</label>
            <input
              value={email}
              onChange={e => setEmail(e.currentTarget.value)}
              placeholder="Enter Email"
              className="border border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-gray-700 font-semibold">Start Date</label>
            <input
              value={startDate}
              onChange={e => setStartDate(e.currentTarget.value)}
              placeholder="YYYY-MM-DD"
              className="border border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-gray-700 font-semibold">Salesforce Id</label>
            <input
              value={salesforceId}
              onChange={e => setSalesforceId(e.currentTarget.value)}
              placeholder="Salesforce ID"
              className="border border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-gray-700 font-semibold">Mobile</label>
            <input
              value={mobile}
              onChange={e => setMobile(e.currentTarget.value)}
              placeholder="Enter Mobile Number"
              className="border border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-gray-700 font-semibold">Custom Field 01</label>
            <input
              value={customField01}
              onChange={e => setCustomField01(e.currentTarget.value)}
              placeholder="Custom Field 01"
              className="border border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-gray-700 font-semibold">Custom Field 02</label>
            <input
              value={customField02}
              onChange={e => setCustomField02(e.currentTarget.value)}
              placeholder="Custom Field 02"
              className="border border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
            />
          </div>
        </div>

        {error && <div className="text-xl text-red-500 mt-4">{error}</div>}

        <div className="mt-8 flex justify-end space-x-4">
        <button
    className="border bg-white text-black border-primary-400 hover:bg-primary-400 hover:text-white py-2 px-4 rounded-md transition duration-300"
    onClick={handleClose}
  >
    Cancel
  </button>
  <button
    className="bg-primary-400 text-white border hover:bg-white hover:border-primary-400 hover:text-gray-900 py-2 px-4 rounded-md transition duration-300"
    onClick={handleSubmit}
  >
    Add Lead
  </button>
 
</div>

      </div>
    </div>
  );
};

export default AddLeadModal;
