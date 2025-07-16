import React, { useEffect, useState } from 'react';

interface WatchlistItemPublic {
    id: number;
    symbol: string;
    user_id: number;
}

interface WatchlistDisplayProps {
    authToken: string; 
    currentUserId: number; 
    onClose: () => void; 
    onStockSelect: (symbol: string) => void; 
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blurred colored glow background */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/60 via-black/80 to-green-900/60 opacity-90 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.15)_0%,_transparent_70%)] pointer-events-none"></div>
            {/* Subtle grid overlay */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, #374151 1px, transparent 1px), linear-gradient(to bottom, #374151 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            ></div>
            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-2">
                <div
                    className="
                        relative flex flex-col
                        p-4 sm:p-8 pt-12 pb-10
                        bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95
                        rounded-2xl shadow-2xl
                        animate-fade-in-up
                        backdrop-blur-xl
                        mx-auto
                        border border-teal-500/40
                        "
                    style={{
                        boxShadow:
                            '0 0 32px 4px rgba(34,197,94,0.10), 0 8px 32px 0 rgba(0,0,0,0.25)',
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl sm:text-3xl font-bold focus:outline-none transition-colors duration-150"
                        aria-label="Close"
                    >
                        <span className="sr-only">Close</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    {/* Title */}
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500 mb-6 sm:mb-8 text-center drop-shadow-lg tracking-tight">
                        My Watchlist
                    </h2>

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-400 text-base sm:text-lg">Loading watchlist...</p>
                        </div>
                    )}
                    {error && (
                        <div className="flex flex-col items-center justify-center py-6">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 mb-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-500 text-base sm:text-lg text-center">{error}</p>
                        </div>
                    )}

                    {!loading && !error && watchlist.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <svg className="w-10 h-10 sm:w-14 sm:h-14 text-gray-600 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                                <circle cx="12" cy="12" r="9" />
                            </svg>
                            <p className="text-gray-400 text-base sm:text-lg text-center">Your watchlist is empty.<br />Add some stocks to get started!</p>
                        </div>
                    )}

                    {!loading && !error && watchlist.length > 0 && (
                        <ul className="space-y-3 sm:space-y-4">
                            {watchlist.map(item => (
                                <li
                                    key={item.id}
                                    className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-gray-800/80 to-gray-900/80 p-3 sm:p-4 rounded-xl border border-gray-700/70 shadow-md hover:shadow-lg transition-shadow duration-200 group"
                                >
                                    <button
                                        onClick={() => onStockSelect(item.symbol)}
                                        className="flex items-center gap-2 text-xl sm:text-2xl font-semibold text-green-400 hover:text-green-200 transition-colors focus:outline-none"
                                        title={`View ${item.symbol}`}
                                    >
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400 group-hover:text-green-300 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                                        </svg>
                                        {item.symbol}
                                    </button>
                                    <button
                                        onClick={() => removeStock(item.symbol)}
                                        className="mt-2 sm:mt-0 ml-0 sm:ml-4 px-3 py-1 rounded-md text-xs sm:text-sm font-semibold bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow focus:outline-none focus:ring-2 focus:ring-red-400 transition-all flex items-center gap-1"
                                        title={`Remove ${item.symbol}`}
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WatchlistDisplay;