import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from './Avatar';
import { colors } from '../constants/theme';

export default function RightSidebar({ selectedChat, messages, onClose, onLogout, onUpdateGroup }) {
  const insets = useSafeAreaInsets();
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [groupName, setGroupName] = useState(selectedChat?.name || '');
  const [groupBio, setGroupBio] = useState(selectedChat?.bio || '');

  useEffect(() => {
    setGroupName(selectedChat?.name || '');
    setGroupBio(selectedChat?.bio || '');
    setIsEditingGroup(false);
  }, [selectedChat]);

  if (!selectedChat) return null;

  const title = selectedChat.isGroup ? selectedChat.name : selectedChat.fullName;
  const bio = selectedChat.isGroup ? selectedChat.bio || `${selectedChat.members?.length || 0} members` : selectedChat.bio;
  const mediaImages = messages.filter((message) => message.image).map((message) => message.image);
  const mediaCount = mediaImages.length;

  const handleSaveGroup = () => {
    onUpdateGroup({ ...selectedChat, name: groupName, bio: groupBio });
    setIsEditingGroup(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 18,
            paddingBottom: Math.max(insets.bottom + 86, 104),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Details</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>x</Text>
          </Pressable>
        </View>

        {isEditingGroup ? (
          <View style={styles.editCard}>
            <Avatar name={groupName} size={76} />
            <TextInput value={groupName} onChangeText={setGroupName} placeholder="Group name" placeholderTextColor={colors.textSoft} style={styles.input} />
            <TextInput
              multiline
              value={groupBio}
              onChangeText={setGroupBio}
              placeholder="Group bio"
              placeholderTextColor={colors.textSoft}
              style={[styles.input, styles.bioInput]}
            />
            <View style={styles.actionRow}>
              <Pressable onPress={() => setIsEditingGroup(false)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSaveGroup} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.profileBlock}>
            <Avatar name={title} online={!selectedChat.isGroup && selectedChat.online} size={86} />
            <Text style={styles.name}>{title}</Text>
            <Text style={styles.bio}>{bio}</Text>
            {selectedChat.isGroup && (
              <Pressable onPress={() => setIsEditingGroup(true)} style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit Group</Text>
              </Pressable>
            )}
          </View>
        )}

        {selectedChat.isGroup && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Members</Text>
            {(selectedChat.members || []).map((item) => (
              <View key={item._id} style={styles.memberRow}>
                <Avatar name={item.fullName} online={item.online} size={34} />
                <View>
                  <Text style={styles.memberName}>{item.fullName}</Text>
                  <Text style={[styles.memberStatus, item.online && styles.onlineText]}>{item.online ? 'Online' : 'offline'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media</Text>
          {mediaCount ? (
            <View style={styles.mediaGrid}>
              {mediaImages.slice(0, 9).map((image) => (
                <Image key={image} source={{ uri: image }} style={styles.mediaImage} />
              ))}
            </View>
          ) : (
            <View style={styles.mediaBox}>
              <Text style={styles.mediaCount}>0</Text>
              <Text style={styles.mediaText}>shared images</Text>
            </View>
          )}
          {!!mediaCount && <Text style={styles.mediaText}>{mediaCount} shared images</Text>}
        </View>
      </ScrollView>

      <Pressable onPress={onLogout} style={[styles.logoutButton, { bottom: Math.max(insets.bottom + 18, 18) }]}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 15,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  profileBlock: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingBottom: 24,
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 14,
    textAlign: 'center',
  },
  bio: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 15,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  editButtonText: {
    color: colors.text,
    fontWeight: '800',
  },
  editCard: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: 12,
    paddingBottom: 20,
  },
  input: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    minHeight: 48,
    paddingHorizontal: 14,
    width: '100%',
  },
  bioInput: {
    minHeight: 92,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    height: 46,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.textMuted,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    flex: 1,
    height: 46,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.text,
    fontWeight: '900',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
  },
  memberRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  memberName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  memberStatus: {
    color: colors.textSoft,
    fontSize: 12,
    marginTop: 2,
  },
  onlineText: {
    color: colors.accent,
  },
  mediaBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 18,
    height: 110,
    justifyContent: 'center',
  },
  mediaCount: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  mediaText: {
    color: colors.textSoft,
    marginTop: 4,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaImage: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 12,
    height: 78,
    width: 78,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    left: 18,
    position: 'absolute',
    right: 18,
  },
  logoutButtonText: {
    color: colors.text,
    fontWeight: '900',
  },
});
