import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'chat_app_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function saveSession({ token, user }) {
  const session = {
    token,
    user,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getSession() {
  const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
  if (!sessionJson) return null;

  try {
    const session = JSON.parse(sessionJson);

    if (!session.token || !session.user || Date.now() > session.expiresAt) {
      await clearSession();
      return null;
    }

    return session;
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
