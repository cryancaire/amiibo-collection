import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { amiiboService } from '../../services/amiiboService';
import { AmiiboCardBrowser } from './AmiiboCardBrowser';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export const AmiiboBrowser = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [amiibos, setAmiibos] = useState([]);
  const [userCollection, setUserCollection] = useState([]);
  const [userWishlist, setUserWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('character');

  // Get list of owned amiibo IDs for quick lookup
  const ownedAmiiboIds = new Set(userCollection.map(item => item.amiibo_id));
  // Get list of wishlisted amiibo IDs for quick lookup
  const wishlistedAmiiboIds = new Set(userWishlist.map(item => item.amiibo_id));

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load all amiibos
      const amiiboResult = await amiiboService.getAllAmiibos();
      if (amiiboResult.error) {
        throw new Error('Failed to load amiibos');
      }
      setAmiibos(amiiboResult.data);

      // Load user's collection and wishlist if logged in
      if (user) {
        const collectionResult = await amiiboService.getUserCollection(user.id);
        if (collectionResult.error) {
          console.error('Failed to load collection:', collectionResult.error);
        } else {
          setUserCollection(collectionResult.data);
        }

        const wishlistResult = await amiiboService.getUserWishlist(user.id);
        if (wishlistResult.error) {
          console.error('Failed to load wishlist:', wishlistResult.error);
        } else {
          setUserWishlist(wishlistResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCollection = async (amiiboId) => {
    if (!user) return;

    try {
      const result = await amiiboService.addToCollection(user.id, amiiboId);
      if (result.success) {
        // Refresh collection data
        const collectionResult = await amiiboService.getUserCollection(user.id);
        if (!collectionResult.error) {
          setUserCollection(collectionResult.data);
        }
      } else {
        alert(result.error || 'Failed to add to collection');
      }
    } catch (error) {
      console.error('Error adding to collection:', error);
      alert('Failed to add to collection');
    }
  };

  const handleRemoveFromCollection = async (amiiboId) => {
    if (!user) return;

    try {
      const result = await amiiboService.removeFromCollection(user.id, amiiboId);
      if (result.success) {
        // Refresh collection data
        const collectionResult = await amiiboService.getUserCollection(user.id);
        if (!collectionResult.error) {
          setUserCollection(collectionResult.data);
        }
      } else {
        alert(result.error || 'Failed to remove from collection');
      }
    } catch (error) {
      console.error('Error removing from collection:', error);
      alert('Failed to remove from collection');
    }
  };

  const handleAddToWishlist = async (amiiboId) => {
    if (!user) return;

    try {
      const result = await amiiboService.addToWishlist(user.id, amiiboId);
      if (result.success) {
        // Refresh wishlist data
        const wishlistResult = await amiiboService.getUserWishlist(user.id);
        if (!wishlistResult.error) {
          setUserWishlist(wishlistResult.data);
        }
      } else {
        alert(result.error || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add to wishlist');
    }
  };

  const handleRemoveFromWishlist = async (amiiboId) => {
    if (!user) return;

    try {
      const result = await amiiboService.removeFromWishlist(user.id, amiiboId);
      if (result.success) {
        // Refresh wishlist data
        const wishlistResult = await amiiboService.getUserWishlist(user.id);
        if (!wishlistResult.error) {
          setUserWishlist(wishlistResult.data);
        }
      } else {
        alert(result.error || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove from wishlist');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }

    setIsLoading(true);
    try {
      const result = await amiiboService.searchAmiibos(searchTerm, filterBy);
      if (result.error) {
        throw new Error('Search failed');
      }
      setAmiibos(result.data);
    } catch (error) {
      console.error('Error searching:', error);
      setError('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        color: colors.text.secondary
      }}>
        Loading amiibos...
      </div>
    );
  }

  if (error) {
    return (
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
          onClick={loadData}
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
    );
  }

  return (
    <div>
      {/* Search & Filter */}
      <div style={{ 
        position: 'sticky',
        top: '0',
        zIndex: 10,
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: colors.surface,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'end',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '4px', 
              color: colors.text.primary,
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Search Amiibos
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter character name, series, etc..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                backgroundColor: colors.background,
                color: colors.text.primary,
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '4px', 
              color: colors.text.primary,
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Filter By
            </label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                backgroundColor: colors.background,
                color: colors.text.primary,
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="character">Character</option>
              <option value="game_series">Game Series</option>
              <option value="amiibo_series">Amiibo Series</option>
              <option value="name">Name</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Search
          </button>

          <button
            onClick={loadData}
            style={{
              padding: '8px 16px',
              backgroundColor: colors.text.secondary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div style={{ 
        marginBottom: '16px',
        color: colors.text.secondary,
        fontSize: '14px'
      }}>
        Showing {amiibos.length} amiibos
        {user && userCollection.length > 0 && (
          <span> • You own {userCollection.length} amiibo{userCollection.length !== 1 ? 's' : ''}</span>
        )}
        {user && userWishlist.length > 0 && (
          <span> • {userWishlist.length} on wishlist</span>
        )}
      </div>

      {/* Amiibo Grid */}
      {amiibos.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: colors.text.secondary
        }}>
          No amiibos found. {searchTerm ? 'Try a different search term.' : 'Check back later!'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile 
            ? '1fr' 
            : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: isMobile ? '12px' : '20px',
          padding: isMobile ? '4px' : '8px'
        }}>
          {amiibos.map(amiibo => (
            <AmiiboCardBrowser
              key={amiibo.id}
              amiibo={amiibo}
              isOwned={ownedAmiiboIds.has(amiibo.id)}
              isWishlisted={wishlistedAmiiboIds.has(amiibo.id)}
              onAddToCollection={handleAddToCollection}
              onRemoveFromCollection={handleRemoveFromCollection}
              onAddToWishlist={handleAddToWishlist}
              onRemoveFromWishlist={handleRemoveFromWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};