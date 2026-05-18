import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import Sidebar from '../components/Sidebar';
import { colors } from '../constants/theme';
import { sampleGroups, sampleMessages, sampleUsers } from '../constants/sampleData';

export default function ChatPage({ authUser, onLogout, onOpenProfile }) {
  const insets = useSafeAreaInsets();
  const [users] = useState(sampleUsers);
  const [groups, setGroups] = useState(sampleGroups);
  const [selectedChat, setSelectedChat] = useState(sampleUsers[0]);
  const [messages, setMessages] = useState(sampleMessages);
  const [mobilePanel, setMobilePanel] = useState('list');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const allChats = useMemo(() => [...groups, ...users], [groups, users]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMobilePanel('chat');
  };

  const handleCreateGroup = () => {
    const nextGroup = {
      _id: `group-${groups.length + 1}`,
      name: `New Group ${groups.length + 1}`,
      bio: 'Fresh group created from the mobile app shell.',
      isGroup: true,
      unread: 0,
      members: [
        { _id: authUser._id, fullName: authUser.fullName, online: true },
        ...users.slice(0, 2),
      ],
    };

    setGroups((prevGroups) => [nextGroup, ...prevGroups]);
    handleSelectChat(nextGroup);
  };

  const handleSendMessage = (text) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        _id: `msg-${Date.now()}`,
        senderId: authUser._id,
        text,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleUpdateGroup = (updatedGroup) => {
    setGroups((prevGroups) => prevGroups.map((group) => (group._id === updatedGroup._id ? updatedGroup : group)));
    setSelectedChat(updatedGroup);
  };

  if (isWide) {
    return (
      <View style={styles.desktopShell}>
        <View style={styles.sidebarColumn}>
          <Sidebar
            groups={groups}
            users={users}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            onCreateGroup={handleCreateGroup}
            onOpenProfile={onOpenProfile}
            onLogout={onLogout}
          />
        </View>
        <View style={styles.chatColumn}>
          <ChatContainer
            authUser={authUser}
            messages={messages}
            selectedChat={selectedChat}
            onBack={() => setSelectedChat(null)}
            onOpenDetails={() => setIsRightSidebarOpen(true)}
            onSendMessage={handleSendMessage}
          />
        </View>
        <View style={styles.rightColumn}>
          <RightSidebar
            selectedChat={selectedChat}
            messages={messages}
            onClose={() => setIsRightSidebarOpen(false)}
            onLogout={onLogout}
            onUpdateGroup={handleUpdateGroup}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileShell}>
      {mobilePanel === 'list' ? (
        <Sidebar
          groups={groups}
          users={users}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onCreateGroup={handleCreateGroup}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />
      ) : (
        <ChatContainer
          authUser={authUser}
          messages={messages}
          selectedChat={selectedChat}
          onBack={() => setMobilePanel('list')}
          onOpenDetails={() => setIsRightSidebarOpen(true)}
          onSendMessage={handleSendMessage}
        />
      )}

      <Modal animationType="slide" visible={isRightSidebarOpen} onRequestClose={() => setIsRightSidebarOpen(false)}>
        <SafeAreaView style={styles.modalSafeArea} edges={['top', 'left', 'right']}>
          <RightSidebar
            selectedChat={selectedChat}
            messages={messages}
            onClose={() => setIsRightSidebarOpen(false)}
            onLogout={onLogout}
            onUpdateGroup={handleUpdateGroup}
          />
        </SafeAreaView>
      </Modal>

      {mobilePanel === 'chat' && (
        <View style={[styles.mobileSwitcher, { bottom: Math.max(insets.bottom + 76, 76) }]}>
          {allChats.slice(0, 3).map((chat) => (
            <Pressable key={chat._id} onPress={() => handleSelectChat(chat)} style={styles.switchDot}>
              <Text style={styles.switchDotText}>{(chat.name || chat.fullName).charAt(0)}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  desktopShell: {
    backgroundColor: colors.background,
    flex: 1,
    flexDirection: 'row',
  },
  sidebarColumn: {
    maxWidth: 360,
    minWidth: 300,
    width: '28%',
  },
  chatColumn: {
    flex: 1,
  },
  rightColumn: {
    borderLeftColor: colors.border,
    borderLeftWidth: 1,
    maxWidth: 340,
    minWidth: 280,
    width: '26%',
  },
  mobileShell: {
    backgroundColor: colors.background,
    flex: 1,
  },
  modalSafeArea: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  mobileSwitcher: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    right: 16,
  },
  switchDot: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  switchDotText: {
    color: colors.text,
    fontWeight: '900',
  },
});
