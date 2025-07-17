import { useEffect, useState } from 'react';
import useAuth from '../store/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [account, setAccount] = useState(null);
  const [transactionType, setTransactionType] = useState('deposit');
  const [isAnimating, setIsAnimating] = useState(false); // For subtle balance animation

  useEffect(() => {
    const fetchAccount = async () => {
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
  }, [user.token]);

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
        `http://localhost:5000/api/bank/${type}`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      toast.success(res.data.message);
      setAccount(res.data.data);
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
        `http://localhost:5000/api/bank/transfer`,
        { accountNumber, amount },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      toast.success(res.data.message);
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

  return (
    <div className="min-h-screen bg-emerald-950 font-sans text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">

      {/* Header and User Info */}
      <header className="w-full max-w-7xl flex flex-col sm:flex-row justify-between items-center bg-emerald-900 p-4 rounded-xl shadow-lg mb-6 sm:mb-8 border border-emerald-800">
        <div className="flex items-center mb-3 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-300 mr-4">C.B.I.</h1>
          <div className="text-sm sm:text-base text-gray-300">
            Welcome, <strong className="text-white">{user?.name}</strong> (<span className="text-yellow-100">{user?.role}</span>)
          </div>
        </div>
        <Link
          to="/login"
          onClick={logout}
          className="flex items-center px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg text-sm font-semibold text-white transition duration-300 ease-in-out shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h8a1 1 0 011 1v2a1 1 0 11-2 0V4H5v12h7v-2a1 1 0 112 0v2a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm10 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V3zm2 2v10h2V5h-2z" clipRule="evenodd" />
          </svg>
          Logout
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Account Summary - Compact and prominent at the top */}
        {account ? (
          <div className="md:col-span-2 lg:col-span-1 bg-emerald-900 p-6 rounded-xl shadow-lg border border-emerald-800 flex flex-col justify-between h-full">
            <h2 className="text-xl font-bold mb-4 text-amber-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10v6a2 2 0 002 2h14a2 2 0 002-2v-6M3 10h18M3 10V4a2 2 0 012-2h3.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H19a2 2 0 012 2v1M3 10h18" />
              </svg>
              Account Balance
            </h2>
            <div className="text-center my-4">
              <p className="text-gray-400 text-sm">Account Number:</p>
              <p className="text-xl font-mono text-white tracking-wide mb-4">{account.accountNumber}</p>
              <p className="text-gray-400 text-base">Current Balance:</p>
              <p className={`font-bold text-5xl text-lime-300 transition-all duration-500 ease-out ${isAnimating ? 'scale-105 opacity-100' : 'scale-100 opacity-90'}`}>
                ₹{account.balance.toFixed(2)}
              </p>
            </div>
            <p className="text-gray-500 text-xs text-center mt-auto">Updated in real-time</p>
          </div>
        ) : (
          <div className="md:col-span-2 lg:col-span-1 bg-emerald-900 p-6 rounded-xl shadow-lg border border-emerald-800 flex items-center justify-center h-full min-h-[150px]">
            <p className="text-gray-400 text-base">No account found. Please contact support.</p>
          </div>
        )}

        {/* Deposit / Withdraw Form */}
        <div className="md:col-span-1 lg:col-span-1 bg-emerald-900 p-6 rounded-xl shadow-lg border border-emerald-800 h-full">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Deposit / Withdraw
          </h2>
          <form onSubmit={handleTransaction} className="space-y-4">
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              className="w-full px-4 py-2 rounded-md bg-emerald-800 text-white placeholder:text-gray-400 border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-amber-300 text-lg
                         [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              required
            />
            <div className="flex bg-emerald-800 rounded-lg p-1 border border-emerald-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setTransactionType('deposit')}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  transactionType === 'deposit'
                    ? 'bg-emerald-600 text-white shadow-inner-lg'
                    : 'text-gray-400 hover:bg-emerald-700'
                }`}
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('withdraw')}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  transactionType === 'withdraw'
                    ? 'bg-red-700 text-white shadow-inner-lg'
                    : 'text-gray-400 hover:bg-emerald-700'
                }`}
              >
                Withdraw
              </button>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 rounded-lg font-bold text-emerald-950 transition duration-300 shadow-md"
            >
              Confirm Transaction
            </button>
          </form>
        </div>

        {/* Transfer Money */}
        <div className="md:col-span-1 lg:col-span-1 bg-emerald-900 p-6 rounded-xl shadow-lg border border-emerald-800 h-full">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Transfer Funds
          </h2>
          <form onSubmit={handleTransfer} className="space-y-4">
            <input
              type="text"
              name="accountNumber"
              placeholder="Receiver Account Number"
              className="w-full px-4 py-2 rounded-md bg-emerald-800 text-white placeholder:text-gray-400 border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-amber-300 text-lg"
              required
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount to Transfer"
              className="w-full px-4 py-2 rounded-md bg-emerald-800 text-white placeholder:text-gray-400 border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-amber-300 text-lg
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
      </main>
    </div>
  );
};

export default Dashboard;