import React, { useState } from 'react';

interface RegisterProps {
  onSuccess: () => void; // Callback to handle successful registration
  onSwitchToLogin: () => void; // Callback to switch to login form
  onBackToHome: () => void; // New callback to go back to home
}

const Register: React.FC<RegisterProps> = ({ onSuccess, onSwitchToLogin, onBackToHome }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // --- Client-side validation checks ---
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setLoading(false);
        return;
    }
    if (username.length < 3) {
        setError("Username must be at least 3 characters long.");
        setLoading(false);
        return;
    }
    // --- End Client-side validation ---

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed.');
      }

      setSuccessMessage("Registration successful! Please log in.");
      // Clear form fields
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      // Call onSuccess after a small delay for user to see success message
      setTimeout(onSuccess, 2000);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8
                 w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-10
                 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
      <h2 className="text-3xl p-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500 mb-6">Register</h2>
      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <div>
          <label htmlFor="username" className="block text-gray-300 text-sm font-semibold mb-2 text-left">Username</label>
          <input
            type="text"
            id="username"
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Choose a username"
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-gray-300 text-sm font-semibold mb-2 text-left">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm text-left">{error}</p>}
        {successMessage && <p className="text-green-500 text-sm text-left">{successMessage}</p>}
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-gray-400 text-sm">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-teal-400 hover:text-green-500 font-semibold focus:outline-none"
          disabled={loading}
        >
          Log In
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

export default Register;