import { useEffect, useState } from 'react';
import axios from 'axios';
import CreditCard from './CreditCard';
import toast from 'react-hot-toast';
import useAuth from '../store/useAuth'; // ADDED: Import useAuth hook

// Import Heroicons for better UI
import {
    CreditCardIcon,
    ClockIcon,
    CheckCircleIcon,
    PlusCircleIcon
} from '@heroicons/react/24/outline';

const CardRequest = () => {
    // ADDED: Access user from useAuth
    const { user } = useAuth();
    const [card, setCard] = useState(null);
    const [timer, setTimer] = useState('');
    const API = import.meta.env.VITE_API;

    // Fetch card on component mount
    useEffect(() => {
        const fetchCard = async () => {
            // ADDED: Check for user and token before fetching
            if (!user || !user.token) {
                console.warn("User or token not available, skipping card fetch.");
                return;
            }
            try {
                const res = await axios.get(`${API}/api/cards`, {
                    withCredentials: true,
                    // ADDED: Authorization header for GET request
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                if (res.data.length > 0) {
                    setCard(res.data[0]);
                }
            } catch (err) {
                console.error('Error fetching card:', err.response?.data || err.message);
                // Optionally show a toast error here if fetching fails critically
                // toast.error('Failed to load card status.');
            }
        };
        fetchCard();
    }, [API, user]); // ADDED user to dependency array

    const applyForCard = async () => {
        // ADDED: Check for user and token before applying
        if (!user || !user.token) {
            toast.error('You must be logged in to apply for a card.');
            return;
        }
        try {
            const res = await axios.post(`${API}/api/cards`, {}, {
                withCredentials: true,
                // ADDED: Authorization header for POST request
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setCard(res.data);
            toast.success('Card application submitted!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to apply for card. Please try again.');
            console.error('Card application error:', err.response?.data || err.message);
        }
    };

    // Countdown Logic
    useEffect(() => {
        if (!card || card.status !== 'pending' || !card.issuedAt) return;

        const interval = setInterval(() => {
            const now = new Date();
            const issuedAt = new Date(card.issuedAt);
            const twentyFourHours = 24 * 60 * 60 * 1000;
            const targetTime = issuedAt.getTime() + twentyFourHours;
            const diff = targetTime - now.getTime();

            if (diff <= 0) {
                setCard({ ...card, status: 'active' });
                setTimer('Card is now active!');
                clearInterval(interval);
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                const seconds = Math.floor((diff / 1000) % 60);
                setTimer(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [card]);

    return (
        <div className="w-full h-full bg-purple-900 p-6 rounded-xl shadow-lg border border-purple-800 flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-300 flex items-center">
                <CreditCardIcon className="h-8 w-8 mr-3 text-gray-300" />
                Your Virtual Debit Card
            </h2>

            {!card && (
                <div className="flex flex-col items-center space-y-4">
                    <p className="text-purple-300 text-lg mb-4">
                        You don't have a virtual debit card yet. Apply now to get instant access!
                    </p>
                    <button
                        onClick={applyForCard}
                        className="flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-lg font-bold text-white transition duration-300 ease-in-out shadow-md"
                    >
                        <PlusCircleIcon className="h-6 w-6 mr-2" />
                        Apply for Debit Card
                    </button>
                </div>
            )}

            {card?.status === 'pending' && (
                <div className="mt-4 flex flex-col items-center space-y-4">
                    <ClockIcon className="h-12 w-12 text-yellow-400 animate-pulse" />
                    <p className="text-xl font-semibold text-purple-200">
                        Your card is being issued.
                    </p>
                    <p className="text-3xl font-mono text-white tracking-wide">
                        {timer}
                    </p>
                    <p className="text-sm text-purple-400">
                        Your virtual card will be active in approximately 24 hours from application.
                    </p>
                </div>
            )}

            {card?.status === 'active' && (
                <div className="mt-6 w-full flex flex-col items-center space-y-6">
                    <CheckCircleIcon className="h-12 w-12 text-emerald-400 mb-4" />
                    <p className="text-xl font-semibold text-purple-200">
                        Your virtual card is active!
                    </p>
                    <CreditCard
                        cardNumber={card.cardNumber}
                        cardHolder={card.cardHolder}
                        expiry={card.expiry}
                        type={card.type}
                    />
                    <p className="text-sm text-purple-400">
                        You can now use your virtual card for online transactions.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CardRequest;