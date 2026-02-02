import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
      <div className=" p-8 rounded-2xl  max-w-md w-full">
        <div className="text-8xl text-primary mb-6 flex justify-center">
          <FaExclamationTriangle className="inline-block" />
        </div>
        
        <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
        
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="bg-none text-gray-800 font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors border border-1 border-blue-700/90"
          >
             Go Home
          </button>
          
          <button
            onClick={() => window.history.back()}
            className=" text-gray-800 font-medium py-3 px-6 rounded-lg  flex items-center justify-center gap-2 transition-colors border border-1 border-blue-700/90"
          >
             Back to Previous
          </button>
        </div>
      </div>
      
      <div className=" text-gray-500 text-sm">
        <p>Still lost? Contact our support team for help.</p>
      </div>
    </div>
  );
};

export default NotFoundPage;