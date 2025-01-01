import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Link } from 'react-router'





function SignUp() {
    const [firstname, setFirstName] = useState("")
    const [lastname, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    
    
  return (
    <>

    <div className="flex h-screen bg-gray-100">
      {/* Left Section - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="max-w-md w-full px-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Step 1</h1>
          <p className="text-gray-500 mb-14">
            Already have an account? <Link to="/login"><a href="#" className="text-blue-500 font-semibold hover:text-blue-900">Log in</a></Link>
          </p>
          
          {/* Form Fields */}
          <form className="space-y-6">
            <div className="flex gap-8">
            <div className="relative">
                  <input
                    type="text"
                    id="firstname"
                    value={firstname}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`peer w-full border rounded-md p-3 pt-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      firstname ? "pt-5" : ""
                    }`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="firstname"
                    className={`absolute left-3 text-gray-500 text-sm transition-all ${
                      firstname
                        ? "top-1 text-xs text-blue-500"
                        : "top-4 text-base text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-500"
                    }`}
                  >
                     First Name
                  </label>
                </div>  

                <div className="relative">
                  <input
                    type="text"
                    id="lastname"
                    value={lastname}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`peer w-full border rounded-md p-3 pt-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      lastname ? "pt-5" : ""
                    }`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="lastname"
                    className={`absolute left-3 text-gray-500 text-sm transition-all ${
                      lastname
                        ? "top-1 text-xs text-blue-500"
                        : "top-4 text-base text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-500"
                    }`}
                  >
                    Last Name
                  </label>
                </div>  
            </div>

            <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`peer w-full border rounded-md p-3 pt-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      email ? "pt-5" : ""
                    }`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-3 text-gray-500 text-sm transition-all ${
                      email
                        ? "top-1 text-xs text-blue-500"
                        : "top-4 text-base text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-500"
                    }`}
                  >
                    Email
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

            {/* Submit Button */}
            <div>
              <Link to='/signupstep2'>
              <Button
                type="submit"
                className="w-full bg-blue-800 text-white py-2 rounded-md hover:bg-blue-900 transition duration-200"
              >
              Next
              
              </Button>
            </Link>
            </div>
            
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
          backgroundImage: `url('/images/LVauthbg.png')`,
        }}
      ></div>
    </div>
    </>

    
  )
}

export default SignUp
