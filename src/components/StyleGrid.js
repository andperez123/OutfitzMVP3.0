import React, { useState } from 'react';
import './StyleGrid.css';
import { useOutfitGeneration } from '../hooks/useOutfitGeneration';
import { useProfile } from '../hooks/useProfile';
import { auth } from '../firebase-config';
import OutfitModal from './OutfitModal';
import ErrorBoundary from './ErrorBoundary';
import OutfitGenerator from './OutfitGenerator';

const StyleGrid = () => {
  const [gender, setGender] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [outfitDescription, setOutfitDescription] = useState('');
  const [showCustomizer, setShowCustomizer] = useState(false);

  const {
    user,
    handleGoogleSignIn
  } = useProfile();

  const {
    isLoading,
    error,
    generatedOutfit,
    isOutfitVisible,
    handleSubmit: handleOutfitSubmit,
    handleCloseModal
  } = useOutfitGeneration();

  const styles = [
    // Women Styles
    {
      id: 'w1',
      image: '/images/styles/WClassicPreppy.png',
      gender: 'female',
      style: 'Classic/Preppy',
      description: 'Timeless pieces like blazers, pencil skirts, striped shirts, and loafers. Neutral or pastel palettes with polished details.'
    },
    {
      id: 'w2',
      image: '/images/styles/WStreetwear.png',
      gender: 'female',
      style: 'Casual/Streetwear',
      description: 'Oversized hoodies, sneakers, distressed denim, graphic tees, and crossbody bags. Urban-inspired with bold colors and patterns.'
    },
    {
      id: 'w3',
      image: '/images/styles/WBoho.png',
      gender: 'female',
      style: 'Bohemian (Boho)',
      description: 'Flowing dresses, fringe details, earthy tones, floral prints, and natural fabrics. Accessories include layered necklaces and wide-brim hats.'
    },
    {
      id: 'w4',
      image: '/images/styles/WChicMinimalist.png',
      gender: 'female',
      style: 'Chic/Minimalist',
      description: 'Monochromatic outfits, tailored pieces, clean lines, and statement accessories. Neutral tones dominate.'
    },
    {
      id: 'w5',
      image: '/images/styles/WAthlesiure.png',
      gender: 'female',
      style: 'Athleisure',
      description: 'High-waisted leggings, crop tops, sneakers, and performance fabrics with a sporty yet casual vibe.'
    },
    {
      id: 'w6',
      image: '/images/styles/WGlamorous.png',
      gender: 'female',
      style: 'Glamorous',
      description: 'Sequins, bodycon dresses, heels, and bold makeup. Outfits scream luxury and are ideal for evening wear.'
    },
    {
      id: 'w7',
      image: '/images/styles/WEdgyRocky.png',
      gender: 'female',
      style: 'Edgy/Rock',
      description: 'Leather jackets, ripped jeans, combat boots, and band tees. Dark colors and metallic accents are key.'
    },
    {
      id: 'w8',
      image: '/images/styles/WVintageRetro.png',
      gender: 'female',
      style: 'Vintage/Retro',
      description: 'High-waisted skirts, polka dots, cat-eye sunglasses, and styles reminiscent of past decades (50s-90s).'
    },
    {
      id: 'w9',
      image: '/images/styles/WRomantic.png',
      gender: 'female',
      style: 'Romantic/Feminine',
      description: 'Flowy silhouettes, lace details, pastel colors, and floral patterns. Accessories include pearls and delicate jewelry.'
    },
    {
      id: 'w10',
      image: '/images/styles/WAvantGarde.png',
      gender: 'female',
      style: 'Avant-garde',
      description: 'Experimental shapes, asymmetry, bold patterns, and unconventional materials. Fashion-forward and artistic.'
    },

    // Men Styles
    {
      id: 'm1',
      image: '/images/styles/Mpreppy.png',
      gender: 'male',
      style: 'Classic/Preppy',
      description: 'Polo shirts, chinos, blazers, loafers, and clean lines. Inspired by Ivy League aesthetics.'
    },
    {
      id: 'm2',
      image: '/images/styles/Mstreetwear.png',
      gender: 'male',
      style: 'Casual/Streetwear',
      description: 'Hoodies, graphic tees, joggers, sneakers, and trendy caps. Relaxed and contemporary.'
    },
    {
      id: 'm3',
      image: '/images/styles/Mboho.png',
      gender: 'male',
      style: 'Bohemian (Boho)',
      description: 'Linen shirts, patterned scarves, ankle boots, and earthy tones. Flowy and laid-back.'
    },
    {
      id: 'm4',
      image: '/images/styles/Mminimal.png',
      gender: 'male',
      style: 'Minimalist',
      description: 'Neutral palettes, tailored fits, and timeless basics like plain tees and well-fitted jeans.'
    },
    {
      id: 'm5',
      image: '/images/styles/Mathleisure.png',
      gender: 'male',
      style: 'Athleisure',
      description: 'Track pants, hooded jackets, running shoes, and functional fabrics. Focuses on comfort and style.'
    },
    {
      id: 'm6',
      image: '/images/styles/Mglamorous.png',
      gender: 'male',
      style: 'Glamorous',
      description: 'Tailored suits, silk shirts, and statement accessories. Often includes metallic or velvet fabrics for a luxury vibe.'
    },
    {
      id: 'm7',
      image: '/images/styles/Medgy.png',
      gender: 'male',
      style: 'Edgy/Rock',
      description: 'Leather jackets, dark jeans, Chelsea boots, and band-inspired designs. Think biker or punk rock vibes.'
    },
    {
      id: 'm8',
      image: '/images/styles/Mvintage.png',
      gender: 'male',
      style: 'Vintage/Retro',
      description: 'High-waisted trousers, suspenders, patterned shirts, and accessories like fedoras.'
    },
    {
      id: 'm9',
      image: '/images/styles/Mtechy.png',
      gender: 'male',
      style: 'Urban/Techwear',
      description: 'Black-on-black outfits, functional cargo pants, oversized coats, and utility accessories like harnesses.'
    },
    {
      id: 'm10',
      image: '/images/styles/Mavante.png',
      gender: 'male',
      style: 'Avant-garde',
      description: 'Sculptural clothing, asymmetry, bold colors or monochrome, and unconventional fabrics or layering.'
    }
  ];

  const filteredStyles = gender === 'all' 
    ? styles 
    : styles.filter(style => style.gender === gender);

  const handleStyleSelect = (style) => {
    console.log('Style selected:', style);
    setSelectedStyle(style);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!outfitDescription.trim()) {
      alert('Please enter a description for your outfit');
      return;
    }

    handleOutfitSubmit({
      gender: selectedStyle.gender,
      bodyType: '',
      ethnicity: '',
      height: '',
      hairType: '',
      vibe: selectedStyle.style,
      comfortLevel: '',
      adventurous: '',
      focus: '',
      userInput: outfitDescription
    });
  };

  const handleCustomizeClick = () => {
    setShowCustomizer(true);
  };

  const handleCloseCustomizer = () => {
    setShowCustomizer(false);
  };

  return (
    <div className="style-container">
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

      <div className="header-section">
        <h1 className="header-title">Outfitz ✨</h1>
        <p className="header-subtitle">Your personal stylist</p>
      </div>

      <div className="gender-filter">
        <button 
          className={gender === 'all' ? 'active' : ''} 
          onClick={() => setGender('all')}
        >
          All Styles
        </button>
        <button 
          className={gender === 'male' ? 'active' : ''} 
          onClick={() => setGender('male')}
        >
          Men's Styles
        </button>
        <button 
          className={gender === 'female' ? 'active' : ''} 
          onClick={() => setGender('female')}
        >
          Women's Styles
        </button>
      </div>
      
      <div className={`styles-layout ${gender !== 'all' ? 'single-gender' : ''}`}>
        {gender === 'all' ? (
          <>
            <div className="styles-column">
              <h2>Women's Styles</h2>
              <div className="style-grid">
                {styles.filter(style => style.gender === 'female').map(style => (
                  <React.Fragment key={style.id}>
                    <div 
                      className={`style-item ${selectedStyle?.id === style.id ? 'selected' : ''}`}
                      onClick={() => handleStyleSelect(style)}
                      role="button"
                      tabIndex={0}
                    >
                      <img 
                        src={style.image} 
                        alt={style.style}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder.png';
                        }}
                      />
                      <div className="style-info">
                        <h3>{style.style}</h3>
                        <p>{style.description}</p>
                      </div>
                    </div>
                    {selectedStyle?.id === style.id && (
                      <div className="description-form-container">
                        <div className="description-form">
                          <h3>Describe your outfit based on {style.style} style:</h3>
                          <form onSubmit={handleSubmit}>
                            <textarea
                              value={outfitDescription}
                              onChange={(e) => setOutfitDescription(e.target.value)}
                              placeholder="Describe how you want your outfit to look..."
                              rows="4"
                              required
                            />
                            <div className="form-buttons">
                              <button 
                                type="button" 
                                className="customize-button"
                                onClick={handleCustomizeClick}
                              >
                                Customize
                              </button>
                              <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Generating...' : 'Generate Outfit'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="styles-column">
              <h2>Men's Styles</h2>
              <div className="style-grid">
                {styles.filter(style => style.gender === 'male').map(style => (
                  <React.Fragment key={style.id}>
                    <div 
                      className={`style-item ${selectedStyle?.id === style.id ? 'selected' : ''}`}
                      onClick={() => handleStyleSelect(style)}
                      role="button"
                      tabIndex={0}
                    >
                      <img 
                        src={style.image} 
                        alt={style.style}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder.png';
                        }}
                      />
                      <div className="style-info">
                        <h3>{style.style}</h3>
                        <p>{style.description}</p>
                      </div>
                    </div>
                    {selectedStyle?.id === style.id && (
                      <div className="description-form-container">
                        <div className="description-form">
                          <h3>Describe your outfit based on {style.style} style:</h3>
                          <form onSubmit={handleSubmit}>
                            <textarea
                              value={outfitDescription}
                              onChange={(e) => setOutfitDescription(e.target.value)}
                              placeholder="Describe how you want your outfit to look..."
                              rows="4"
                              required
                            />
                            <div className="form-buttons">
                              <button 
                                type="button" 
                                className="customize-button"
                                onClick={handleCustomizeClick}
                              >
                                Customize
                              </button>
                              <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Generating...' : 'Generate Outfit'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="styles-column">
            <h2>{gender === 'male' ? "Men's Styles" : "Women's Styles"}</h2>
            <div className="style-grid">
              {filteredStyles.map(style => (
                <React.Fragment key={style.id}>
                  <div 
                    className={`style-item ${selectedStyle?.id === style.id ? 'selected' : ''}`}
                    onClick={() => handleStyleSelect(style)}
                    role="button"
                    tabIndex={0}
                  >
                    <img 
                      src={style.image} 
                      alt={style.style}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/placeholder.png';
                      }}
                    />
                    <div className="style-info">
                      <h3>{style.style}</h3>
                      <p>{style.description}</p>
                    </div>
                  </div>
                  {selectedStyle?.id === style.id && (
                    <div className="description-form-container">
                      <div className="description-form">
                        <h3>Describe your outfit based on {style.style} style:</h3>
                        <form onSubmit={handleSubmit}>
                          <textarea
                            value={outfitDescription}
                            onChange={(e) => setOutfitDescription(e.target.value)}
                            placeholder="Describe how you want your outfit to look..."
                            rows="4"
                            required
                          />
                          <div className="form-buttons">
                            <button 
                              type="button" 
                              className="customize-button"
                              onClick={handleCustomizeClick}
                            >
                              Customize
                            </button>
                            <button type="submit" disabled={isLoading}>
                              {isLoading ? 'Generating...' : 'Generate Outfit'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <div className="alert">{error}</div>}

      {isOutfitVisible && generatedOutfit && (
        <ErrorBoundary>
          <OutfitModal 
            generatedOutfit={generatedOutfit}
            handleCloseModal={handleCloseModal}
            gender={selectedStyle?.gender}
          />
        </ErrorBoundary>
      )}

      {showCustomizer && (
        <div className="customizer-modal">
          <OutfitGenerator onClose={handleCloseCustomizer} />
        </div>
      )}
    </div>
  );
};

export default StyleGrid;