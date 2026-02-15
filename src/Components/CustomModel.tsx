import React from 'react';
import { BiPhoneCall } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";

interface Field {
  label: string;
  type: string;
  placeholder: string;
}

interface TwilioModalProps {
  showModal: boolean; 
  handleCloseModal: () => void;
  title: string;
  fields: Field[];
  onSubmit: (values: Record<string, string>) => void; 
}

const CustomModel: React.FC<TwilioModalProps> = ({
  showModal,
  handleCloseModal,
  title,
  fields,
  onSubmit,
}) => {
  const [formValues, setFormValues] = React.useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    onSubmit(formValues); 
    handleCloseModal();  
  };

  if (!showModal) return null;

  return (
    <div>
      <div className="fixed inset-0 flex items-center bg-slate-800 justify-center bg-opacity-50 z-50 px-2">
        <div className="p-6 rounded-lg bg-white shadow-lg max-w-lg w-full">
          <div className="flex justify-between items-center mb-4">
            <div className='flex items-center gap-2'>
              <BiPhoneCall className='text-primary text-xl' />
              <h2 className="text-xl font-semibold">{title}</h2>
            </div>
            <button className="text-3xl" onClick={handleCloseModal}>
              <IoMdClose />
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={index}>
                <label className="block text-sm mb-2">{field.label}</label>
                <input
                  type={field.type}
                  name={field.label} 
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-lg border  border-primary outline-none focus"
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>

          <hr className='text-primary bg-primary opacity-25 mt-6 mb-2 pt-[.6px]' />

          <div className="flex justify-end mt-6">
            <button
              className="font-bold py-2 px-4 rounded mr-4 hover:bg-black hover:text-white"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              className="bg-primary-400 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModel;
