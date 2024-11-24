import React from 'react';
import './PhysicalAttributes.css';

const PhysicalAttributes = ({
    bodyType,
    setBodyType,
    ethnicity,
    setEthnicity,
    height,
    setHeight,
    hairType,
    setHairType,
    user,
    onSaveProfile,
    isProfileSaved,
    handleGoogleSignIn
}) => {
    const hasAnyValue = bodyType || ethnicity || height || hairType;

    const handleSignInClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleGoogleSignIn();
    };

    const handleChange = (setter, value) => {
        setter(value);
    };

    if (isProfileSaved) {
        return null;
    }

    return (
        <div className="physical-attributes-section">
            <h2>Physical Attributes</h2>
            <div className="grid-wrapper">
                <div className="grid-row">
                    <div className="grid-item">
                        <h3>What's your body type?</h3>
                        <select 
                            onChange={(e) => handleChange(setBodyType, e.target.value)} 
                            value={bodyType || ""}
                        >
                            <option value="" disabled>Select an option</option>
                            <option value="slim">Slim</option>
                            <option value="athletic">Athletic</option>
                            <option value="average">Average</option>
                            <option value="curvy">Curvy</option>
                            <option value="plus-size">Plus Size</option>
                        </select>
                    </div>

                    <div className="grid-item">
                        <h3>What's your ethnicity?</h3>
                        <select 
                            onChange={(e) => handleChange(setEthnicity, e.target.value)} 
                            value={ethnicity || ""}
                        >
                            <option value="" disabled>Select an option</option>
                            <option value="asian">Asian</option>
                            <option value="black">Black</option>
                            <option value="hispanic">Hispanic</option>
                            <option value="white">White</option>
                            <option value="middle-eastern">Middle Eastern</option>
                            <option value="mixed">Mixed</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="grid-row">
                    <div className="grid-item">
                        <h3>What's your height?</h3>
                        <select 
                            onChange={(e) => handleChange(setHeight, e.target.value)} 
                            value={height || ""}
                        >
                            <option value="" disabled>Select an option</option>
                            <option value="petite">Petite (Under 5'3")</option>
                            <option value="average">Average (5'4" - 5'7")</option>
                            <option value="tall">Tall (5'8" - 5'11")</option>
                            <option value="very-tall">Very Tall (6'0" and above)</option>
                        </select>
                    </div>

                    <div className="grid-item">
                        <h3>What's your hair type?</h3>
                        <select 
                            onChange={(e) => handleChange(setHairType, e.target.value)} 
                            value={hairType || ""}
                        >
                            <option value="" disabled>Select an option</option>
                            <option value="straight">Straight</option>
                            <option value="wavy">Wavy</option>
                            <option value="curly">Curly</option>
                            <option value="coily">Coily</option>
                            <option value="bald">Bald</option>
                        </select>
                    </div>
                </div>
            </div>

            {hasAnyValue && !user && (
                <button 
                    type="button"
                    className="google-signin-button"
                    onClick={handleSignInClick}
                >
                    Sign in to Save Profile
                </button>
            )}
        </div>
    );
};

export default PhysicalAttributes;