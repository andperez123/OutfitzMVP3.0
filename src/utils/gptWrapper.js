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
        const message = data.choices[0].message.content;

        // Parse the components including the image description
        const components = parseDescription(message);
        
        // Create a more detailed DALL-E prompt
        let dallePrompt = "Failed to generate image description";
        
        if (components.shortTopDescription && components.shortBottomDescription) {
            dallePrompt = `Create a photorealistic image of a slim asian male wearing a ${components.shortTopDescription} with ${components.shortBottomDescription}`;
            
            if (components.shortShoesDescription) {
                dallePrompt += `, ${components.shortShoesDescription}`;
            }
            
            if (components.shortAccessoryDescription) {
                dallePrompt += `, and ${components.shortAccessoryDescription}`;
            }

            // Add setting if available
            if (components.imageDescription) {
                dallePrompt += `. ${components.imageDescription}`;
            } else {
                dallePrompt += `. The person is standing in a warm, well-lit room decorated for Thanksgiving.`;
            }

            // Add style guidance
            dallePrompt += ` The image should be high quality, photorealistic, and well-lit.`;
        }

        console.log("Generated DALL-E Prompt:", dallePrompt); // Debug log

        return {
            title: components.title || "Generated Outfit",
            description: message,
            dallePrompt,
            components  // Include parsed components in the return
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

    try {
        console.log('DALL-E Prompt:', prompt); // Log the actual prompt

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                prompt: prompt,
                n: 1,
                size: "1024x1024"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('DALL-E API Error Response:', errorData);
            throw new Error(`DALL-E API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
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
        
        lines.forEach(line => {
            // Updated regex to better handle the numbered format
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
                case 'image description':
                    components.imageDescription = cleanContent;
                    break;
                default:
                    console.log(`Unhandled content type: ${cleanType}`);
                    break;
            }
        });

        return components;
    } catch (error) {
        console.error('Error parsing description:', error);
        return components;
    }
};