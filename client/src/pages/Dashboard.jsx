// In your Dashboard.jsx (Frontend component)
import { useEffect, useState } from 'react';
import useAuth from '../store/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import TransactionHistory from './TransactionHistory'; // Ensure this path is correct

// Import Heroicons
import {
  ArrowRightOnRectangleIcon,
  WalletIcon,
  CreditCardIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [account, setAccount] = useState(null);
  const [transactionType, setTransactionType] = useState('deposit');
  const [isAnimating, setIsAnimating] = useState(false); // For subtle balance animation

  useEffect(() => {
    const fetchAccount = async () => {
      if (!user || !user.token) {
        toast.error('User not authenticated. Please log in.');
        logout(); // Redirect to login if no user/token
        return;
      }
      try {
        const res = await axios.get('http://localhost:5000/api/bank/me', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setAccount(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch account');
      }
    };

    fetchAccount();
  }, [user, logout]);

  // Function to trigger a subtle animation on the balance
  const triggerBalanceAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500); // Animation duration
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const type = transactionType;

    if (isNaN(amount) || amount <= 0) {
      return toast.error('Enter a valid amount');
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/transactions/${type}`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      toast.success(res.data.message);
      setAccount(res.data.data); // Backend still returns account data for deposit/withdraw
      triggerBalanceAnimation();
      e.target.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const accountNumber = e.target.accountNumber.value;
    const amount = parseFloat(e.target.amount.value);

    if (!accountNumber || isNaN(amount) || amount <= 0) {
      return toast.error('Enter valid details');
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/transactions/transfer`,
        { accountNumber, amount },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      toast.success(res.data.message);
      // Update balance directly after successful transfer
      setAccount((prev) => ({
        ...prev,
        balance: prev.balance - amount,
      }));
      triggerBalanceAnimation();
      e.target.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    }
  };

  if (!user) {
    // Basic loading/redirect state if user is not yet loaded
    return <div className="min-h-screen bg-purple-950 text-white flex items-center justify-center text-xl">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-purple-950 font-sans text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">

      {/* Header and User Info */}
      <header className="w-full max-w-7xl flex flex-col sm:flex-row justify-between items-center bg-purple-900 p-4 rounded-xl shadow-lg mb-6 sm:mb-8 border border-purple-800">
        <div className="flex items-center mb-3 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-300 mr-4">C.B.I.</h1> {/* Changed text-amber-300 to text-gray-300 */}
          <div className="text-sm sm:text-base text-purple-200"> {/* Changed text-gray-200 to text-purple-200 */}
            Welcome, <strong className="text-white">{user?.name}</strong> (<span className="text-yellow-100">{user?.role}</span>)
          </div>
        </div>

        {/* Navigation/Logout Links */}
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            onClick={logout}

            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-800 rounded-lg text-sm font-semibold text-white transition duration-300 ease-in-out shadow-md" 
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2 text-white" />
            Logout
          </Link>
        </div>
      </header>

      <main className="w-full max-w-7xl">

        {/* Section for the three main financial cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

          {/* Account Summary Card */}
          {account ? (
            <div className="md:col-span-2 lg:col-span-1 bg-purple-900 p-6 rounded-xl shadow-lg border border-purple-800 flex flex-col justify-between h-full"> {/* Changed bg-emerald-900 to bg-purple-900, border-emerald-800 to border-purple-800 */}
              <h2 className="text-xl font-bold mb-4 text-gray-300 flex items-center"> {/* Changed text-amber-300 to text-gray-300 */}
                <WalletIcon className="h-6 w-6 mr-2 text-gray-300" /> {/* Changed text-amber-300 to text-gray-300 */}
                Account Balance
              </h2>
              <div className="text-center my-4">
                <p className="text-purple-300 text-sm">Account Number:</p> {/* Changed text-gray-300 to text-purple-300 */}
                <p className="text-xl font-mono text-white tracking-wide mb-4">{account.accountNumber}</p>
                <p className="text-purple-300 text-base">Current Balance:</p> {/* Changed text-gray-300 to text-purple-300 */}
                <p className={`font-bold text-5xl text-emerald-300 transition-all duration-500 ease-out ${isAnimating ? 'scale-105 opacity-100' : 'scale-100 opacity-90'}`}> {/* Changed text-lime-300 to text-emerald-300 */}
                  ₹{account.balance.toFixed(2)}
                </p>
              </div>
              <p className="text-purple-400 text-xs text-center mt-auto">Updated in real-time</p> {/* Changed text-gray-400 to text-purple-400 */}
            </div>
          ) : (
            <div className="md:col-span-2 lg:col-span-1 bg-purple-900 p-6 rounded-xl shadow-lg border border-purple-800 flex items-center justify-center h-full min-h-[150px]"> {/* Changed bg-emerald-900 to bg-purple-900, border-emerald-800 to border-purple-800 */}
              <p className="text-white text-base">Loading account data...</p>
            </div>
          )}

          {/* Deposit / Withdraw Form */}
          <div className="md:col-span-1 lg:col-span-1 bg-purple-900 p-6 rounded-xl shadow-lg border border-purple-800 h-full"> {/* Changed bg-emerald-900 to bg-purple-900, border-emerald-800 to border-purple-800 */}
            <h2 className="text-xl font-bold mb-4 text-white flex items-center">
              <CreditCardIcon className="h-6 w-6 mr-2 text-gray-300" /> {/* Keeping gray icon for neutrality */}
              Deposit / Withdraw
            </h2>
            <form onSubmit={handleTransaction} className="space-y-4">
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                className="w-full px-4 py-2 rounded-md bg-purple-800 text-white placeholder:text-purple-400 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-gray-300 text-lg
                           [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" 
                required
              />
              <div className="flex bg-purple-800 rounded-lg p-1 border border-purple-700 overflow-hidden"> {/* Changed bg-emerald-800 to bg-purple-800, border-emerald-700 to border-purple-700 */}
                <button
                  type="button"
                  onClick={() => setTransactionType('deposit')}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    transactionType === 'deposit'
                      ? 'bg-emerald-600 text-white shadow-inner-lg' // Emerald green for deposit
                      : 'text-purple-300 hover:bg-purple-700' // Changed text-gray-300 to text-purple-300, hover:bg-emerald-700 to hover:bg-purple-700
                  }`}
                >
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('withdraw')}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    transactionType === 'withdraw'
                      ? 'bg-red-700 text-white shadow-inner-lg' // Changed bg-red-700 to bg-fuchsia-700
                      : 'text-purple-300 hover:bg-purple-700' // Changed text-gray-300 to text-purple-300, hover:bg-emerald-700 to hover:bg-purple-700
                  }`}
                >
                  Withdraw
                </button>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-white transition duration-300 shadow-md" 
              >
                Confirm Transaction
              </button>
            </form>
          </div>

          {/* Transfer Money */}
          <div className="md:col-span-1 lg:col-span-1 bg-purple-900 p-6 rounded-xl shadow-lg border border-purple-800 h-full"> {/* Changed bg-emerald-900 to bg-purple-900, border-emerald-800 to border-purple-800 */}
            <h2 className="text-xl font-bold mb-4 text-white flex items-center">
              <ArrowsRightLeftIcon className="h-6 w-6 mr-2 text-gray-300" /> {/* Keeping gray icon for neutrality */}
              Transfer Funds
            </h2>
            <form onSubmit={handleTransfer} className="space-y-4">
              <input
                type="text"
                name="accountNumber"
                placeholder="Receiver Account Number"
                className="w-full px-4 py-2 rounded-md bg-purple-800 text-white placeholder:text-purple-400 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-gray-300 text-lg" 
                required
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount to Transfer"
                className="w-full px-4 py-2 rounded-md bg-purple-800 text-white placeholder:text-purple-400 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-gray-300 text-lg
                           [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-white transition duration-300 shadow-md" 
              >
                Send Money
              </button>
            </form>
          </div>
        </div>
        <TransactionHistory />
      </main>
    </div>
  );
};

export default Dashboard;