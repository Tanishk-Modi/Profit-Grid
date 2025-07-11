import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: (token: string, userId: number, username: string) => void; // Callback for successful login
  onSwitchToRegister: () => void; // Callback to switch to the registration form
  onBackToHome: () => void; // New callback to go back to home
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister, onBackToHome }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed.');
      }

      const data = await response.json();
      // Call the success callback, passing the token and user info
      onLoginSuccess(data.access_token, data.user_id, data.username);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500 mb-6">Login</h2>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label htmlFor="username" className="block text-gray-300 text-sm font-semibold mb-2 text-left">Username</label>
          <input
            type="text"
            id="username"
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-gray-300 text-sm font-semibold mb-2 text-left">Password</label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm text-left">{error}</p>}
        <button
          type="submit"
          className="w-full px-6 py-3 rounded-md font-semibold text-lg
                     bg-gradient-to-r from-teal-500 to-green-600
                     hover:from-teal-600 hover:to-green-700
                     transition-all duration-300 ease-in-out
                     shadow-md hover:shadow-lg transform hover:scale-105
                     focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75
                     disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Logging In...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-gray-400 text-sm">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-teal-400 hover:text-green-500 font-semibold focus:outline-none"
          disabled={loading}
        >
          Register here
        </button>
      </p>
      <button
        onClick={onBackToHome}
        className="mt-4 px-4 py-2 rounded-full font-semibold text-sm
                   bg-gray-700 text-gray-300 hover:bg-gray-600
                   transition-all duration-200 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-gray-500"
        disabled={loading}
      >
        Back to Home
      </button>
    </div>
  );
};

export default Login;
