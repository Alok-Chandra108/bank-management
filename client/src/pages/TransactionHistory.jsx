// src/components/TransactionHistory.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import useAuth from '../store/useAuth';

// Import icons from Heroicons (add `npm install @heroicons/react` if you haven't)
import {
  ArrowUpIcon,          // For Deposit
  ArrowDownIcon,         // For Withdraw
  ArrowsRightLeftIcon,   // For Transfer
  WalletIcon,            // For card title
  XMarkIcon,             // For close button
  ArrowLongRightIcon,    // For "View All Transactions" button
} from '@heroicons/react/24/outline'; // Using outline style for consistency

// Helper component for a single transaction row
const TransactionRow = ({ txn, isHeader = false }) => {
  const getStatusColor = (type) => {
    switch (type) {
      case 'deposit':
        return 'text-lime-300';
      case 'withdraw':
        return 'text-red-400';
      case 'transfer':
        return 'text-amber-300';
      default:
        return 'text-white';
    }
  };

  const getTypeDisplay = (type) => {
    switch (type) {
      case 'deposit':
        return (
          <div className="flex items-center">
            <ArrowUpIcon className="h-5 w-5 mr-1 text-lime-400" /> Deposit
          </div>
        );
      case 'withdraw':
        return (
          <div className="flex items-center">
            <ArrowDownIcon className="h-5 w-5 mr-1 text-red-400" /> Withdraw
          </div>
        );
      case 'transfer':
        return (
          <div className="flex items-center">
            <ArrowsRightLeftIcon className="h-5 w-5 mr-1 text-amber-400" /> Transfer
          </div>
        );
      default:
        return type;
    }
  };

  if (isHeader) {
    return (
      <div className="grid grid-cols-4 gap-4 py-3 px-4 font-semibold text-sm text-gray-300 border-b border-emerald-700">
        <div className="col-span-1">Type</div>
        <div className="col-span-1">Details</div>
        <div className="col-span-1 text-right">Amount</div>
        <div className="col-span-1 text-right">Date</div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-4 gap-4 py-3 px-4 items-center ${getStatusColor(txn.type)} text-sm border-b border-emerald-800 last:border-b-0`}>
      <div className="col-span-1 font-medium text-white">{getTypeDisplay(txn.type)}</div>
      <div className="col-span-1 text-gray-300">
        {txn.type === 'transfer' && txn.to && txn.to.name ? (
          <span className="font-medium text-white">To: {txn.to.name}</span>
        ) : txn.type === 'transfer' && txn.from && txn.from.name ? (
          <span className="font-medium text-white">From: {txn.from.name}</span>
        ) : (
          <span className="italic">Direct {txn.type}</span>
        )}
        {txn.description && <div className="text-xs text-gray-400 italic mt-1 truncate">{txn.description}</div>}
      </div>
      <div className={`col-span-1 text-right font-bold text-base ${getStatusColor(txn.type)}`}>
        {txn.type === 'deposit' ? '+' : '-'}₹{txn.amount.toFixed(2)}
      </div>
      <div className="col-span-1 text-right text-gray-400 text-xs">
        {moment(txn.createdAt).format('MMM Do, YY - h:mm A')}
      </div>
    </div>
  );
};


// Modal component for full history
const TransactionHistoryModal = ({ transactions, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-emerald-900 rounded-2xl shadow-2xl p-6 w-full max-w-5xl max-h-[90vh] flex flex-col border border-emerald-700 relative">
        <h2 className="text-2xl font-bold mb-6 text-amber-300 flex items-center">
          <WalletIcon className="h-7 w-7 mr-3 text-amber-300" />
          Full Transaction History
        </h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition duration-200"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {transactions.length === 0 ? (
          <p className="text-white text-center py-4 flex-grow flex items-center justify-center">No transactions found.</p>
        ) : (
          <div className="flex-grow overflow-y-auto pr-2"> {/* Removed scrollbar styles */}
            <TransactionRow isHeader /> {/* Table header */}
            {transactions.map((txn) => (
              <TransactionRow key={txn._id} txn={txn} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// Main TransactionHistory component
const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user || !user.token) {
        console.warn("User or token not available, skipping transaction history fetch.");
        setTransactions([]);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/transactions/history', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const sortedTransactions = res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(sortedTransactions);
      } catch (err) {
        console.error('Error fetching transactions:', err.response?.data?.message || err.message);
      }
    };

    fetchTransactions();
  }, [user]);

  const latestFiveTransactions = transactions.slice(0, 5);

  return (
    <div className="p-6 bg-emerald-900 shadow-2xl rounded-2xl border border-emerald-800 text-white flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6 text-amber-300 flex items-center">
        <WalletIcon className="h-7 w-7 mr-3 text-amber-300" />
        Latest Transactions
      </h2>
      {transactions.length === 0 ? (
        <p className="text-white text-center py-4 flex-grow flex items-center justify-center">No transactions found.</p>
      ) : (
        <>
          <div className="flex-grow overflow-y-auto pr-4"> {/* Removed scrollbar-hide */}
            <TransactionRow isHeader /> {/* Table header */}
            {latestFiveTransactions.map((txn) => (
              <TransactionRow key={txn._id} txn={txn} />
            ))}
          </div>
          {transactions.length > 5 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowFullHistory(true)}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-bold text-emerald-950 transition duration-300 shadow-md flex items-center justify-center mx-auto"
              >
                View All Transactions
                <ArrowLongRightIcon className="h-5 w-5 ml-2" /> {/* Replaced SVG with Heroicon */}
              </button>
            </div>
          )}
        </>
      )}

      {showFullHistory && (
        <TransactionHistoryModal
          transactions={transactions}
          onClose={() => setShowFullHistory(false)}
        />
      )}
    </div>
  );
};

export default TransactionHistory;