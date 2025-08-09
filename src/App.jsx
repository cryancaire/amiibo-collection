import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Switch } from "./components/ui/switch";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginForm } from "./components/auth/LoginForm";
import { Navigation } from "./components/navigation/Navigation";
import { Dashboard } from "./pages/Dashboard";
import { BrowsePage } from "./pages/BrowsePage";
import { CollectionPage } from "./pages/CollectionPage";
import { WishlistPage } from "./pages/WishlistPage";
import { useMediaQuery } from "./hooks/useMediaQuery";

function AppContent() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { isAuthenticated, isLoading, user, signOut } = useAuth();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(max-width: 1023px)');

  if (isLoading) {
    return (
      <div 
        className="h-screen flex items-center justify-center" 
        style={{ backgroundColor: colors.background }}
      >
        <div style={{ color: colors.text.primary }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div 
        className="h-screen flex items-center justify-center" 
        style={{ backgroundColor: colors.background }}
      >
        <LoginForm />
      </div>
    );
  }

  return (
    <Router>
      <div
        style={{ 
          backgroundColor: colors.background,
          minHeight: '100vh'
        }}
      >
        <div
          style={{ 
            backgroundColor: colors.surface,
            minHeight: '100vh',
            maxWidth: '100vw',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh'
          }}
        >
          {/* Header */}
          <header style={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: `1px solid ${colors.border}`,
            flexShrink: 0
          }}>
            <h1
              style={{ 
                color: colors.text.primary,
                fontSize: '18px',
                fontWeight: '600',
                margin: 0
              }}
            >
              My Amiibo Collection
            </h1>
            
            {/* Mobile: Stack user info and controls */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {!isMobile && (
                <span style={{ 
                  fontSize: '14px', 
                  color: colors.text.secondary
                }}>
                  Welcome, {user?.user_metadata?.full_name || user?.name || user?.email?.split('@')[0] || 'User'}
                </span>
              )}
              <button
                onClick={signOut}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: 'transparent',
                  color: colors.text.secondary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!isMobile && (
                  <span style={{ 
                    fontSize: '12px', 
                    color: colors.text.secondary
                  }}>
                    {isDarkMode ? "Dark" : "Light"}
                  </span>
                )}
                <Switch defaultChecked={isDarkMode} onCheckedChange={toggleTheme} />
              </div>
            </div>
          </header>

          {/* Main Content - Mobile responsive layout */}
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden'
          }}>
            {/* Sidebar */}
            <aside style={{
              width: isMobile ? '100%' : isTablet ? '180px' : '200px',
              padding: isMobile ? '12px 16px' : '16px',
              borderRight: !isMobile ? `1px solid ${colors.border}` : 'none',
              borderBottom: isMobile ? `1px solid ${colors.border}` : 'none',
              flexShrink: 0
            }}>
              <Navigation />
            </aside>

            {/* Content Area */}
            <main style={{ 
              flex: 1,
              padding: isMobile ? '16px' : isTablet ? '20px' : '24px', 
              overflow: 'auto', 
              minHeight: 0,
              height: '100%'
            }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
              </Routes>
            </main>
          </div>

          {/* Footer */}
          <footer style={{ 
            padding: '12px 16px', 
            borderTop: `1px solid ${colors.border}`,
            textAlign: 'center',
            flexShrink: 0
          }}>
            <p style={{ 
              fontSize: '12px', 
              color: colors.text.secondary,
              margin: 0
            }}>
              Copyright CC Gaming 2025
            </p>
          </footer>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
