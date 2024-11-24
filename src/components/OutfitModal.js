import React from 'react';
import './OutfitModal.css'; // You'll need to move relevant styles here

const OutfitModal = ({ generatedOutfit, handleCloseModal }) => {
    return (
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
            </div>
        </div>
    );
};

export default OutfitModal;