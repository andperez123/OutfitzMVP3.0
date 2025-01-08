import React from 'react';
import { auth } from '../firebase-config';
import { useProfile } from '../hooks/useProfile';
import './AuthHeader.css';

const AuthHeader = () => {
    const {
        user,
        handleGoogleSignIn
    } = useProfile();

    return (
        <div className="auth-header">
            {user ? (
                <div className="user-profile">
                    <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="profile-image"
                    />
                    <div className="user-info">
                        <span className="user-name">{user.displayName}</span>
                        <button 
                            className="logout-button"
                            onClick={() => auth.signOut()}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    className="login-button"
                    onClick={handleGoogleSignIn}
                >
                    <img 
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                        alt="Google" 
                        className="google-icon"
                    />
                    Sign in with Google
                </button>
            )}
        </div>
    );
};

export default AuthHeader;