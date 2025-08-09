import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { amiiboService } from '../services/amiiboService';
import { AmiiboCardBrowser } from '../components/amiibos/AmiiboCardBrowser';

export const WishlistPage = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [wishlistAmiibos, setWishlistAmiibos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await amiiboService.getUserWishlistWithDetails(user.id);
      if (result.error) {
        throw new Error('Failed to load wishlist');
      }
      setWishlistAmiibos(result.data);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (amiiboId) => {
    try {
      const result = await amiiboService.removeFromWishlist(user.id, amiiboId);
      if (result.success) {
        // Remove from local state
        setWishlistAmiibos(prev => prev.filter(amiibo => amiibo.id !== amiiboId));
      } else {
        alert(result.error || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove from wishlist');
    }
  };

  const handleAddToCollection = async (amiiboId) => {
    try {
      const result = await amiiboService.addToCollection(user.id, amiiboId);
      if (result.success) {
        // Remove from wishlist when added to collection
        await handleRemoveFromWishlist(amiiboId);
      } else {
        alert(result.error || 'Failed to add to collection');
      }
    } catch (error) {
      console.error('Error adding to collection:', error);
      alert('Failed to add to collection');
    }
  };

  if (isLoading) {
    return (
      <div>
        <h2 
          style={{ 
            color: colors.text.primary,
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px'
          }}
        >
          My Wishlist
        </h2>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          color: colors.text.secondary
        }}>
          Loading your wishlist...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 
          style={{ 
            color: colors.text.primary,
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px'
          }}
        >
          My Wishlist
        </h2>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          color: colors.text.secondary
        }}>
          <p>Error: {error}</p>
          <button
            onClick={loadWishlist}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 
        style={{ 
          color: colors.text.primary,
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '24px'
        }}
      >
        My Wishlist
      </h2>

      {wishlistAmiibos.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: colors.text.secondary
        }}>
          <p style={{ fontSize: '18px', marginBottom: '16px' }}>
            Your wishlist is empty
          </p>
          <p style={{ fontSize: '14px', marginBottom: '24px' }}>
            Add amiibos to your wishlist to keep track of what you want to collect!
          </p>
          <a 
            href="/browse"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            Browse Amiibos
          </a>
        </div>
      ) : (
        <>
          <div style={{ 
            marginBottom: '16px',
            color: colors.text.secondary,
            fontSize: '14px'
          }}>
            You have {wishlistAmiibos.length} amiibo{wishlistAmiibos.length !== 1 ? 's' : ''} on your wishlist
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
            padding: '8px'
          }}>
            {wishlistAmiibos.map(amiibo => (
              <AmiiboCardBrowser
                key={amiibo.id}
                amiibo={amiibo}
                isOwned={false}
                isWishlisted={true}
                onAddToCollection={handleAddToCollection}
                onRemoveFromWishlist={handleRemoveFromWishlist}
                showWishlistOnly={true}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};