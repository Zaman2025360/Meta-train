import React, { useState, useEffect } from 'react';
import Home from './Home';
import GameScene from './GameScene';
import SignIn from './SignIn';
import SignUp from './SignUp';
import AuthService from './services/AuthService';

const App = () => {
    const [currentPage, setCurrentPage] = useState('auth');
    const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
    const [user, setUser] = useState(null);
    const [signupSuccess, setSignupSuccess] = useState(false);

    // Check if user is already logged in on component mount
    useEffect(() => {
        const loggedInUser = AuthService.getCurrentUser();
        if (loggedInUser) {
            setUser(loggedInUser);
            setCurrentPage('home');
        }
    }, []);

    const handleSignIn = (userData) => {
        setUser(userData);
        setCurrentPage('home');
    };

    const handleSignUp = (userData) => {
        // Instead of directly logging in, show success message and redirect to signin
        setSignupSuccess(true);
        setAuthMode('signin');
    };

    const handleLogout = () => {
        AuthService.logoutUser();
        setUser(null);
        setCurrentPage('auth');
        setAuthMode('signin');
    };

    const handleStartExperience = () => {
        setCurrentPage('game');
    };

    const handleReturnHome = () => {
        setCurrentPage('home');
    };

    const navigateToSignIn = () => {
        setAuthMode('signin');
    };

    const navigateToSignUp = () => {
        setAuthMode('signup');
        // Clear signup success message when navigating to signup form
        setSignupSuccess(false);
    };

    return (
        <>
            {currentPage === 'auth' && authMode === 'signin' && (
                <SignIn
                    onSignIn={handleSignIn}
                    onNavigateToSignUp={navigateToSignUp}
                    signupSuccess={signupSuccess}
                />
            )}

            {currentPage === 'auth' && authMode === 'signup' && (
                <SignUp
                    onSignUp={handleSignUp}
                    onNavigateToSignIn={navigateToSignIn}
                />
            )}

            {currentPage === 'home' && (
                <Home
                    onStartExperience={handleStartExperience}
                    onLogout={handleLogout}
                    username={user?.username}
                />
            )}

            {currentPage === 'game' && (
                <GameScene onReturnHome={handleReturnHome} />
            )}
        </>
    );
};

export default App;