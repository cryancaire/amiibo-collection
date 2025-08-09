import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { amiiboService } from '../services/amiiboService';
import { AmiiboCardBrowser } from '../components/amiibos/AmiiboCardBrowser';
import { useMediaQuery } from '../hooks/useMediaQuery';

export const Dashboard = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(max-width: 1023px)');
  const [stats, setStats] = useState({
    totalAmiibos: 0,
    collectionCount: 0,
    wishlistCount: 0,
    completionPercentage: 0
  });
  const [featuredAmiibos, setFeaturedAmiibos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Load user stats
      const statsResult = await amiiboService.getUserStats(user.id);
      if (!statsResult.error) {
        setStats(statsResult.data);
      }

      // Load random uncollected amiibos
      const amiiboResult = await amiiboService.getRandomUncollectedAmiibos(user.id, 9);
      if (!amiiboResult.error) {
        setFeaturedAmiibos(amiiboResult.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCollection = async (amiiboId) => {
    if (!user) return;

    try {
      const result = await amiiboService.addToCollection(user.id, amiiboId);
      if (result.success) {
        // Refresh dashboard data to update stats and featured amiibos
        await loadDashboardData();
      } else {
        alert(result.error || 'Failed to add to collection');
      }
    } catch (error) {
      console.error('Error adding to collection:', error);
      alert('Failed to add to collection');
    }
  };

  const handleAddToWishlist = async (amiiboId) => {
    if (!user) return;

    try {
      const result = await amiiboService.addToWishlist(user.id, amiiboId);
      if (result.success) {
        // Refresh stats to update wishlist count
        const statsResult = await amiiboService.getUserStats(user.id);
        if (!statsResult.error) {
          setStats(statsResult.data);
        }
      } else {
        alert(result.error || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add to wishlist');
    }
  };

  return (
    <div>
      <h2 
        style={{ 
          color: colors.text.primary,
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: '600',
          marginBottom: isMobile ? '16px' : '24px'
        }}
      >
        Welcome to Your Amiibo Collection
      </h2>

      <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
        <p style={{ 
          color: colors.text.secondary, 
          fontSize: isMobile ? '14px' : '16px',
          lineHeight: '1.5'
        }}>
          Hello {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}! 
          Manage your amiibo collection, discover new figures, and track your wishlist all in one place.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: isMobile ? '16px' : '24px',
        marginBottom: isMobile ? '24px' : '32px'
      }}>
        <div style={{
          padding: isMobile ? '16px' : '24px',
          backgroundColor: colors.surface,
          borderRadius: '8px',
          border: `1px solid ${colors.border}`
        }}>
          <h3 style={{ 
            color: colors.text.primary, 
            fontSize: isMobile ? '16px' : '18px', 
            marginBottom: '12px' 
          }}>
            Quick Stats
          </h3>
          <div style={{ color: colors.text.secondary }}>
            {isLoading ? (
              <p>Loading stats...</p>
            ) : (
              <>
                <p>Collection: {stats.collectionCount} amiibos</p>
                <p>Wishlist: {stats.wishlistCount} items</p>
                <p>Completion: {stats.completionPercentage}% ({stats.collectionCount}/{stats.totalAmiibos})</p>
              </>
            )}
          </div>
        </div>

        <div style={{
          padding: isMobile ? '16px' : '24px',
          backgroundColor: colors.surface,
          borderRadius: '8px',
          border: `1px solid ${colors.border}`
        }}>
          <h3 style={{ 
            color: colors.text.primary, 
            fontSize: isMobile ? '16px' : '18px', 
            marginBottom: '12px' 
          }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href="/browse" style={{
              color: '#10b981',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              → Browse All Amiibos
            </a>
            <a href="/collection" style={{
              color: '#10b981',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              → View My Collection
            </a>
            <a href="/wishlist" style={{
              color: '#10b981',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              → Manage Wishlist
            </a>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ 
          color: colors.text.primary, 
          fontSize: isMobile ? '18px' : '20px', 
          marginBottom: isMobile ? '12px' : '16px' 
        }}>
          Discover New Amiibos
        </h3>
        <p style={{ 
          color: colors.text.secondary, 
          fontSize: isMobile ? '13px' : '14px',
          marginBottom: isMobile ? '16px' : '20px'
        }}>
          Here are some amiibos you haven't collected yet. Add them to your collection or wishlist!
        </p>
        
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            color: colors.text.secondary
          }}>
            Loading featured amiibos...
          </div>
        ) : featuredAmiibos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            color: colors.text.secondary,
            backgroundColor: colors.surface,
            borderRadius: '8px',
            border: `1px solid ${colors.border}`
          }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>
              🎉 Congratulations!
            </p>
            <p style={{ fontSize: '14px' }}>
              You've collected all available amiibos! Check back later for new releases.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile 
              ? '1fr' 
              : isTablet 
                ? 'repeat(auto-fit, minmax(220px, 1fr))' 
                : 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: isMobile ? '12px' : '16px'
          }}>
            {featuredAmiibos.map(amiibo => (
              <AmiiboCardBrowser
                key={amiibo.id}
                amiibo={amiibo}
                isOwned={false}
                isWishlisted={false}
                onAddToCollection={handleAddToCollection}
                onAddToWishlist={handleAddToWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};