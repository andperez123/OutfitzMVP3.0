import React, { useState, useEffect } from 'react';
import MaleQuestions from './MaleQuestions';
import FemaleQuestions from './FemaleQuestions';
import { generateImage, fetchOutfitData, parseDescription } from '../utils/gptWrapper';
import './OutfitGenerator.css';
import { auth, db } from '../firebase-config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import SavedOutfits from './SavedOutfits';

const OutfitGenerator = () => {
    const [gender, setGender] = useState('');
    const [vibe, setVibe] = useState('');
    const [comfortLevel, setComfortLevel] = useState('');
    const [adventurous, setAdventurous] = useState('');
    const [focus, setFocus] = useState('');
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedOutfit, setGeneratedOutfit] = useState(null);
    const [isOutfitVisible, setIsOutfitVisible] = useState(false);
    const [user, setUser] = useState(null);
    const [showSavedOutfits, setShowSavedOutfits] = useState(false);



    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            console.log('Current user:', user);
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!gender) {
            setError("Please select a gender");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setIsOutfitVisible(false);

        try {
            // Construct the prompt dynamically
            const promptParts = [
                `You are a highly creative personal stylist and AI specializing in crafting striking, modern, and cohesive outfits based on user input. Your task is to generate well-described outfits that are clear for modeling purposes and helpful for shopping recommendations.`,
                `Details provided by the user include:`,
                gender ? `- Gender: ${gender}` : '',
                vibe ? `- Vibe: ${vibe}` : '',
                comfortLevel ? `- Comfort Level: ${comfortLevel}` : '',
                adventurous ? `- Adventurous: ${adventurous}` : '',
                focus ? `- Focus: ${focus}` : '',
                userInput ? `- Additional Description: ${userInput}` : '',
                `\nProvide a response in EXACTLY this format (maintain the exact labels and structure):`,
                `Title: [A creative and stylish outfit name that reflects the overall vibe and mood of the ensemble. Examples: "Urban Explorer Chic" or "Elegant Autumn Stroll"]`,
                `Top: [A detailed description of the main top piece, including fabric, color, fit, and any defining features like patterns or necklines. Example: "A fitted white cotton blouse with a ruffled neckline and balloon sleeves."]`,
                `Short Top Description: [A brief, Amazon-search-friendly description. Example: "White cotton blouse with ruffled neckline"]`,
                `Bottom: [A detailed description of the main bottom piece, including style, fabric, fit, and color. Example: "High-waisted navy blue tailored trousers with a subtle pinstripe."]`,
                `Short Bottom Description: [A brief, Amazon-search-friendly description. Example: "Navy high-waisted pinstripe trousers"]`,
                `Shoes: [A detailed description of the shoes, focusing on type, color, and material. Example: "Black leather ankle boots with a chunky heel."]`,
                `Short Shoes Description: [A brief, Amazon-search-friendly description. Example: "Black leather chunky heel ankle boots"]`,
                `Accessory: [A detailed description of the accessory, including type, color, material, and how it complements the outfit. Example: "A silver statement necklace with intricate floral designs."]`,
                `Short Accessory Description: [A brief, Amazon-search-friendly description. Example: "Silver floral statement necklace"]`,
                `Image Description: [A clear, concise description of the complete outfit for image generation. Describe the colors, materials, and how the pieces come together to create a cohesive look. Example: "A crisp white blouse paired with navy pinstripe trousers, black leather ankle boots, and a silver statement necklace, creating a professional yet chic ensemble."]`
            ];

            const prompt = promptParts.filter(part => part).join('\n');
            console.log("Prompt being sent to API:", prompt);

            console.log("1. Starting API call...");
            const outfitData = await fetchOutfitData(prompt);
            console.log("2. API Response received:", outfitData);
            
            // Extract just the Image Description line from the response
            const description = outfitData.description;
            const imageDescriptionLine = description
                .split('\n')
                .find(line => line.startsWith('Image Description:'));
            const dallePrompt = imageDescriptionLine 
                ? imageDescriptionLine.replace('Image Description:', '').trim() 
                : '';
            
            console.log("3. DALL-E Prompt:", dallePrompt);

            const outfitComponents = parseDescription(outfitData.description);
            console.log("4. Parsed Components:", outfitComponents);

            // Show the outfit details first
            setGeneratedOutfit({
                title: outfitData.title || 'Custom Outfit',
                description: outfitData.description || 'No description provided',
                imagePrompt: dallePrompt,
                imageUrl: 'pending',
                components: outfitComponents
            });
            setIsOutfitVisible(true);

            console.log("5. Starting image generation...");
            try {
                const imageUrl = await generateImage(dallePrompt);
                console.log("6. Image URL received:", imageUrl);
                
                if (imageUrl) {
                    setGeneratedOutfit(prev => ({
                        ...prev,
                        imageUrl
                    }));
                } else {
                    console.error("No image URL received");
                    setError("Failed to generate image. Please try again.");
                }
            } catch (imageError) {
                console.error("7. Image generation error:", imageError);
                // Don't hide the outfit details if image fails
                setError("Image generation failed, but outfit details are available.");
            }

        } catch (err) {
            console.error("Main error:", err);
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Add cleanup when modal closes
    const handleCloseModal = () => {
        setIsOutfitVisible(false);
        if (generatedOutfit?.imageUrl === 'pending') {
            setGeneratedOutfit(null);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            console.log('Successfully signed in:', result.user);
            return result.user;
        } catch (error) {
            console.error('Error signing in with Google:', error);
            setError('Failed to sign in with Google');
            return null;
        }
    };

    const handleSaveOutfit = async () => {
        try {
            setIsLoading(true);
            console.log('Starting save process...');
            
            if (!user) {
                console.log('No user, attempting sign in...');
                const signedInUser = await handleGoogleSignIn();
                if (!signedInUser) {
                    throw new Error('Please sign in to save outfits');
                }
            }

            if (!generatedOutfit) {
                throw new Error('No outfit to save');
            }

            // Create a prompt for the image generation
            const imagePrompt = `Fashion outfit consisting of: ${generatedOutfit.components.top}, ${generatedOutfit.components.bottom}, ${generatedOutfit.components.shoes}, and ${generatedOutfit.components.accessory}. Professional fashion photography style.`;

            // Generate image using DALL-E
            const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    prompt: imagePrompt,
                    n: 1,
                    size: "512x512",
                    response_format: "url"
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }

            const imageData = await response.json();
            const imageUrl = imageData.data[0].url;

            // Prepare the outfit data with the image URL
            const outfitData = {
                userId: user.uid,
                title: generatedOutfit.title,
                components: {
                    top: generatedOutfit.components.top,
                    bottom: generatedOutfit.components.bottom,
                    shoes: generatedOutfit.components.shoes,
                    accessory: generatedOutfit.components.accessory
                },
                imageUrl: imageUrl, // Add the generated image URL
                createdAt: new Date().toISOString()
            };

            console.log('Saving outfit data:', outfitData);

            // Save to Firebase
            const docRef = await addDoc(collection(db, 'savedOutfits'), outfitData);
            console.log('Outfit saved with ID:', docRef.id);
            
            // Show success message
            alert('Outfit saved successfully! 🎉');
            
        } catch (error) {
            console.error("Error saving outfit:", error);
            setError(error.message || "Failed to save outfit");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="auth-container">
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

            <div className="header">
                <h1 className="title">Outfitz <span className="logo">🛍️</span></h1>
                <p className="subtitle">Enter your style for any occasion and generate an outfit.</p>
            </div>

            <form onSubmit={handleSubmit}>
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

                <button 
                    type="button"
                    className="view-saved-button"
                    onClick={() => setShowSavedOutfits(true)}
                    style={{
                        marginTop: '1rem',
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100%'
                    }}
                >
                    View Saved Outfits
                </button>
            </form>

            {error && <div className="alert">{error}</div>}

            {isOutfitVisible && generatedOutfit && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button 
                            className="close-button" 
                            onClick={handleCloseModal}
                        >
                            ×
                        </button>
                        
                        <h3 className="outfit-title">{generatedOutfit.title}</h3>
                        
                        {generatedOutfit.imageUrl === 'pending' ? (
                            <div className="image-loading">
                                Generating your outfit image...
                            </div>
                        ) : (
                            <img 
                                src={generatedOutfit.imageUrl} 
                                alt="Generated Outfit" 
                                className="modal-image"
                            />
                        )}
                        
                        <div className="outfit-section">
                            <div className="outfit-item">
                                <h4>Top</h4>
                                <p>{generatedOutfit.components.top}</p>
                                <button className="shop-button">
                                    {generatedOutfit.components.shortTopDescription}
                                </button>
                            </div>

                            <div className="outfit-item">
                                <h4>Bottom</h4>
                                <p>{generatedOutfit.components.bottom}</p>
                                <button className="shop-button">
                                    {generatedOutfit.components.shortBottomDescription}
                                </button>
                            </div>

                            <div className="outfit-item">
                                <h4>Shoes</h4>
                                <p>{generatedOutfit.components.shoes}</p>
                                <button className="shop-button">
                                    {generatedOutfit.components.shortShoesDescription}
                                </button>
                            </div>

                            <div className="outfit-item">
                                <h4>Accessory</h4>
                                <p>{generatedOutfit.components.accessory}</p>
                                <button className="shop-button">
                                    {generatedOutfit.components.shortAccessoryDescription}
                                </button>
                            </div>
                        </div>

                        <button
                            className="save-button"
                            onClick={handleSaveOutfit}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : user ? 'Save Outfit' : 'Sign in to Save'}
                        </button>
                    </div>
                </div>
            )}

            {showSavedOutfits && (
                <SavedOutfits 
                    user={user} 
                    onClose={() => setShowSavedOutfits(false)}
                />
            )}
        </div>
    );
};

export default OutfitGenerator;