import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

const smoothTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
}

export default function NotFound() {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate(-1); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full space-y-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, ...smoothTransition }}
        >
          <img src="/images/headLogo.png" alt="Logo" className="w-32 h-32 mx-auto mb-8 drop-shadow-xl" />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}>
          <h1 className="text-6xl font-bold text-blue-600 mb-2">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">Oops! The page you're looking for is under development.</p>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative block">
            <motion.button
              onClick={handleGoBack}
              className="w-full py-3 px-6 bg-white text-blue-600 rounded-lg font-medium shadow-sm 
                         hover:shadow-lg transition-all duration-300 ease-in-out
                         flex items-center justify-center gap-2 group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Back
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="mt-12 space-y-1 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <p>Learn Vanguard</p>
        </motion.div>
      </motion.div>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute left-[10%] top-[20%] w-12 h-12 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute right-[10%] top-[10%] w-12 h-12 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute left-[20%] bottom-[20%] w-12 h-12 bg-violet-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  )
}