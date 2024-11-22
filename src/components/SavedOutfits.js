import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config';
import './SavedOutfits.css';

const SavedOutfits = ({ user, onClose }) => {
    const [savedOutfits, setSavedOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOutfit, setSelectedOutfit] = useState(null);

    useEffect(() => {
        const fetchSavedOutfits = async () => {
            try {
                const q = query(
                    collection(db, 'savedOutfits'),
                    where('userId', '==', user.uid)
                );
                const querySnapshot = await getDocs(q);
                const outfits = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log('Fetched outfits:', outfits);
                setSavedOutfits(outfits);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching saved outfits:', err);
                setError('Failed to load saved outfits');
                setLoading(false);
            }
        };

        if (user) {
            fetchSavedOutfits();
        }
    }, [user]);

    return (
        <div className="saved-outfits-modal">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>×</button>
                <h2 className="saved-outfits-title">My Outfit Collection</h2>
                
                {loading && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your outfits...</p>
                    </div>
                )}
                
                {error && <div className="error-message">{error}</div>}
                
                {!loading && !error && savedOutfits.length === 0 && (
                    <div className="empty-state">
                        <span className="empty-icon">👕</span>
                        <p>Your wardrobe is empty! Generate and save some outfits to see them here.</p>
                    </div>
                )}

                <div className="outfits-grid">
                    {savedOutfits.map((outfit) => (
                        <div 
                            key={outfit.id} 
                            className="outfit-card"
                            onClick={() => setSelectedOutfit(outfit)}
                        >
                            <div className="outfit-image-container">
                                {outfit.imageUrl ? (
                                    <img 
                                        src={outfit.imageUrl} 
                                        alt={outfit.title} 
                                        className="outfit-image"
                                        onError={(e) => {
                                            console.log('Image failed to load:', outfit.imageUrl);
                                            e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                                        }}
                                    />
                                ) : (
                                    <div className="no-image-placeholder">
                                        No Image Available
                                    </div>
                                )}
                            </div>
                            <h3 className="outfit-title">{outfit.title}</h3>
                        </div>
                    ))}
                </div>

                {/* Detailed view modal */}
                {selectedOutfit && (
                    <div className="outfit-detail-modal">
                        <div className="detail-content">
                            <button 
                                className="close-detail-button"
                                onClick={() => setSelectedOutfit(null)}
                            >
                                ×
                            </button>
                            <div className="detail-grid">
                                <div className="detail-image">
                                    <img 
                                        src={selectedOutfit.imageUrl} 
                                        alt={selectedOutfit.title} 
                                    />
                                </div>
                                <div className="detail-info">
                                    <h2>{selectedOutfit.title}</h2>
                                    <div className="outfit-specs">
                                        <div className="spec-item">
                                            <h4>Top</h4>
                                            <p>{selectedOutfit.components.top}</p>
                                        </div>
                                        <div className="spec-item">
                                            <h4>Bottom</h4>
                                            <p>{selectedOutfit.components.bottom}</p>
                                        </div>
                                        <div className="spec-item">
                                            <h4>Shoes</h4>
                                            <p>{selectedOutfit.components.shoes}</p>
                                        </div>
                                        <div className="spec-item">
                                            <h4>Accessory</h4>
                                            <p>{selectedOutfit.components.accessory}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedOutfits;