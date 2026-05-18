import { FlatList, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import Avatar from './Avatar';
import { colors } from '../constants/theme';

export default function Sidebar({
  groups,
  users,
  selectedChat,
  onSelectChat,
  onCreateGroup,
  onOpenProfile,
  onLogout,
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const [query, setQuery] = useState('');

  const filteredGroups = useMemo(
    () => groups.filter((group) => group.name.toLowerCase().includes(query.toLowerCase())),
    [groups, query],
  );
  const filteredUsers = useMemo(
    () => users.filter((user) => user.fullName.toLowerCase().includes(query.toLowerCase())),
    [query, users],
  );

  const renderChatItem = (item, isGroup = false) => {
    const title = isGroup ? item.name : item.fullName;
    const subtitle = isGroup ? `${item.members?.length || 0} members` : item.online ? 'Online' : 'offline';
    const isActive = selectedChat?._id === item._id;

    return (
      <Pressable onPress={() => onSelectChat(item)} style={[styles.chatItem, isActive && styles.chatItemActive]}>
        <Avatar name={title} online={!isGroup && item.online} />
        <View style={styles.chatCopy}>
          <Text numberOfLines={1} style={styles.chatName}>
            {title}
          </Text>
          <Text style={[styles.chatStatus, !isGroup && item.online && styles.onlineText]}>{subtitle}</Text>
        </View>
        {item.unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unread}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingHorizontal: isCompact ? 12 : 16 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Chat App</Text>
          <Text style={styles.caption}>Messages</Text>
        </View>
        <Pressable onPress={onOpenProfile} style={styles.iconButton}>
          <Text style={styles.iconButtonText}>Me</Text>
        </Pressable>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search user..."
        placeholderTextColor={colors.textSoft}
        style={styles.search}
      />

      <Pressable onPress={onCreateGroup} style={styles.createButton}>
        <Text style={styles.createButtonText}>+ Create Group</Text>
      </Pressable>

      <FlatList
        data={[
          { type: 'section', id: 'groups', title: 'Groups' },
          ...filteredGroups.map((item) => ({ type: 'group', item, id: item._id })),
          { type: 'section', id: 'people', title: 'People' },
          ...filteredUsers.map((item) => ({ type: 'user', item, id: item._id })),
        ]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.type === 'section') return <Text style={styles.sectionTitle}>{item.title}</Text>;
          return renderChatItem(item.item, item.type === 'group');
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom + 18, 28) }]}
      />

      <Pressable onPress={onLogout} style={[styles.logoutButton, { marginBottom: Math.max(insets.bottom, 12) }]}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRightColor: colors.border,
    borderRightWidth: 1,
    flex: 1,
    paddingTop: 18,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  logo: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  caption: {
    color: colors.textSoft,
    fontSize: 12,
    marginTop: 2,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 15,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  iconButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  search: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 18,
    color: colors.text,
    height: 48,
    paddingHorizontal: 16,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    marginTop: 12,
  },
  createButtonText: {
    color: colors.text,
    fontWeight: '800',
  },
  listContent: {
    flexGrow: 1,
  },
  sectionTitle: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  chatItem: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 10,
  },
  chatItemActive: {
    backgroundColor: colors.surfaceSoft,
  },
  chatCopy: {
    flex: 1,
  },
  chatName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  chatStatus: {
    color: colors.textSoft,
    fontSize: 12,
    marginTop: 3,
  },
  onlineText: {
    color: colors.accent,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  logoutButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoutText: {
    color: colors.textMuted,
    fontWeight: '800',
  },
});
