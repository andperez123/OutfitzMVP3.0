const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY; // Ensure your API key is stored in .env

// Function to generate outfit data from OpenAI's GPT model
export const fetchOutfitData = async (prompt) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error Response:", errorData);
            throw new Error('Failed to fetch outfit data from OpenAI');
        }

        const data = await response.json();
        console.log("Raw API Response:", data);
        console.log("Message Content:", data.choices[0].message.content);

        const message = data.choices[0].message.content;
        const components = parseDescription(message);
        
        // Debug logs
        console.log("Parsed Components:", components);
        console.log("Image Description:", components.imageDescription);

        // Create DALL-E prompt
        let dallePrompt = "";
        
        if (components.imageDescription) {
            dallePrompt = `Create a photorealistic image of ${components.imageDescription}`;
            dallePrompt += ` The image should be high quality, photorealistic, and well-lit.`;
        } else {
            console.error("No image description found in components");
            dallePrompt = "Failed to generate image description";
        }

        console.log("Generated DALL-E Prompt:", dallePrompt);

        return {
            title: components.title || "Generated Outfit",
            description: message,
            dallePrompt,
            components
        };
    } catch (error) {
        console.error("Error in fetchOutfitData:", error);
        throw new Error('Failed to generate outfit data');
    }
};

// Function to generate an image using OpenAI's DALL-E model
export const generateImage = async (prompt) => {
    if (!prompt) {
        throw new Error('Empty prompt provided to DALL-E');
    }

    // Add API key check
    if (!process.env.REACT_APP_OPENAI_API_KEY) {
        console.error('OpenAI API key is missing');
        throw new Error('OpenAI API key is not configured');
    }

    try {
        console.log('Starting DALL-E image generation...');
        console.log('API Key present:', !!process.env.REACT_APP_OPENAI_API_KEY);

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                quality: "standard"
            })
        });

        // Log the response status
        console.log('DALL-E API Response Status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('DALL-E API Error Response:', errorData);
            throw new Error(`DALL-E API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('DALL-E API Success Response:', data);

        if (!data.data?.[0]?.url) {
            throw new Error('No image URL in DALL-E response');
        }

        return data.data[0].url;
    } catch (error) {
        console.error('Image generation error details:', error);
        throw new Error('Failed to generate image: ' + error.message);
    }
};

// New function to parse the description
export const parseDescription = (description) => {
    const components = {
        title: '',
        top: '',
        shortTopDescription: '',
        bottom: '',
        shortBottomDescription: '',
        shoes: '',
        shortShoesDescription: '',
        accessory: '',
        shortAccessoryDescription: '',
        imageDescription: ''
    };

    try {
        const lines = description.split('\n').filter(line => line.trim());
        
        // First try to find the image description section as a whole
        const imageDescStart = description.indexOf('10. Image Description:');
        if (imageDescStart !== -1) {
            // Find the next number or end of text
            const nextSection = description.indexOf('11.', imageDescStart);
            const imageDesc = description.slice(
                imageDescStart + '10. Image Description:'.length,
                nextSection !== -1 ? nextSection : undefined
            ).trim();
            components.imageDescription = imageDesc;
        }

        // Parse other components as before
        lines.forEach(line => {
            const match = line.match(/^(\d+)\.\s*(.*?):\s*(.*)$/i);
            if (!match) return;

            const [, , type, content] = match;
            const cleanType = type.toLowerCase().trim();
            const cleanContent = content.trim().replace(/['"]/g, '');

            switch(cleanType) {
                case 'title':
                    components.title = cleanContent;
                    break;
                case 'top':
                    components.top = cleanContent;
                    break;
                case 'short top description':
                    components.shortTopDescription = cleanContent;
                    break;
                case 'bottom':
                    components.bottom = cleanContent;
                    break;
                case 'short bottom description':
                    components.shortBottomDescription = cleanContent;
                    break;
                case 'shoes':
                    components.shoes = cleanContent;
                    break;
                case 'short shoes description':
                    components.shortShoesDescription = cleanContent;
                    break;
                case 'accessory':
                    components.accessory = cleanContent;
                    break;
                case 'short accessory description':
                    components.shortAccessoryDescription = cleanContent;
                    break;
                default:
                    break;
            }
        });

        return components;
    } catch (error) {
        console.error('Error parsing description:', error);
        return components;
    }
};