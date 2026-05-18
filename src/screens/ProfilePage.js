import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { colors, spacing } from '../constants/theme';

export default function ProfilePage({ user, onBack, onSave }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [name, setName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave({ ...user, fullName: name, bio });
    setIsEditing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom + 24, 34),
          paddingHorizontal: width < 380 ? 16 : spacing.screen,
        },
      ]}
    >
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable onPress={() => setIsEditing((prev) => !prev)} style={styles.editButton}>
          <Text style={styles.editButtonText}>{isEditing ? 'View' : 'Edit'}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Avatar name={name} size={104} online />
        {isEditing ? (
          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.textSoft} style={styles.input} />
            <Text style={styles.label}>Bio</Text>
            <TextInput
              multiline
              value={bio}
              onChangeText={setBio}
              placeholder="Write profile bio..."
              placeholderTextColor={colors.textSoft}
              style={[styles.input, styles.bioInput]}
            />
            <Pressable onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Profile</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.profileView}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.bio}>{bio}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Text style={styles.infoValue}>12</Text>
          <Text style={styles.infoLabel}>Chats</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoValue}>4</Text>
          <Text style={styles.infoLabel}>Groups</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
    paddingTop: 28,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 34,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    minWidth: 64,
    paddingHorizontal: 14,
  },
  editButtonText: {
    color: colors.text,
    fontWeight: '900',
  },
  card: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    maxWidth: 520,
    padding: 22,
    width: '100%',
  },
  profileView: {
    alignItems: 'center',
  },
  name: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 16,
    textAlign: 'center',
  },
  email: {
    color: colors.textSoft,
    fontSize: 14,
    marginTop: 4,
  },
  bio: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 16,
    textAlign: 'center',
  },
  form: {
    marginTop: 20,
    width: '100%',
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  bioInput: {
    minHeight: 110,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    marginTop: 18,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  infoGrid: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    maxWidth: 520,
    width: '100%',
  },
  infoBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    padding: 18,
  },
  infoValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  infoLabel: {
    color: colors.textSoft,
    marginTop: 4,
  },
});
