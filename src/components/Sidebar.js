import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import Avatar from './Avatar';
import { colors } from '../constants/theme';

export default function Sidebar({
  groups,
  users,
  contactRequests,
  outgoingContactRequests,
  unseenMessages,
  selectedChat,
  onSelectChat,
  onCreateGroup,
  onSendContactRequest,
  onRespondToContactRequest,
  onOpenProfile,
  onLogout,
  isLoading,
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const [query, setQuery] = useState('');
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

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
        {unseenMessages?.[item._id] > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unseenMessages[item._id]}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const openNewChat = () => {
    setIsActionMenuOpen(false);
    setIsNewChatOpen(true);
  };

  const openCreateGroup = () => {
    setIsActionMenuOpen(false);
    setIsGroupOpen(true);
  };

  const toggleMember = (userId) => {
    setSelectedMemberIds((prevIds) => (
      prevIds.includes(userId)
        ? prevIds.filter((id) => id !== userId)
        : [...prevIds, userId]
    ));
  };

  const submitNewChat = async () => {
    const sent = await onSendContactRequest(contactEmail.trim());
    if (sent) {
      setContactEmail('');
      setIsNewChatOpen(false);
    }
  };

  const submitGroup = async () => {
    const created = await onCreateGroup({ name: groupName.trim(), memberIds: selectedMemberIds });
    if (created) {
      setGroupName('');
      setSelectedMemberIds([]);
      setIsGroupOpen(false);
    }
  };

  return (
    <View style={[styles.container, { paddingHorizontal: isCompact ? 12 : 16 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Chat App</Text>
          <Text style={styles.caption}>Messages</Text>
        </View>
        <View style={styles.headerActions}>
          <View>
            <Pressable onPress={() => setIsActionMenuOpen((prev) => !prev)} style={styles.primaryIconButton}>
              <Text style={styles.primaryIconText}>+</Text>
            </Pressable>
            {isActionMenuOpen && (
              <View style={styles.actionMenu}>
                <Pressable onPress={openNewChat} style={styles.actionMenuItem}>
                  <Text style={styles.actionMenuText}>New Chat</Text>
                </Pressable>
                <Pressable onPress={openCreateGroup} style={styles.actionMenuItem}>
                  <Text style={styles.actionMenuText}>Create Group</Text>
                </Pressable>
              </View>
            )}
          </View>

          <Pressable onPress={() => setIsNotificationsOpen(true)} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>Bell</Text>
            {contactRequests.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{contactRequests.length}</Text>
              </View>
            )}
          </Pressable>

          <Pressable onPress={onOpenProfile} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>Me</Text>
          </Pressable>
        </View>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search user..."
        placeholderTextColor={colors.textSoft}
        style={styles.search}
      />

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

      <Modal animationType="fade" transparent visible={isNewChatOpen} onRequestClose={() => setIsNewChatOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>New Chat</Text>
                <Text style={styles.modalSubtitle}>Send request by email.</Text>
              </View>
              <Pressable onPress={() => setIsNewChatOpen(false)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>x</Text>
              </Pressable>
            </View>
            <TextInput
              value={contactEmail}
              onChangeText={setContactEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="friend@example.com"
              placeholderTextColor={colors.textSoft}
              style={styles.modalInput}
            />
            <Pressable disabled={isLoading} onPress={submitNewChat} style={styles.modalPrimaryButton}>
              <Text style={styles.modalPrimaryText}>{isLoading ? 'Please wait...' : 'Send Request'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent visible={isGroupOpen} onRequestClose={() => setIsGroupOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Create Group</Text>
                <Text style={styles.modalSubtitle}>Choose accepted contacts.</Text>
              </View>
              <Pressable onPress={() => setIsGroupOpen(false)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>x</Text>
              </Pressable>
            </View>
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Group name"
              placeholderTextColor={colors.textSoft}
              style={styles.modalInput}
            />
            <ScrollView style={styles.memberList}>
              {users.map((user) => (
                <Pressable key={user._id} onPress={() => toggleMember(user._id)} style={styles.memberOption}>
                  <Avatar name={user.fullName} size={34} online={user.online} />
                  <Text style={styles.memberOptionText}>{user.fullName}</Text>
                  <View style={[styles.checkBox, selectedMemberIds.includes(user._id) && styles.checkBoxActive]}>
                    <Text style={styles.checkBoxText}>{selectedMemberIds.includes(user._id) ? 'OK' : ''}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable disabled={isLoading} onPress={submitGroup} style={styles.modalPrimaryButton}>
              <Text style={styles.modalPrimaryText}>{isLoading ? 'Please wait...' : 'Create'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" visible={isNotificationsOpen} onRequestClose={() => setIsNotificationsOpen(false)}>
        <View style={[styles.notificationsScreen, { paddingTop: insets.top + 18, paddingBottom: Math.max(insets.bottom + 18, 28) }]}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Notifications</Text>
              <Text style={styles.modalSubtitle}>Chat requests and pending sent requests.</Text>
            </View>
            <Pressable onPress={() => setIsNotificationsOpen(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>x</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Requests</Text>
            {contactRequests.length ? contactRequests.map((request) => (
              <View key={request._id} style={styles.requestCard}>
                <View style={styles.requestIdentity}>
                  <Avatar name={request.requester?.fullName} size={42} />
                  <View style={styles.chatCopy}>
                    <Text style={styles.chatName}>{request.requester?.fullName}</Text>
                    <Text style={styles.chatStatus}>{request.requester?.email}</Text>
                  </View>
                </View>
                <View style={styles.requestActions}>
                  <Pressable onPress={() => onRespondToContactRequest(request._id, 'decline')} style={styles.declineButton}>
                    <Text style={styles.secondaryButtonText}>Decline</Text>
                  </Pressable>
                  <Pressable onPress={() => onRespondToContactRequest(request._id, 'accept')} style={styles.acceptButton}>
                    <Text style={styles.modalPrimaryText}>Accept</Text>
                  </Pressable>
                </View>
              </View>
            )) : (
              <Text style={styles.emptyText}>No incoming requests.</Text>
            )}

            {outgoingContactRequests.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Pending Sent</Text>
                {outgoingContactRequests.map((request) => (
                  <View key={request._id} style={styles.pendingRow}>
                    <Avatar name={request.recipient?.fullName} size={34} />
                    <View style={styles.chatCopy}>
                      <Text style={styles.chatName}>{request.recipient?.fullName}</Text>
                      <Text style={styles.chatStatus}>Waiting for accept</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
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
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
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
  primaryIconButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 15,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  primaryIconText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 26,
  },
  actionMenu: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 6,
    position: 'absolute',
    right: 0,
    top: 48,
    width: 154,
    zIndex: 20,
  },
  actionMenuItem: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionMenuText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  notificationBadge: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 9,
    minWidth: 18,
    paddingHorizontal: 5,
    position: 'absolute',
    right: -4,
    top: -4,
  },
  notificationBadgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  search: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 18,
    color: colors.text,
    height: 48,
    paddingHorizontal: 16,
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
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    maxWidth: 420,
    padding: 18,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: colors.textSoft,
    fontSize: 12,
    marginTop: 3,
  },
  modalClose: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 15,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  modalCloseText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  modalInput: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  modalPrimaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    marginTop: 14,
  },
  modalPrimaryText: {
    color: colors.text,
    fontWeight: '900',
  },
  memberList: {
    maxHeight: 250,
    marginTop: 12,
  },
  memberOption: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  memberOptionText: {
    color: colors.text,
    flex: 1,
    fontWeight: '800',
  },
  checkBox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 7,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkBoxText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  notificationsScreen: {
    backgroundColor: colors.surface,
    flex: 1,
    paddingHorizontal: 18,
  },
  requestCard: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 18,
    marginBottom: 12,
    padding: 14,
  },
  requestIdentity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  declineButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    height: 42,
    justifyContent: 'center',
  },
  acceptButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    flex: 1,
    height: 42,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.textMuted,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.textSoft,
    fontSize: 14,
    marginBottom: 18,
  },
  pendingRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    padding: 12,
  },
});
