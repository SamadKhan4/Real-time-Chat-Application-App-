import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';

export default function LoginPage({ onAuthenticated }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [currState, setCurrState] = useState('Sign up');
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');

  const isSignup = currState === 'Sign up';

  const handleSubmit = () => {
    if (isSignup && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    onAuthenticated({
      _id: 'user-me',
      fullName: fullName.trim() || 'New User',
      email,
      bio: bio.trim() || 'Hey there, I am using Chat App.',
      isFirstLogin: isSignup,
    });
  };

  const switchMode = (mode) => {
    setCurrState(mode);
    setIsDataSubmitted(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: Math.max(insets.bottom + 24, 34),
            paddingHorizontal: width < 380 ? 16 : spacing.screen,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandBlock}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>C</Text>
          </View>
          <Text style={styles.brandTitle}>Chat App</Text>
          <Text style={styles.brandSubtitle}>Login and signup flow mapped from the web app, ready for backend wiring.</Text>
        </View>

        <View style={[styles.card, width >= 560 && styles.wideCard]}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{currState}</Text>
            {isDataSubmitted && (
              <Pressable onPress={() => setIsDataSubmitted(false)} hitSlop={12}>
                <Text style={styles.backText}>Back</Text>
              </Pressable>
            )}
          </View>

          {isSignup && !isDataSubmitted && (
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor={colors.textSoft}
              style={styles.input}
            />
          )}

          {!isDataSubmitted && (
            <>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor={colors.textSoft}
                style={styles.input}
              />
              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={colors.textSoft}
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)} style={styles.passwordToggle}>
                  <Text style={styles.passwordToggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
            </>
          )}

          {isSignup && isDataSubmitted && (
            <TextInput
              multiline
              numberOfLines={4}
              value={bio}
              onChangeText={setBio}
              placeholder="Provide short bio"
              placeholderTextColor={colors.textSoft}
              style={[styles.input, styles.bioInput]}
            />
          )}

          <Pressable onPress={handleSubmit} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{isSignup ? 'Create Account' : 'Login Now'}</Text>
          </Pressable>

          <View style={styles.termsRow}>
            <View style={styles.checkbox} />
            <Text style={styles.termsText}>Agree to the Terms of Use and Privacy Policy.</Text>
          </View>

          {isSignup ? (
            <Text style={styles.switchText}>
              Already have an account{' '}
              <Text onPress={() => switchMode('Login')} style={styles.switchLink}>
                login here
              </Text>
            </Text>
          ) : (
            <Text style={styles.switchText}>
              Create an account{' '}
              <Text onPress={() => switchMode('Sign up')} style={styles.switchLink}>
                Sign up
              </Text>
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: spacing.screen,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    height: 72,
    justifyContent: 'center',
    marginBottom: 18,
    width: 72,
  },
  logoText: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  brandTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  brandSubtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 310,
    textAlign: 'center',
  },
  card: {
    alignSelf: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    maxWidth: 440,
    padding: 20,
    width: '100%',
  },
  wideCard: {
    padding: 24,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  backText: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  input: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  bioInput: {
    minHeight: 116,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  passwordRow: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
  },
  passwordInput: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  passwordToggle: {
    paddingHorizontal: 14,
  },
  passwordToggleText: {
    color: colors.primaryLight,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  termsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  checkbox: {
    borderColor: colors.primaryLight,
    borderRadius: 5,
    borderWidth: 1,
    height: 18,
    width: 18,
  },
  termsText: {
    color: colors.textSoft,
    flex: 1,
    fontSize: 12,
  },
  switchText: {
    color: colors.textSoft,
    fontSize: 14,
  },
  switchLink: {
    color: colors.primaryLight,
    fontWeight: '800',
  },
});
