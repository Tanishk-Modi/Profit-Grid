import React, { useEffect, useState } from 'react';

interface WatchlistItemPublic {
    id: number;
    symbol: string;
    user_id: number;
}

interface WatchlistDisplayProps {
    authToken: string; 
    currentUserId: number; 
    onClose: () => void; // Callback to close the watchlist display
    onStockSelect: (symbol: string) => void; // Callback to view a stock's analysis from the watchlist
}

const WatchlistDisplay: React.FC<WatchlistDisplayProps> = ({ authToken, currentUserId, onClose, onStockSelect }) => {
    const [watchlist, setWatchlist] = useState<WatchlistItemPublic[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    // Function to fetch the user's watchlist
    const fetchWatchlist = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/watchlists`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`, 
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to fetch watchlist.');
            }

            const data: WatchlistItemPublic[] = await response.json();
            setWatchlist(data);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred while fetching watchlist.");
        } finally {
            setLoading(false);
        }
    };

    // Function to remove a stock from watchlist
    const removeStock = async (symbolToRemove: string) => {
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/watchlists/${symbolToRemove}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`, 
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Failed to remove ${symbolToRemove}.`);
            }

            // If successful (204 No Content), update the local state to remove the item
            setWatchlist(prevWatchlist => prevWatchlist.filter(item => item.symbol !== symbolToRemove));
        } catch (err: any) {
            setError(err.message || `An unexpected error occurred while removing ${symbolToRemove}.`);
        }
    };

    useEffect(() => {
        if (authToken) {
            fetchWatchlist();
        } else {
            setError("Not authenticated."); 
            setLoading(false);
        }
    }, [authToken]); 


    return (
        <div className="flex flex-col p-6 max-w-md w-full bg-gray-800 bg-opacity-90 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 relative text-gray-100">
            <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-white text-3xl font-bold focus:outline-none"
                aria-label="Close"
            >
                &times;
            </button>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500 mb-6 text-center">My Watchlist</h2>

            {loading && <p className="text-gray-400 text-center">Loading watchlist...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {!loading && !error && watchlist.length === 0 && (
                <p className="text-gray-400 text-center">Your watchlist is empty. Add some stocks!</p>
            )}

            {!loading && !error && watchlist.length > 0 && (
                <ul className="space-y-3">
                    {watchlist.map(item => (
                        <li key={item.id} className="flex items-center justify-between bg-gray-700 bg-opacity-50 p-3 rounded-md border border-gray-600">
                            <button
                                onClick={() => onStockSelect(item.symbol)}
                                className="text-xl font-semibold text-green-400 hover:text-green-300 transition-colors focus:outline-none"
                            >
                                {item.symbol}
                            </button>
                            <button
                                onClick={() => removeStock(item.symbol)}
                                className="ml-4 px-3 py-1 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default WatchlistDisplay;