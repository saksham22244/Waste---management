import React, { useState } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';
import bgImage from '../assets/backgroundimage.png';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { IoMdInformationCircle } from "react-icons/io";

const GarbageCollectorSignup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    vehicleNumber: "",
    licenseNumber: "",
    verificationImage: null
  });
  const [licenseError, setLicenseError] = useState("");
  const [vehicleError, setVehicleError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'licenseNumber') {
      // Only allow numbers
      if (!/^\d*$/.test(value)) {
        setLicenseError("License number must contain only numbers");
        return;
      }
      // Check minimum length
      if (value.length > 0 && value.length < 6) {
        setLicenseError("License number must be at least 6 digits");
      } else {
        setLicenseError("");
      }
    }

    if (name === 'vehicleNumber') {
      // Remove any spaces and convert to uppercase
      const cleanValue = value.replace(/\s/g, '').toUpperCase();

      // Check if it matches the format: 2 letters followed by 2 numbers followed by 2 letters
      if (!/^[A-Z]{2}\d{2}[A-Z]{2}$/.test(cleanValue)) {
        if (cleanValue.length > 0) {
          setVehicleError("Vehicle number must be in format: AB12CD (2 letters, 2 numbers, 2 letters)");
        } else {
          setVehicleError("");
        }
      } else {
        setVehicleError("");
      }

      // Update the form data with the cleaned value
      setFormData({ ...formData, [name]: cleanValue });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, verificationImage: e.target.files[0] });
  };

  const validatePassword = (password) => {
    const minLength = /.{7,}/;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    return minLength.test(password) && hasNumber.test(password) && hasSpecialChar.test(password);
  };

  const handleNext = (e) => {
    e.preventDefault();
    const phoneNumber = formData.phoneNumber.replace(/\D/g, '');
    if (phoneNumber.length !== 10) {
      toast.error('Phone number must be exactly 10 digits', {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match", {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }
    if (!validatePassword(formData.password)) {
      toast.error("Password does not meet the requirements", {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate vehicle number before submission
    if (!/^[A-Z]{2}\d{2}[A-Z]{2}$/.test(formData.vehicleNumber)) {
      toast.error("Please enter a valid vehicle number (format: AB12CD)", {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    // Validate license number before submission
    if (!/^\d{6,}$/.test(formData.licenseNumber)) {
      toast.error("Please enter a valid license number (minimum 6 digits)", {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    if (!formData.vehicleNumber || !formData.licenseNumber) {
      toast.error("Please fill all garbage collector details", {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    const phoneNumber = formData.phoneNumber.replace(/\D/g, '');
    const updatedFormData = {
      username: formData.username,
      name: formData.name,
      address: formData.address,
      phoneNumber,
      email: formData.email,
      password: formData.password,
      role: "garbageCollector",
      vehicleNumber: formData.vehicleNumber,
      licenseNumber: formData.licenseNumber
    };
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/register`, updatedFormData);
      toast.success("Registration successful! Please verify your OTP.", {
        duration: 3000,
        position: 'top-right',
      });
      navigate('/otp-verification', {
        state: {
          tempUserId: res.data.tempUserId,
          email: formData.email
        }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong during registration", {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center px-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 w-full max-w-md p-8 bg-white bg-opacity-90 shadow-lg rounded-lg">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Green Cycle Tech" style={{ height: '100px', width: 'auto' }} />
        </div>
        <h2 className="text-center text-2xl font-bold text-green-700">GARBAGE COLLECTOR SIGN UP</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          {step === 1 ? "PLEASE FILL THE BASIC DETAILS" : "PLEASE FILL YOUR PROFESSIONAL DETAILS"}
        </p>
        {step === 1 ? (
          <form className="space-y-4" onSubmit={handleNext}>
            <input
              type="text"
              name="username"
              placeholder="USERNAME"
              className="input-field"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="name"
              placeholder="FULL NAME"
              className="input-field"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <select
              name="address"
              className="input-field"
              value={formData.address}
              onChange={handleChange}
              required
            >
              <option value="">SELECT ADDRESS</option>
              <option value="Naxal">Naxal</option>
              <option value="Baneshwor">Baneshwor</option>
              <option value="Koteshwor">Koteshwor</option>
              <option value="Balkhu">Balkhu</option>
              <option value="Boudha">Boudha</option>
            </select>
            <input
              type="text"
              name="phoneNumber"
              placeholder="PHONE NUMBER"
              className="input-field"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="EMAIL"
              className="input-field"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="PASSWORD"
              className="input-field"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="CONFIRM PASSWORD"
              className="input-field"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {/* Always show password requirements */}
            <div className="text-sm text-gray-600">
              <p>Password must contain:</p>
              <ul className="list-disc ml-4">
                <li>At least 7 characters</li>
                <li>At least 1 number</li>
                <li>{`At least 1 special character (!@#$%^&*(),.?":{}|<>)`}</li>
              </ul>
            </div>
            <button
              type="submit"
              className="w-full py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              NEXT
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                name="vehicleNumber"
                placeholder="VEHICLE NUMBER (e.g., AB12CD)"
                className={`input-field ${vehicleError ? 'border-red-500' : ''}`}
                value={formData.vehicleNumber}
                onChange={handleChange}
                required
              />
              {vehicleError && (
                <p className="text-red-500 text-sm mt-1">{vehicleError}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="licenseNumber"
                placeholder="LICENSE NUMBER"
                className={`input-field ${licenseError ? 'border-red-500' : ''}`}
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
              {licenseError && (
                <p className="text-red-500 text-sm mt-1">{licenseError}</p>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-700 space-x-2">
              <IoMdInformationCircle className="text-lg text-green-600" />
              <span>Admin must approve you first before you can start collecting waste.</span>
            </div>

            {/* <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPLOAD VERIFICATION DOCUMENT (License or ID)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100"
                required
              />
            </div> */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/2 py-2 text-green-700 bg-green-50 rounded-md hover:bg-green-100"
              >
                BACK
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                SIGN UP
              </button>
            </div>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-gray-700">
          ALREADY HAVE AN ACCOUNT?{" "}
          <span
            onClick={() => navigate('/login')}
            className="text-green-600 font-semibold cursor-pointer"
          >
            LOGIN NOW
          </span>
        </p>
        <p className="mt-2 text-center text-sm text-gray-700">
          Want to register as a regular user?{" "}
          <span
            onClick={() => navigate('/signup/user')}
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
          >
            Click here
          </span>
        </p>
        <p className="mt-2 text-center text-xs text-gray-500 italic">
          The information provided during sign up cannot be changed later. Please ensure accuracy.
        </p>
      </div>
      <style>{`
        .input-field {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default GarbageCollectorSignup;