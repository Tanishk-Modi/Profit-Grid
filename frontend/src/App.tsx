import { useState, useEffect } from 'react';
import StockAnalyzer from './components/StockAnalyzer';
import Login from './auth/Login';
import Register from './auth/Register';

interface UserState {
  token: string | null;
  userId: number | null;
  username: string | null;
}

type AppView = 'Login' | 'Register' | 'Analyzer'; 

function App() {
  const [user, setUser] = useState<UserState>({ token: null, userId: null, username: null });
  const [currentView, setCurrentView] = useState<AppView>('Analyzer');

  // Effect to check for stored token on initial load
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
    setCurrentView('Analyzer'); // Stay on analyzer, but user is logged out
  };

  const handleRegisterSuccess = () => {
    setCurrentView('Login'); // After successful registration, direct to login
  };

  // --- Function to explicitly switch to Login/Register view ---
  const handleShowAuth = (view: 'Login' | 'Register') => {
    setCurrentView(view);
  };

  const renderContent = () => {
    if (currentView === 'Analyzer') {
      return (
        <div className="relative w-full">
            {/* Main Header - Always visible regardless of login state */}
            <header className="fixed top-0 left-0 right-0 z-20 bg-gray-900 p-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center space-x-3">
                  <img 
                      src="/public/stocklogo.png" 
                      alt="My Image" 
                      className="h-10 w-16 object-contain"
                  />
                  <span className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
                      Profit Grid
                  </span>
              </div>
                <div className="flex items-center space-x-4">
                    {/* Conditionally show Welcome/Logout or Login/Register buttons in header */}
                    {user.token && user.username ? (
                        <>
                            <span className="text-gray-300">Welcome, {user.username}!</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-md font-semibold text-sm
                                         bg-gradient-to-r from-red-500 to-rose-600
                                         hover:from-red-600 hover:to-rose-700
                                         transition-all duration-300 ease-in-out
                                         focus:outline-none focus:ring-2 focus:ring-rose-400"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        // Show Login/Register buttons if not logged in
                        <>
                            <button
                              onClick={() => handleShowAuth('Login')}
                              className="px-4 py-2 rounded-md font-semibold text-sm
                                      bg-gradient-to-r from-teal-500 to-green-600
                                      hover:from-teal-600 hover:to-green-700
                                      shadow-md hover:shadow-lg
                                      hover:scale-[1.02]
                                      transition-all duration-200 ease-in-out
                                      focus:outline-none focus:ring-2 focus:ring-green-400"
                          >
                              Login
                          </button>
                          <button
                              onClick={() => handleShowAuth('Register')}
                              className="px-4 py-2 rounded-md font-semibold text-sm
                                      bg-gradient-to-r from-blue-500 to-indigo-600
                                      hover:from-blue-600 hover:to-indigo-700
                                      shadow-md hover:shadow-lg
                                      hover:scale-[1.02]
                                      transition-all duration-200 ease-in-out
                                      focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                              Register
                          </button>
                        </>
                    )}
                </div>
            </header>
            <div className="pt-16"> 
                {/* Always render StockAnalyzer, passing user info (which might be null) */}
                <StockAnalyzer authToken={user.token} currentUserId={user.userId} />
            </div>
        </div>
      );
    } else if (currentView === 'Register') {
      return (
        // Wrapper for Register component to center it
        <div className="min-h-screen flex items-center justify-center">
          <Register onSuccess={handleRegisterSuccess} onSwitchToLogin={() => setCurrentView('Login')} />
        </div>
      );
    } else { // currentView === 'Login'
      return (
        // Wrapper for Login component to center it
        <div className="min-h-screen flex items-center justify-center">
          <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setCurrentView('Register')} />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black font-sans antialiased">
      {renderContent()}
    </div>
  );
}

export default App;
