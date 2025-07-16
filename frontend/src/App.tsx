import { useState, useEffect } from 'react';
import StockAnalyzer from './components/StockAnalyzer';
import Login from './auth/Login';
import Register from './auth/Register';
import WatchlistDisplay from './components/WatchlistDisplay';
import TickerTape from './components/TickerTape'; 
import CryptoAnalyzer from './components/CryptoAnalyzer'; // Import the new component
import { Analytics } from "@vercel/analytics/next";

interface UserState {
  token: string | null;
  userId: number | null;
  username: string | null;
}

type AppView = 'Login' | 'Register' | 'Analyzer' | 'Watchlist' | 'Crypto'; // Added 'Crypto' view

function App() {
  const [user, setUser] = useState<UserState>({ token: null, userId: null, username: null });
  const [currentView, setCurrentView] = useState<AppView>('Analyzer');
  const [symbolToLoad, setSymbolToLoad] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('authUserId');
    const storedUsername = localStorage.getItem('authUsername');

    if (storedToken && storedUserId && storedUsername) {
      setUser({
        token: storedToken,
        userId: parseInt(storedUserId),
        username: storedUsername,
      });
      setCurrentView('Analyzer');
    } else {
      setCurrentView('Analyzer');
    }
  }, []); 

  const handleLoginSuccess = (token: string, userId: number, username: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUserId', userId.toString());
    localStorage.setItem('authUsername', username);
    setUser({ token, userId, username });
    setCurrentView('Analyzer'); 
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUserId');
    localStorage.removeItem('authUsername');
    setUser({ token: null, userId: null, username: null });
    setCurrentView('Analyzer'); 
    setSymbolToLoad(null);
  };

  const handleRegisterSuccess = () => {
    setCurrentView('Login'); 
  };

  const handleBackToHome = () => { // New function to go back to home
    setCurrentView('Analyzer');
  };

  const handleShowAuth = (view: 'Login') => { // Only 'Login' now
    setCurrentView(view);
  };

  const handleShowWatchlist = () => {
    if (user.token && user.userId) { 
      setCurrentView('Watchlist');
    } else {
      setCurrentView('Login');
    }
  };

   const handleWatchlistStockSelect = (symbol: string) => {
    setSymbolToLoad(symbol); 
    setCurrentView('Analyzer'); 
  };

  const renderContent = () => {
    if (currentView === 'Analyzer') {
      return (
        <div className="relative w-full">
            {/* Main Header */}
            <header className="fixed top-0 left-0 right-0 z-20 bg-gray-900 p-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center space-x-3">
                  <img 
                      src="stocklogo.png" 
                      alt="My Image" 
                      className="h-10 w-16 object-contain"
                  />
                  <span className="text-xl md:text-2xl hidden sm:inline font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
                      Profit Grid
                  </span>
              </div>
              <div className="flex items-center space-x-4">
                  {/* Crypto button moved outside conditional rendering */}
                  <button
                      onClick={() => setCurrentView('Crypto')}
                      className="px-4 py-2 rounded-full font-semibold text-sm
                                bg-gradient-to-r from-orange-500 to-red-600
                                hover:from-orange-600 hover:to-red-700
                                shadow-md hover:shadow-lg
                                hover:scale-[1.02]
                                transition-all duration-200 ease-in-out
                                focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                      Crypto
                  </button>
                  {user.token && user.username ? (
                      <>
                        <span className="hidden sm:inline text-gray-300">Welcome, {user.username}!</span>
                        <button
                            onClick={handleShowWatchlist}
                            className="px-4 py-2 rounded-full font-semibold text-sm
                                    bg-gradient-to-r from-blue-500 to-indigo-600
                                    hover:from-blue-600 hover:to-indigo-700
                                    transition-all duration-300 ease-in-out
                                    focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            My Watchlist
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-full font-semibold text-sm
                                    bg-gradient-to-r from-red-500 to-orange-600
                                    hover:from-red-600 hover:to-orange-700
                                    transition-all duration-300 ease-in-out
                                    focus:outline-none focus:ring-2 focus:ring-orange-400"
                        >
                            Logout
                        </button>
                    </>
                  ) : (
                      <>
                        <button
                            onClick={() => handleShowAuth('Login')}
                            className="px-4 py-2 rounded-full font-semibold text-sm
                                    bg-gradient-to-r from-teal-500 to-green-600
                                    hover:from-teal-600 hover:to-green-700
                                    shadow-md hover:shadow-lg
                                    hover:scale-[1.02]
                                    transition-all duration-200 ease-in-out
                                    focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                            Login
                        </button>
                    </>
                  )}
              </div>
            </header>
            {/* TradingView Ticker Tape Widget */}
            <div className="relative top-[68px] z-10 w-full"> 
                <TickerTape />
            </div>
            <div className="pt-[35px]"> 
                <StockAnalyzer
                    authToken={user.token}
                    currentUserId={user.userId}
                    initialSymbol={symbolToLoad} 
                />
            </div>
            
            <footer className="rounded-lg shadow-sm bg-[#080d1a] mt-8"> 
                <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <a href="" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                            <img src="stocklogo.png" className="h-8" alt="Logo" />
                            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Profit Grid</span>
                        </a>
                        <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
                            <li>
                                <a href="https://github.com/Tanishk-Modi/Profit-Grid" className="hover:underline me-4 md:me-6">About</a>
                            </li>
                            <li>
                                <a href="https://www.linkedin.com/in/tanishk-modi/" className="hover:underline">Contact</a>
                            </li>
                        </ul>
                    </div>
                    <hr className="my-4 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-6" />
                    <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2025 <a href="" className="hover:underline">Profit Grid™</a>. All Rights Reserved.</span>
                </div>
            </footer>

        </div>
      );
    } else if (currentView === 'Register') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Register onSuccess={handleRegisterSuccess} onSwitchToLogin={() => setCurrentView('Login')} onBackToHome={handleBackToHome} />
        </div>
      );
    } else if (currentView == 'Login'){ 
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setCurrentView('Register')} onBackToHome={handleBackToHome} />
        </div>
      );
    } else if (currentView === 'Crypto') { // New Crypto view
        return (
            <div className="relative w-full">
                {/* Header for Crypto page */}
                <header className="fixed top-0 left-0 right-0 z-20 bg-gray-900 p-4 flex justify-between items-center shadow-lg">
                    <div className="flex items-center space-x-3">
                        <img 
                            src="stocklogo.png" 
                            alt="My Image" 
                            className="h-10 w-16 object-contain"
                        />
                        <span className="text-xl md:text-2xl hidden sm:inline font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                            Crypto Grid
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBackToHome}
                            className="px-4 py-2 rounded-full font-semibold text-sm
                                    bg-gradient-to-r from-blue-500 to-blue-600
                                    hover:from-blue-600 hover:to-blue-700
                                    shadow-md hover:shadow-lg
                                    hover:scale-[1.02]
                                    transition-all duration-200 ease-in-out
                                    focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            Back to Stocks
                        </button>
                        {user.token && user.username ? (
                            <>
                                <span className="hidden sm:inline text-gray-300">Welcome, {user.username}!</span>
                                <button
                                    onClick={handleShowWatchlist}
                                    className="px-4 py-2 rounded-full font-semibold text-sm
                                            bg-gradient-to-r from-blue-500 to-indigo-600
                                            hover:from-blue-600 hover:to-indigo-700
                                            transition-all duration-300 ease-in-out
                                            focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    My Watchlist
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-full font-semibold text-sm
                                            bg-gradient-to-r from-red-500 to-orange-600
                                            hover:from-red-600 hover:to-orange-700
                                            transition-all duration-300 ease-in-out
                                            focus:outline-none focus:ring-2 focus:ring-orange-400"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => handleShowAuth('Login')}
                                className="px-4 py-2 rounded-full font-semibold text-sm
                                        bg-gradient-to-r from-teal-500 to-green-600
                                        hover:from-teal-600 hover:to-green-700
                                        shadow-md hover:shadow-lg
                                        hover:scale-[1.02]
                                        transition-all duration-200 ease-in-out
                                        focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </header>
                {/* TradingView Ticker Tape Widget */}
                <div className="relative top-[68px] pb-0">
                    {/* Reduce padding for ticker tape in crypto view */}
                    <div className="w-full">
                        <TickerTape />
                    </div>
                </div>
                <div className="pt-[38px]">
                    <CryptoAnalyzer />
                </div>
            </div>
        );
    }
    else { // currentView === 'Watchlist'
      return (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                <WatchlistDisplay
                    authToken={user.token!} 
                    currentUserId={user.userId!} 
                    onClose={() => setCurrentView('Analyzer')}
                    onStockSelect={handleWatchlistStockSelect}
                />
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black font-sans antialiased">
      {renderContent()}
      <Analytics />
    </div>
  );
}

export default App;