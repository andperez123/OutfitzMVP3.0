import React, { useState } from 'react';
import MaleQuestions from './MaleQuestions';
import FemaleQuestions from './FemaleQuestions';
import PhysicalAttributes from './PhysicalAttributes';
import OutfitModal from './OutfitModal';
import './OutfitGenerator.css';
import { auth} from '../firebase-config';
import { useProfile } from '../hooks/useProfile';
import { useOutfitGeneration } from '../hooks/useOutfitGeneration';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div>Something went wrong. Please try again.</div>;
        }

        return this.props.children;
    }
}

const OutfitGenerator = ({ onClose }) => {
    // Form state
    const [gender, setGender] = useState('');
    const [vibe, setVibe] = useState('');
    const [comfortLevel, setComfortLevel] = useState('');
    const [adventurous, setAdventurous] = useState('');
    const [focus, setFocus] = useState('');
    const [userInput, setUserInput] = useState('');

    // Get outfit generation functionality from hook
    const {
        isLoading,
        error,
        generatedOutfit,
        isOutfitVisible,
        handleSubmit: handleOutfitSubmit,
        handleCloseModal
    } = useOutfitGeneration();

    // Get profile functionality from hook
    const {
        user,
        bodyType,
        setBodyType,
        ethnicity,
        setEthnicity,
        height,
        setHeight,
        hairType,
        setHairType,
        isProfileSaved,
        handleGoogleSignIn,
        saveUserProfile
    } = useProfile();

    // Replace the old handleSubmit with this new one
    const onSubmit = (e) => {
        e.preventDefault();
        handleOutfitSubmit({
            gender,
            bodyType,
            ethnicity,
            height,
            hairType,
            vibe,
            comfortLevel,
            adventurous,
            focus,
            userInput
        });
    };

    return (
        <div className="outfit-generator">
            <button 
                className="close-button"
                onClick={onClose}
            >
                ×
            </button>
            <div className="google-sign-in">
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
            <div className="container">
                <div className="auth-container">
                    <div className="header">
                        <h1 className="title">Outfitz <span role="img" aria-label="sparkle">✨</span></h1>
                        <p className="subtitle">Enter your style for any occasion and generate an outfit.</p>
                    </div>

                <form onSubmit={onSubmit}>
                    <div className="gender-selection">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={gender === 'male'}
                                onChange={(e) => setGender(e.target.value)}
                            />
                            Male
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={gender === 'female'}
                                onChange={(e) => setGender(e.target.value)}
                            />
                            Female
                        </label>
                    </div>

                        {gender && (
                            <div className="questions-container animate-in">
                                <PhysicalAttributes
                                    bodyType={bodyType}
                                    setBodyType={setBodyType}
                                    ethnicity={ethnicity}
                                    setEthnicity={setEthnicity}
                                    height={height}
                                    setHeight={setHeight}
                                    hairType={hairType}
                                    setHairType={setHairType}
                                    user={user}
                                    onSaveProfile={saveUserProfile}
                                    isProfileSaved={isProfileSaved}
                                    handleGoogleSignIn={handleGoogleSignIn}
                                />

                                {/* Separator between sections */}
                                <div className="section-divider"></div>

                                {/* Style Questions Second */}
                                <div className="style-questions-section">
                                    <h2>Style Preferences</h2>
                                    {gender === 'male' && (
                                        <MaleQuestions 
                                            setVibe={setVibe}
                                            setComfortLevel={setComfortLevel}
                                            setAdventurous={setAdventurous}
                                            setFocus={setFocus}
                                        />
                                    )}
                                    {gender === 'female' && (
                                        <FemaleQuestions 
                                            setVibe={setVibe}
                                            setComfortLevel={setComfortLevel}
                                            setAdventurous={setAdventurous}
                                            setFocus={setFocus}
                                        />
                                    )}
                                </div>

                                {/* Rest of your content */}
                                <textarea
                                    className="textarea"
                                    placeholder="Describe the outfit you want"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                />

                                <button 
                                    type="submit" 
                                    className="generate-button" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Generating...' : 'Generate Outfit'}
                                </button>

                            </div>
                        )}
                    </form>

                    {error && <div className="alert">{error}</div>}

                    {isOutfitVisible && generatedOutfit && (
                        <ErrorBoundary>
                            <OutfitModal 
                                generatedOutfit={generatedOutfit}
                                handleCloseModal={handleCloseModal}
                                gender={gender}
                            />
                        </ErrorBoundary>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OutfitGenerator;