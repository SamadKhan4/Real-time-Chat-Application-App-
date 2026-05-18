import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import './global.css';
import AppOverviewPage from './src/screens/AppOverviewPage';
import ChatPage from './src/screens/ChatPage';
import LoginPage from './src/screens/LoginPage';
import ProfilePage from './src/screens/ProfilePage';
import { currentUser } from './src/constants/sampleData';
import { colors } from './src/constants/theme';

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [route, setRoute] = useState('login');
  const [shouldShowOverview, setShouldShowOverview] = useState(false);

  const handleAuthenticated = (user) => {
    const nextUser = { ...currentUser, ...user };
    setAuthUser(nextUser);
    setShouldShowOverview(Boolean(user.isFirstLogin));
    setRoute(user.isFirstLogin ? 'overview' : 'chat');
  };

  const handleLogout = () => {
    setAuthUser(null);
    setShouldShowOverview(false);
    setRoute('login');
  };

  const handleContinueFromOverview = () => {
    setShouldShowOverview(false);
    setRoute('chat');
  };

  const renderScreen = () => {
    if (!authUser) {
      return <LoginPage onAuthenticated={handleAuthenticated} />;
    }

    if (route === 'overview' && shouldShowOverview) {
      return <AppOverviewPage user={authUser} onContinue={handleContinueFromOverview} />;
    }

    if (route === 'profile') {
      return <ProfilePage user={authUser} onBack={() => setRoute('chat')} onSave={setAuthUser} />;
    }

    return <ChatPage authUser={authUser} onLogout={handleLogout} onOpenProfile={() => setRoute('profile')} />;
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
});
