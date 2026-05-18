import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppOverviewPage from './src/screens/AppOverviewPage';
import ChatPage from './src/screens/ChatPage';
import LoginPage from './src/screens/LoginPage';
import ProfilePage from './src/screens/ProfilePage';
import { apiRequest } from './src/lib/api';
import { clearSession, getSession, saveSession } from './src/lib/sessionStorage';
import { colors } from './src/constants/theme';

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState('');
  const [route, setRoute] = useState('login');
  const [shouldShowOverview, setShouldShowOverview] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await getSession();

        if (!session?.token) return;

        const data = await apiRequest('/api/auth/check', {
          method: 'POST',
          token: session.token,
        });
        const user = data.user;
        const normalizedUser = {
          ...user,
          fullName: user.fullName || user.fullname,
        };

        setToken(session.token);
        setAuthUser(normalizedUser);
        setRoute('chat');
        await saveSession({ token: session.token, user: normalizedUser });
      } catch {
        await clearSession();
      } finally {
        setIsBootstrapping(false);
      }
    };

    restoreSession();
  }, []);

  const handleAuthenticated = async ({ mode, fullName, email, password, bio }) => {
    const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
    const body = mode === 'signup'
      ? { fullname: fullName, email, password, bio }
      : { email, password };
    const data = await apiRequest(endpoint, { method: 'POST', body });
    const user = data.userData || data.user;

    const normalizedUser = {
      ...user,
      fullName: user.fullName || user.fullname,
    };

    setToken(data.token);
    setAuthUser(normalizedUser);
    await saveSession({ token: data.token, user: normalizedUser });
    setShouldShowOverview(mode === 'signup');
    setRoute(mode === 'signup' ? 'overview' : 'chat');
  };

  const handleLogout = async () => {
    await clearSession();
    setAuthUser(null);
    setToken('');
    setShouldShowOverview(false);
    setRoute('login');
  };

  const handleSaveProfile = async (profile) => {
    const data = await apiRequest('/api/auth/update-profile', {
      method: 'POST',
      token,
      body: {
        fullname: profile.fullName,
        bio: profile.bio,
      },
    });
    const user = data.user;

    const normalizedUser = {
      ...user,
      fullName: user.fullName || user.fullname,
    };

    setAuthUser(normalizedUser);
    await saveSession({ token, user: normalizedUser });
  };

  const handleContinueFromOverview = () => {
    setShouldShowOverview(false);
    setRoute('chat');
  };

  const renderScreen = () => {
    if (isBootstrapping) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primaryLight} size="large" />
        </View>
      );
    }

    if (!authUser) {
      return <LoginPage onAuthenticated={handleAuthenticated} />;
    }

    if (route === 'overview' && shouldShowOverview) {
      return <AppOverviewPage user={authUser} onContinue={handleContinueFromOverview} />;
    }

    if (route === 'profile') {
      return <ProfilePage user={authUser} onBack={() => setRoute('chat')} onSave={handleSaveProfile} />;
    }

    return <ChatPage authUser={authUser} token={token} onLogout={handleLogout} onOpenProfile={() => setRoute('profile')} />;
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          {renderScreen()}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loader: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
