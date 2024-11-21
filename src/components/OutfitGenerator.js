import React, { useState, useEffect } from 'react';
import MaleQuestions from './MaleQuestions';
import FemaleQuestions from './FemaleQuestions';
import { generateImage, fetchOutfitData, parseDescription } from '../utils/gptWrapper';
import './OutfitGenerator.css';
import { auth, db } from '../firebase-config';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

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
                `You are a personal stylist helping the user build an outfit based on the following details:`,
                gender ? `- Gender: ${gender}` : '',
                vibe ? `- Vibe: ${vibe}` : '',
                comfortLevel ? `- Comfort Level: ${comfortLevel}` : '',
                adventurous ? `- Adventurous: ${adventurous}` : '',
                focus ? `- Focus: ${focus}` : '',
                userInput ? `- Additional Description: ${userInput}` : '',
                `\nProvide a response in EXACTLY this format (maintain the exact labels and structure):`,
                `Title: [Outfit Title]`,
                `Top: [Main piece description]`,
                `Short Top Description: [Brief, specific description for shopping]`,
                `Bottom: [Main piece description]`,
                `Short Bottom Description: [Brief, specific description for shopping]`,
                `Shoes: [Main piece description]`,
                `Short Shoes Description: [Brief, specific description for shopping]`,
                `Accessory: [Main piece description]`,
                `Short Accessory Description: [Brief, specific description for shopping]`,
                `Image Description: [A clear, concise description of the complete outfit for image generation. Include main pieces, colors, and how they work together.]`
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

    const handleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleSaveOutfit = async () => {
        if (!generatedOutfit) {
            alert('Please generate an outfit first!');
            return;
        }

        try {
            // If user is not logged in, prompt for Google sign-in
            if (!user) {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
            }

            // Save the outfit to Firestore
            const outfitData = {
                userId: auth.currentUser.uid,
                outfit: generatedOutfit, // The generated outfit
                preferences: {
                    gender,
                    vibe,
                    comfortLevel,
                    additionalDescription: userInput
                },
                createdAt: new Date(),
            };

            const docRef = await addDoc(collection(db, 'outfits'), outfitData);
            console.log('Outfit saved with ID:', docRef.id);
            alert('Outfit saved successfully! 🎉');
        } catch (error) {
            console.error('Error saving outfit:', error);
            alert('Failed to save outfit: ' + error.message);
        }
    };

    return (
        <div className="container">
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

                <button type="submit" className="generate-button" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Outfit'}
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

            <div style={{ marginTop: '20px' }}>
                {!user ? (
                    <button onClick={handleLogin}>Login with Google</button>
                ) : (
                    <div>
                        <p>Welcome, {user.email}!</p>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutfitGenerator;