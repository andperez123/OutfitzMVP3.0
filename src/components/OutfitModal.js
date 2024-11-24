import React from 'react';
import './OutfitModal.css';

const OutfitModal = ({ generatedOutfit, handleCloseModal, gender }) => {
    const handleAmazonSearch = (searchQuery) => {
        const baseUrl = 'https://www.amazon.com/s';
        const genderPrefix = gender === 'male' ? "men's" : "women's";
        const formattedQuery = encodeURIComponent(`${genderPrefix} ${searchQuery}`);
        const searchUrl = `${baseUrl}?k=${formattedQuery}`;
        
        try {
            window.open(searchUrl, '_blank');
        } catch (error) {
            console.error('Error opening window:', error);
        }
    };

    return (
        <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={handleCloseModal}>×</button>
                <h3 className="outfit-title">{generatedOutfit.title}</h3>
                
                {generatedOutfit.imageUrl === 'pending' ? (
                    <div className="image-loading">Generating your outfit image...</div>
                ) : (
                    <img src={generatedOutfit.imageUrl} alt="Generated Outfit" className="modal-image" />
                )}
                
                <div className="outfit-grid">
                    <div className="outfit-grid-item">
                        <h4>Top</h4>
                        <p>{generatedOutfit.components.top}</p>
                        <div className="short-desc">
                            <span>{generatedOutfit.components.shortTopDescription}</span>
                            <button 
                                className="shop-button"
                                onClick={() => handleAmazonSearch(generatedOutfit.components.shortTopDescription)}
                            >
                                Shop on Amazon
                            </button>
                        </div>
                    </div>
                    
                    <div className="outfit-grid-item">
                        <h4>Bottom</h4>
                        <p>{generatedOutfit.components.bottom}</p>
                        <div className="short-desc">
                            <span>{generatedOutfit.components.shortBottomDescription}</span>
                            <button 
                                className="shop-button"
                                onClick={() => handleAmazonSearch(generatedOutfit.components.shortBottomDescription)}
                            >
                                Shop on Amazon
                            </button>
                        </div>
                    </div>
                    
                    <div className="outfit-grid-item">
                        <h4>Shoes</h4>
                        <p>{generatedOutfit.components.shoes}</p>
                        <div className="short-desc">
                            <span>{generatedOutfit.components.shortShoesDescription}</span>
                            <button 
                                className="shop-button"
                                onClick={() => handleAmazonSearch(generatedOutfit.components.shortShoesDescription)}
                            >
                                Shop on Amazon
                            </button>
                        </div>
                    </div>
                    
                    <div className="outfit-grid-item">
                        <h4>Accessory</h4>
                        <p>{generatedOutfit.components.accessory}</p>
                        <div className="short-desc">
                            <span>{generatedOutfit.components.shortAccessoryDescription}</span>
                            <button 
                                className="shop-button"
                                onClick={() => handleAmazonSearch(generatedOutfit.components.shortAccessoryDescription)}
                            >
                                Shop on Amazon
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OutfitModal;