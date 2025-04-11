import React, { useState, useEffect } from 'react';
import AuthService from './services/AuthService';

export const SignIn = ({ onSignIn, onNavigateToSignUp, signupSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Clear success message after a few seconds
    useEffect(() => {
        let timer;
        if (signupSuccess) {
            timer = setTimeout(() => {
                // This would normally clear the success message in the parent component
                // but we're just hiding it in the UI after a delay
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [signupSuccess]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const user = await AuthService.loginUser(email, password);
            onSignIn(user);
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Sign In</h1>
                <p className="tagline">Welcome back to the Meta-Train-360</p>

                {signupSuccess && (
                    <div className="success-message">
                        Account created successfully! Please sign in.
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
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
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="auth-toggle">
                    Don't have an account?{' '}
                    <button className="text-button" onClick={onNavigateToSignUp}>
                        Sign Up
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
                
                .success-message {
                    background: rgba(25, 135, 84, 0.2);
                    color: #2ecc71;
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    animation: fadeInOut 5s forwards;
                }
                
                @keyframes fadeInOut {
                    0% { opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { opacity: 0; }
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

export default SignIn;