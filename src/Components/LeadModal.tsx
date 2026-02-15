import { TbFileSad } from "react-icons/tb";

interface LeadModalProps {
  lead: {
    first_name: string;
    last_name: string;
    email: string;
    add_date: string;
    mobile: string;
    salesforce_id: string;
    other_data?: string[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

function LeadModal({ lead, isOpen, onClose }: LeadModalProps) {
  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-2 sm:px-4 py-4">
      <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-4 md:p-8 relative overflow-y-auto "  style={{
          maxHeight: 'calc(100vh - 40px)', 
          marginTop: '40px',               
          marginBottom: '40px',            
        }}>
        <button
          onClick={onClose}
          className="absolute top-6 right-8 text-gray-500 hover:text-red-500 text-4xl focus:outline-none"
          aria-label="Close Modal"
        >
          &times;
        </button>

        {!lead ? (
          <div className="flex items-center flex-col space-y-6 text-center py-4">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Oops!</h2>
            <TbFileSad className="text-6xl text-center" />
            <p className="text-xl text-gray-600">File with this lead has been deleted or not found.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-4 border-gray-200">
              Lead Details
            </h2>

            <div className="space-y-4 text-lg">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm">
                <span className="font-semibold text-gray-700">Name:</span>
                <span className="text-gray-900">{lead.first_name} {lead.last_name}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm">
                <span className="font-semibold text-gray-700">Email:</span>
                <span className="text-gray-900">{lead.email}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm">
                <span className="font-semibold text-gray-700">Start Date:</span>
                <span className="text-gray-900">{lead.add_date}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm">
                <span className="font-semibold text-gray-700">Mobile:</span>
                <span className="text-gray-900">{lead.mobile}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm">
                <span className="font-semibold text-gray-700">Salesforce ID:</span>
                <span className="text-gray-900">{lead.salesforce_id}</span>
              </div>
             
            </div>
          </>
        )}

        <div className="mt-8 text-right">
          <button
            onClick={onClose}
            className="bg-primary-400 text-white font-semibold px-6 py-2.5 rounded-lg transition duration-300 hover:bg-primary-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeadModal;
