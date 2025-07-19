// src/components/TransactionHistory.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import useAuth from '../store/useAuth';

// Import icons from Heroicons
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsRightLeftIcon,
  WalletIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const TransactionRow = ({ txn, isHeader = false }) => {
  const getStatusColor = (type) => {
    switch (type) {
      case 'deposit':
        return 'text-emerald-300';
      case 'withdraw':
        return 'text-fuchsia-400';
      case 'transfer':
        return 'text-gray-300';
      default:
        return 'text-white';
    }
  };

  const getTypeDisplay = (type) => {
    switch (type) {
      case 'deposit':
        return (
          <div className="flex items-center">
            <ArrowUpIcon className="h-5 w-5 mr-1 text-emerald-400" /> Deposit
          </div>
        );
      case 'withdraw':
        return (
          <div className="flex items-center">
            <ArrowDownIcon className="h-5 w-5 mr-1 text-fuchsia-400" /> Withdraw
          </div>
        );
      case 'transfer':
        return (
          <div className="flex items-center">
            <ArrowsRightLeftIcon className="h-5 w-5 mr-1 text-gray-400" /> Transfer
          </div>
        );
      default:
        return type;
    }
  };

  if (isHeader) {
    return (
      <div className="grid grid-cols-4 gap-4 py-3 px-4 font-semibold text-sm text-purple-300 border-b border-purple-700 sticky top-0 bg-purple-900 z-10">
        <div className="col-span-1">Type</div>
        <div className="col-span-1">Details</div>
        <div className="col-span-1 text-right">Amount</div>
        <div className="col-span-1 text-right">Date</div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-4 gap-4 py-3 px-4 items-center ${getStatusColor(txn.type)} text-sm border-b border-purple-800 last:border-b-0`}>
      <div className="col-span-1 font-medium text-white">{getTypeDisplay(txn.type)}</div>
      <div className="col-span-1 text-purple-300">
        {txn.type === 'transfer' && txn.to && txn.to.name ? (
          <span className="font-medium text-white">To: {txn.to.name}</span>
        ) : txn.type === 'transfer' && txn.from && txn.from.name ? (
          <span className="font-medium text-white">From: {txn.from.name}</span>
        ) : (
          <span className="italic">Direct {txn.type}</span>
        )}
        {txn.description && <div className="text-xs text-purple-400 italic mt-1 truncate">{txn.description}</div>}
      </div>
      <div className={`col-span-1 text-right font-bold text-base ${getStatusColor(txn.type)}`}>
        {txn.type === 'deposit' ? '+' : '-'}₹{txn.amount.toFixed(2)}
      </div>
      <div className="col-span-1 text-right text-white text-xs">
        {moment(txn.createdAt).format('MMM Do, YY - h:mm A')}
      </div>
    </div>
  );
};


const TransactionHistoryModal = ({ allTransactions, onClose }) => {
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFilterSectionOpen, setIsFilterSectionOpen] = useState(false);

  const applyQuickDateFilter = useCallback((period) => {
    const today = moment();
    let newStartDate = '';
    let newEndDate = today.format('YYYY-MM-DD');

    switch (period) {
      case 'today':
        newStartDate = today.startOf('day').format('YYYY-MM-DD');
        break;
      case 'last7days':
        newStartDate = today.subtract(6, 'days').startOf('day').format('YYYY-MM-DD');
        break;
      case 'last30days':
        newStartDate = today.subtract(29, 'days').startOf('day').format('YYYY-MM-DD');
        break;
      case 'thismonth':
        newStartDate = moment().startOf('month').format('YYYY-MM-DD');
        newEndDate = moment().endOf('month').format('YYYY-MM-DD');
        break;
      case 'lastmonth':
        newStartDate = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
        newEndDate = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
        break;
      case 'thisyear':
        newStartDate = moment().startOf('year').format('YYYY-MM-DD');
        newEndDate = moment().endOf('year').format('YYYY-MM-DD');
        break;
      case 'all':
        newStartDate = '';
        newEndDate = '';
        break;
      default:
        break;
    }
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  const filteredTransactions = useMemo(() => {
    let tempTransactions = [...allTransactions];

    if (filterType) {
      tempTransactions = tempTransactions.filter(txn => txn.type === filterType);
    }

    if (startDate) {
      const startMoment = moment(startDate).startOf('day');
      tempTransactions = tempTransactions.filter(txn =>
        moment(txn.createdAt).isSameOrAfter(startMoment)
      );
    }
    if (endDate) {
      const endMoment = moment(endDate).endOf('day');
      tempTransactions = tempTransactions.filter(txn =>
        moment(txn.createdAt).isSameOrBefore(endMoment)
      );
    }

    return tempTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [allTransactions, filterType, startDate, endDate]);

  const clearFilters = () => {
    setFilterType('');
    setStartDate('');
    setEndDate('');
  };

  const getFilterSummary = () => {
    const activeFilters = [];
    if (filterType) {
      activeFilters.push(`Type: ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`);
    }
    if (startDate && endDate) {
      activeFilters.push(`Dates: ${moment(startDate).format('MMM Do')} - ${moment(endDate).format('MMM Do, YYYY')}`);
    } else if (startDate) {
      activeFilters.push(`From: ${moment(startDate).format('MMM Do, YYYY')}`);
    } else if (endDate) {
      activeFilters.push(`To: ${moment(endDate).format('MMM Do, YYYY')}`);
    }

    return activeFilters.length > 0 ? (
      <span className="text-white italic">{activeFilters.join(', ')}</span>
    ) : (
      <span className="text-white italic">No filters applied</span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-purple-900 rounded-2xl shadow-2xl p-6 w-full max-w-6xl max-h-[90vh] flex flex-col border border-purple-700 relative
                      scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-purple-900 hover:scrollbar-thumb-purple-600">
        <h2 className="text-2xl font-bold mb-6 text-gray-300 flex items-center">
          <WalletIcon className="h-7 w-7 mr-3 text-gray-300" />
          Full Transaction History
        </h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-400 hover:text-white transition duration-200"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Filters Section Header and Toggle */}
        <div className="mb-4 p-4 bg-purple-800 rounded-lg border border-purple-700 flex-shrink-0">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsFilterSectionOpen(!isFilterSectionOpen)}>
            <h3 className="text-lg font-bold text-purple-200 flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2" /> Filters
            </h3>
            <div className="flex items-center text-white hover:text-gray-200">
              {getFilterSummary()}
              {isFilterSectionOpen ? (
                <ChevronUpIcon className="h-5 w-5 ml-2" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 ml-2" />
              )}
            </div>
          </div>

          {/* Filter Controls (Conditionally Rendered) */}
          {isFilterSectionOpen && (
            <div className="mt-4 pt-4 border-t border-purple-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filter by Type */}
              <div>
                <label htmlFor="filterType" className="block text-sm font-medium text-purple-300 mb-1">Transaction Type</label>
                <select
                  id="filterType"
                  className="w-full px-3 py-2 rounded-md bg-purple-700 text-white border border-purple-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdraw">Withdraw</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              {/* Filter by Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-purple-300 mb-1">From Date</label>
                <input
                  type="date"
                  id="startDate"
                  className="w-full px-3 py-2 rounded-md bg-purple-700 text-white border border-purple-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* Filter by End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-purple-300 mb-1">To Date</label>
                <input
                  type="date"
                  id="endDate"
                  className="w-full px-3 py-2 rounded-md bg-purple-700 text-white border border-purple-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Quick Date Filters (Badges with distinct colors and explicit text-white) */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-purple-300 mb-1">Quick Dates</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyQuickDateFilter('today')}
                    className="px-3 py-1.5 text-xs bg-blue-700 hover:bg-blue-800 rounded-full text-white transition duration-200 border border-blue-600"
                  >Today</button>
                  <button
                    onClick={() => applyQuickDateFilter('last7days')}
                    className="px-3 py-1.5 text-xs bg-indigo-700 hover:bg-indigo-800 rounded-full text-white transition duration-200 border border-indigo-600"
                  >Last 7 Days</button>
                  <button
                    onClick={() => applyQuickDateFilter('last30days')}
                    className="px-3 py-1.5 text-xs bg-teal-700 hover:bg-teal-800 rounded-full text-white transition duration-200 border border-teal-600"
                  >Last 30 Days</button>
                  <button
                    onClick={() => applyQuickDateFilter('thismonth')}
                    className="px-3 py-1.5 text-xs bg-lime-700 hover:bg-lime-800 rounded-full text-white transition duration-200 border border-lime-600"
                  >This Month</button>
                  <button
                    onClick={() => applyQuickDateFilter('lastmonth')}
                    className="px-3 py-1.5 text-xs bg-yellow-700 hover:bg-yellow-800 rounded-full text-white transition duration-200 border border-yellow-600"
                  >Last Month</button>
                  <button
                    onClick={() => applyQuickDateFilter('thisyear')}
                    className="px-3 py-1.5 text-xs bg-orange-700 hover:bg-orange-800 rounded-full text-white transition duration-200 border border-orange-600"
                  >This Year</button>
                  <button
                    onClick={() => applyQuickDateFilter('all')}
                    className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-full text-white transition duration-200 border border-gray-600"
                  >All Dates</button>
                </div>
              </div>

              {/* Clear Filters Button (smaller) */}
              <div className="col-span-full mt-2 text-right">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md font-bold text-white text-sm transition duration-300 shadow-md"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" /> Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="text-white text-center py-4 flex-grow flex items-center justify-center">No transactions found matching your filters.</p>
        ) : (
          <div className="flex-grow overflow-y-auto pr-2
                          scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-purple-900 hover:scrollbar-thumb-purple-600">
            <TransactionRow isHeader />
            {filteredTransactions.map((txn) => (
              <TransactionRow key={txn._id} txn={txn} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


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
        const res = await axios.get(`${import.meta.env.VITE_API}/api/transactions/history`, {
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
    <div className="p-6 bg-purple-900 shadow-2xl rounded-2xl border border-purple-800 text-white flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-300 flex items-center">
        <WalletIcon className="h-7 w-7 mr-3 text-gray-300" />
        Latest Transactions
      </h2>
      {transactions.length === 0 ? (
        <p className="text-white text-center py-4 flex-grow flex items-center justify-center">No transactions found.</p>
      ) : (
        <>
          <div className="flex-grow overflow-y-auto pr-2
                          scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-purple-900 hover:scrollbar-thumb-purple-600">
            <TransactionRow isHeader />
            {latestFiveTransactions.map((txn) => (
              <TransactionRow key={txn._id} txn={txn} />
            ))}
          </div>
          {transactions.length > 5 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowFullHistory(true)}
                className="px-6 py-3  bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-white transition duration-300 shadow-md flex items-center justify-center mx-auto"
              >
                View All Transactions
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      {showFullHistory && (
        <TransactionHistoryModal
          allTransactions={transactions}
          onClose={() => setShowFullHistory(false)}
        />
      )}
    </div>
  );
};

export default TransactionHistory;