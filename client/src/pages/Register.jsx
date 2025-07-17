import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import useAuth from '../store/useAuth';


const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      toast.success(res.data.message);
      useAuth.getState().login(res.data.data);

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);

    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center px-4 py-8">
      <div className="bg-emerald-900 border border-emerald-800 shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-md">
        
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-amber-300 mb-2">C.B.I.</h1>
          <h2 className="text-2xl font-semibold text-white">Create Account</h2>
          <p className="text-gray-400 text-sm mt-1">Join our premium banking service</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full px-5 py-3 rounded-xl bg-emerald-800 text-white placeholder:text-emerald-300 border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-amber-400 transition duration-200"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            className="w-full px-5 py-3 rounded-xl bg-emerald-800 text-white placeholder:text-emerald-300 border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-amber-400 transition duration-200"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full px-5 py-3 rounded-xl bg-emerald-800 text-white placeholder:text-emerald-300 border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-amber-400 transition duration-200"
            required
          />

          {/* Role selection - assuming 'customer' is default, no visual change unless specified */}
          {/* If you want to make the role selectable, it would be added here */}
          {/* For now, 'role: 'customer'' remains in state and is sent with formData */}

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition duration-300 shadow-lg transform hover:scale-105"
          >
            Register
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account? <Link to="/login" className="text-amber-300 hover:underline font-semibold transition duration-200">Login Here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;