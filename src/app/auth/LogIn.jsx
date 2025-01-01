import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Link } from "react-router"


function LogIn() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

  return (
  <>
       <div className="flex h-screen bg-gray-100">
      {/* Left Section - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="max-w-md w-full px-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-500 mb-14">
            Don't have an account? <Link to="/signup"><a href="#" className="text-blue-500 font-semibold hover:text-blue-900">Sign Up</a></Link>
          </p>
          
          {/* Form Fields */}
          <form className="space-y-6">
            <div className="relative">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`peer w-full border rounded-md p-3 pt-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      username ? "pt-5" : ""
                    }`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="username"
                    className={`absolute left-3 text-gray-500 text-sm transition-all ${
                      username
                        ? "top-1 text-xs text-blue-500"
                        : "top-4 text-base text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-500"
                    }`}
                  >
                    Username or Email
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`peer w-full border rounded-md p-3 pt-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      password ? "pt-5" : ""
                    }`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-3 text-gray-500 text-sm transition-all ${
                      password
                        ? "top-1 text-xs text-blue-500"
                        : "top-4 text-base text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-500"
                    }`}
                  >
                    Password
                  </label>
                </div>

                <div className="flex justify-center">
                    <a href="#" className="text-blue-500 font-semibold hover:text-blue-900">Forgot Password?</a>
                </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-800 text-white py-3 rounded-md hover:bg-blue-900 transition duration-200"
            >
            Log In
            
            </Button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center my-12">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Icon */}
          <div className="flex justify-center">
            <Button className="p-2 rounded-full bg-white border shadow-md hover:shadow-lg transition duration-200">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google Logo"
                className="w-6 h-6"
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Section - Background Image */}
      <div
        className="hidden md:block w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/LVauthbg.png')",
        }}
      ></div>
    </div>
    </>
  )
}

export default LogIn
