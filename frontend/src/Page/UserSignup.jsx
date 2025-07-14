import React, { useState } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';
import bgImage from '../assets/backgroundimage.png';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
const UserSignup = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [touchedFields, setTouchedFields] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: "" });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields({ ...touchedFields, [name]: true });
  };

  const validatePassword = (password) => {
    const minLength = /.{7,}/;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    return minLength.test(password) && hasNumber.test(password) && hasSpecialChar.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    const phoneNumber = formData.phoneNumber.replace(/\D/g, '');

    if (phoneNumber.length !== 10) {
      errors.phoneNumber = 'Phone number must be exactly 10 digits';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!validatePassword(formData.password)) {
      errors.password = "Password must be at least 7 characters, include 1 number and 1 special character";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const updatedFormData = {
      username: formData.username,
      name: formData.name,
      address: formData.address,
      phoneNumber,
      email: formData.email,
      password: formData.password,
      role: "User"
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
      toast.error(err.response?.data?.message || "Something went wrong during registration.", {
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

        <h2 className="text-center text-2xl font-bold text-green-700">USER SIGN UP</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          PLEASE FILL THE DETAILS TO CREATE USER ACCOUNT
        </p>

        {formErrors.server && (
          <p className="text-sm text-red-600 text-center">{formErrors.server}</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="USERNAME"
            className="input-field"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {touchedFields.username && !formData.username && (
            <p className="text-sm text-red-600">Username is required.</p>
          )}

          <input
            type="text"
            name="name"
            placeholder="FULL NAME"
            className="input-field"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {touchedFields.name && !formData.name && (
            <p className="text-sm text-red-600">Full name is required.</p>
          )}

          <select
            name="address"
            className="input-field"
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          >
            <option value="">SELECT ADDRESS</option>
            <option value="Naxal">Naxal</option>
            <option value="Baneshwor">Baneshwor</option>
            <option value="Koteshwor">Koteshwor</option>
            <option value="Balkhu">Balkhu</option>
            <option value="Boudha">Boudha</option>
          </select>
          {touchedFields.address && !formData.address && (
            <p className="text-sm text-red-600">Address is required.</p>
          )}

          <input
            type="text"
            name="phoneNumber"
            placeholder="PHONE NUMBER"
            className="input-field"
            value={formData.phoneNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {formErrors.phoneNumber && (
            <p className="text-sm text-red-600">{formErrors.phoneNumber}</p>
          )}

          <input
            type="email"
            name="email"
            placeholder="EMAIL"
            className="input-field"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {touchedFields.email && !formData.email && (
            <p className="text-sm text-red-600">Email is required.</p>
          )}

          <input
            type="password"
            name="password"
            placeholder="PASSWORD"
            className="input-field"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {formErrors.password && (
            <p className="text-sm text-red-600">{formErrors.password}</p>
          )}

          <input
            type="password"
            name="confirmPassword"
            placeholder="CONFIRM PASSWORD"
            className="input-field"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {formErrors.confirmPassword && (
            <p className="text-sm text-red-600">{formErrors.confirmPassword}</p>
          )}

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
            SIGN UP
          </button>
        </form>

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
          Want to register as a garbage collector?{" "}
          <span
            onClick={() => navigate('/signup/garbage-collector')}
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

export default UserSignup;
