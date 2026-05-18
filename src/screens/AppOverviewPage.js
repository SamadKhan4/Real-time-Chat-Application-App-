import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';

const highlights = [
  { title: 'Private chats', text: 'One-to-one messages with online and typing states.' },
  { title: 'Group rooms', text: 'Create teams, add members, and keep project threads together.' },
  { title: 'Profile control', text: 'Edit your name, bio, and profile details from one place.' },
];

export default function AppOverviewPage({ user, onContinue }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom + 24, 34),
          paddingHorizontal: isCompact ? 16 : spacing.screen,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={styles.eyebrow}>Welcome, {user?.fullName || 'there'}</Text>
        <Text style={[styles.title, isCompact && styles.compactTitle]}>Your chat workspace is ready.</Text>
        <Text style={styles.subtitle}>
          This screen is designed for first-time login only. It gives users a quick overview before opening the main chat area.
        </Text>
      </View>

      <View style={styles.stack}>
        {highlights.map((item, index) => (
          <View key={item.title} style={styles.feature}>
            <View style={styles.featureIndex}>
              <Text style={styles.featureIndexText}>{index + 1}</Text>
            </View>
            <View style={styles.featureCopy}>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable onPress={onContinue} style={styles.button}>
        <Text style={styles.buttonText}>Open Chat App</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: 28,
    paddingTop: 56,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 44,
  },
  compactTitle: {
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
  },
  stack: {
    gap: 14,
  },
  feature: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: spacing.radius,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  featureIndex: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  featureIndexText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  featureText: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
});
