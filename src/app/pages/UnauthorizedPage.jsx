import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8 text-lg">
          You do not have the necessary permissions to access this page.
        </p>
        <Link 
          to="/login"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out mr-2"
        >
          Login
        </Link>
        <Link 
          to="/dashboard"
          className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition duration-300 ease-in-out"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
} 