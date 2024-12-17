import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

function SignUpStep2() {

  const [studentno, setStudentNo] = useState("")

  return(
    <>

    <div className="flex h-screen bg-gray-100">
          {/* Left Section - Form */}
          <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
            <div className="max-w-md w-full px-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-14">Step 2</h1>
              
              {/* Form Fields */}
              <form className="space-y-10">
              <div className="relative">
                  <input
                    type="text"
                    id="studentno"
                    value={studentno}
                    onChange={(e) => setStudentNo(e.target.value)}
                    className={`peer w-full border rounded-md p-3 pt-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      studentno ? "pt-5" : ""
                    }`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="studentno"
                    className={`absolute left-3 text-gray-500 text-sm transition-all ${
                      studentno
                        ? "top-1 text-xs text-blue-500"
                        : "top-4 text-base text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-500"
                    }`}
                  >
                    Student No.
                  </label>
                </div>  

                <select
                className="w-full p-3 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-600 outline-none"
                >
                    <option value="">Course</option>
                    <option value="Course 1">BSIS</option>
                    <option value="Course 2">ACT</option>
                    </select>
                    <select
                      className="w-full p-3 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                     <option value="">Year Level</option>
                     <option value="1">1</option>
                     <option value="2">2</option>
                     <option value="3">3</option>
                     <option value="4">4</option>
                    </select>
    
                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-800 text-white py-2 rounded-md hover:bg-blue-900 transition duration-200"
                >
                Create Account
                
                </Button>
                {/* Checkbox */}
            <div className="flex items-center mt-4">
            <input type="checkbox" id="terms" className="mr-2" />
            <label htmlFor="terms" className="text-gray-600 text-sm">
              I have read and accept the{" "}
              <a href="#" className="text-blue-500 underline">
                Terms and Conditions
              </a>
              .
            </label>
            </div>
              </form>
             
            </div>
          </div>
    
          {/* Right Section - Background Image */}
          <div
            className="hidden md:block w-1/2 bg-cover bg-center"
            style={{
              backgroundImage: "",
            }}
          ></div>
        </div>
    
  </>
  );
}

export default SignUpStep2;

