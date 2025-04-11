import React, { useState } from 'react';
import AuthService from './services/AuthService';

export const SignUp = ({ onSignUp, onNavigateToSignIn }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {

            // Register the user but don't automatically log them in
            await AuthService.registerUser({
                username,
                email,
                password
            });

            // Notify parent component that signup was successful
            // This will redirect to sign in page
            onSignUp();

        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Sign Up</h1>
                <p className="tagline">Join Meta-Train-360 First Steps</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose a username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="auth-toggle">
                    Already have an account?{' '}
                    <button className="text-button" onClick={onNavigateToSignIn}>
                        Sign In
                    </button>
                </p>
            </div>

            <style jsx>{`
                .auth-container {
                    width: 100%;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(to bottom, #1a1a2e, #16213e);
                    color: white;
                    font-family: Arial, sans-serif;
                }
                
                .auth-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 30px;
                    width: 100%;
                    max-width: 450px;
                    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.3);
                }
                
                h1 {
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                    color: #4cc9f0;
                    text-align: center;
                }
                
                .tagline {
                    text-align: center;
                    margin-bottom: 25px;
                    opacity: 0.8;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                }
                
                input {
                    width: 100%;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 16px;
                }
                
                input::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .auth-button {
                    width: 100%;
                    background: #4361ee;
                    color: white;
                    border: none;
                    padding: 14px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 10px;
                }
                
                .auth-button:hover {
                    background: #3a56d4;
                    box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
                }
                
                .auth-button:disabled {
                    background: #2d3a89;
                    cursor: not-allowed;
                }
                
                .error-message {
                    background: rgba(220, 53, 69, 0.2);
                    color: #ff6b6b;
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                
                .auth-toggle {
                    margin-top: 20px;
                    text-align: center;
                }
                
                .text-button {
                    background: none;
                    border: none;
                    color: #4cc9f0;
                    cursor: pointer;
                    font-size: 16px;
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};

export default SignUp;