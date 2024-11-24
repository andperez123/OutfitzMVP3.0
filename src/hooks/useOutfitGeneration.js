import { useState } from 'react';
import { generateImage, fetchOutfitData, parseDescription } from '../utils/gptWrapper';

export const useOutfitGeneration = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedOutfit, setGeneratedOutfit] = useState(null);
    const [isOutfitVisible, setIsOutfitVisible] = useState(false);

    const handleSubmit = async (formData) => {
        const {
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
        } = formData;

        if (!gender) {
            setError("Please select a gender");
            return;
        }

        setIsLoading(true);
        setError(null);
        setIsOutfitVisible(false);

        try {
            const prompt = `You are a personal stylist creating a modern, cohesive outfit. Keep descriptions brief and focused.

User Details:
• Gender: ${gender || "Not specified"}
• Ethnicity: ${ethnicity || "Not specified"}
• Body Type: ${bodyType || "Not specified"}
• Hair Type: ${hairType || "Not specified"}
• Height: ${height || "Not specified"}
• Vibe: ${vibe || "Not specified"}
• Comfort Level: ${comfortLevel || "Not specified"}
• Adventurous: ${adventurous || "Not specified"}
• Focus: ${focus || "Not specified"}
• Additional Description: ${userInput || "None"}

Generate a concise outfit description with:
1. Title: A brief, creative name for the outfit
2. Top: A short description of the top piece (1 sentence)
3. Short Top Description: A very brief, shopping-friendly description (5-7 words)
4. Bottom: A short description of the bottom piece (1 sentence)
5. Short Bottom Description: A very brief, shopping-friendly description (5-7 words)
6. Shoes: A short description of the footwear (1 sentence)
7. Short Shoes Description: A very brief, shopping-friendly description (5-7 words)
8. Accessory: A short description of one accessory (1 sentence)
9. Short Accessory Description: A very brief, shopping-friendly description (5-7 words)
10. Image Description: Create a casual, lifestyle scene (3-4 sentences):
    - Describe a person wearing the outfit in a natural setting
    - Include relevant background details (coffee shop, park, etc.)
    - Focus on how the outfit works with the environment
    - Keep the style casual and relatable

Keep descriptions concise and focus on creating a cohesive, practical outfit that matches the user's preferences.`;

            console.log("Prompt being sent to API:", prompt);
            
            console.log("1. Starting API call...");
            const outfitData = await fetchOutfitData(prompt);
            console.log("2. API Response received:", outfitData);
            
            const dallePrompt = outfitData.dallePrompt;
            console.log("3. DALL-E Prompt:", dallePrompt);

            const outfitComponents = parseDescription(outfitData.description);
            console.log("4. Parsed Components:", outfitComponents);

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
                setGeneratedOutfit(prev => ({
                    ...prev,
                    imageUrl
                }));
            } catch (imageError) {
                console.error('Image generation failed:', imageError);
                setGeneratedOutfit(prev => ({
                    ...prev,
                    imageUrl: 'https://via.placeholder.com/1024x1024?text=Image+Generation+Failed'
                }));
                setError(`Failed to generate image: ${imageError.message}`);
            }

        } catch (error) {
            console.error("Error in handleSubmit:", error);
            setError(error.message || "Failed to generate outfit");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsOutfitVisible(false);
    };

    return {
        isLoading,
        error,
        generatedOutfit,
        isOutfitVisible,
        handleSubmit,
        handleCloseModal
    };
};