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
            const prompt = `You are a highly creative personal stylist and AI specializing in crafting relatable, modern, and cohesive outfits tailored to user input. Your goal is to generate outfit recommendations that not only describe the clothing but also place the wearer in a casual and engaging setting, making it easy for them to imagine themselves wearing the outfit.

The user's input includes:
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

Using this information, generate an outfit description that includes:
1. Title: A creative name that reflects the vibe and mood of the outfit
2. Top: A detailed description of the main top piece
3. Short Top Description: A concise, shopping-friendly description
4. Bottom: A detailed description of the main bottom piece
5. Short Bottom Description: A concise, shopping-friendly description
6. Shoes: A detailed description of the shoes
7. Short Shoes Description: A concise, shopping-friendly description
8. Accessory: A description of an accessory that enhances the outfit
9. Short Accessory Description: A concise, shopping-friendly description
10. Image Description: A clear, vivid scene where the outfit is worn

Key Focus:
• Create a casual and relatable setting tailored to the user's preferences
• Ensure the descriptions feel personal, as if the outfit was designed specifically for them
• Make the visual scene engaging and lifestyle-focused`;

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