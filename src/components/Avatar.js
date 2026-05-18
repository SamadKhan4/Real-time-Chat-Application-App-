import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

export default function Avatar({ name = 'User', size = 42, online = false }) {
  const initial = name.trim().charAt(0).toUpperCase() || 'U';

  return (
    <View style={[styles.avatar, { height: size, width: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initial, { fontSize: Math.max(14, size * 0.38) }]}>{initial}</Text>
      {online && <View style={styles.onlineDot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  initial: {
    color: colors.text,
    fontWeight: '800',
  },
  onlineDot: {
    backgroundColor: colors.accent,
    borderColor: colors.surface,
    borderRadius: 6,
    borderWidth: 2,
    bottom: 0,
    height: 12,
    position: 'absolute',
    right: 0,
    width: 12,
  },
});
