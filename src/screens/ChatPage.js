import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { io } from 'socket.io-client';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import Sidebar from '../components/Sidebar';
import { colors } from '../constants/theme';
import { API_URL, apiRequest, normalizeContactRequests, normalizeGroups, normalizeUsers } from '../lib/api';

export default function ChatPage({ authUser, token, onLogout, onOpenProfile }) {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [outgoingContactRequests, setOutgoingContactRequests] = useState([]);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUserId, setTypingUserId] = useState(null);
  const [groupTypingUsers, setGroupTypingUsers] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [mobilePanel, setMobilePanel] = useState('list');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const socketRef = useRef(null);
  const selectedChatRef = useRef(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const applyOnlineStatus = useCallback((items = []) => (
    items.map((item) => ({
      ...item,
      online: onlineUsers.includes(item._id?.toString()),
      members: item.members?.map((member) => ({
        ...member,
        online: onlineUsers.includes(member._id?.toString()),
      })),
    }))
  ), [onlineUsers]);

  const visibleUsers = useMemo(() => applyOnlineStatus(users), [applyOnlineStatus, users]);
  const visibleGroups = useMemo(() => applyOnlineStatus(groups), [applyOnlineStatus, groups]);
  const visibleSelectedChat = useMemo(() => (
    selectedChat ? applyOnlineStatus([selectedChat])[0] : selectedChat
  ), [applyOnlineStatus, selectedChat]);
  const allChats = useMemo(() => [...visibleGroups, ...visibleUsers], [visibleGroups, visibleUsers]);

  useEffect(() => {
    if (!authUser?._id) return undefined;

    const socket = io(API_URL, {
      query: {
        userId: authUser._id?.toString(),
      },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('socket connected', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.log('socket connect error', error.message);
    });

    socket.on('getOnlineUsers', (userIds) => {
      setOnlineUsers((userIds || []).map((id) => id.toString()));
    });

    socket.on('newMessage', (newMessage) => {
      const senderId = typeof newMessage.senderId === 'object' ? newMessage.senderId?._id : newMessage.senderId;
      const groupId = newMessage.groupId?.toString();
      const currentChat = selectedChatRef.current;
      const selectedChatId = currentChat?._id?.toString();
      const isSelectedGroupMessage = currentChat?.isGroup && groupId === selectedChatId;
      const isSelectedUserMessage = currentChat && !currentChat.isGroup && senderId === selectedChatId;

      if (isSelectedGroupMessage || isSelectedUserMessage) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } else {
        const unseenKey = groupId || senderId;
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [unseenKey]: (prevUnseenMessages[unseenKey] || 0) + 1,
        }));
      }
    });

    socket.on('typing', ({ senderId }) => {
      setTypingUserId(senderId);
    });

    socket.on('stopTyping', ({ senderId }) => {
      setTypingUserId((currentTypingUserId) => (
        currentTypingUserId === senderId ? null : currentTypingUserId
      ));
    });

    socket.on('groupTyping', ({ groupId, senderId, senderName }) => {
      setGroupTypingUsers((prevTypingUsers) => ({
        ...prevTypingUsers,
        [groupId]: {
          ...(prevTypingUsers[groupId] || {}),
          [senderId]: senderName || 'Someone',
        },
      }));
    });

    socket.on('groupStopTyping', ({ groupId, senderId }) => {
      setGroupTypingUsers((prevTypingUsers) => {
        const groupTyping = { ...(prevTypingUsers[groupId] || {}) };
        delete groupTyping[senderId];

        return {
          ...prevTypingUsers,
          [groupId]: groupTyping,
        };
      });
    });

    socket.on('newGroup', (group) => {
      const normalizedGroup = normalizeGroups([group])[0];
      setGroups((prevGroups) => [normalizedGroup, ...prevGroups.filter((item) => item._id !== normalizedGroup._id)]);
    });

    socket.on('groupUpdated', (group) => {
      const normalizedGroup = normalizeGroups([group])[0];
      setGroups((prevGroups) => prevGroups.map((item) => (item._id === normalizedGroup._id ? normalizedGroup : item)));
      setSelectedChat((currentChat) => (currentChat?._id === normalizedGroup._id ? normalizedGroup : currentChat));
    });

    socket.on('contactRequest:new', (request) => {
      const normalizedRequest = normalizeContactRequests([request])[0];
      setContactRequests((prevRequests) => [
        normalizedRequest,
        ...prevRequests.filter((item) => item._id !== normalizedRequest._id),
      ]);
    });

    socket.on('contactRequest:accepted', ({ requestId, user }) => {
      setOutgoingContactRequests((prevRequests) => prevRequests.filter((request) => request._id !== requestId));
      if (user) {
        const acceptedUser = normalizeUsers([user])[0];
        setUsers((prevUsers) => [acceptedUser, ...prevUsers.filter((item) => item._id !== acceptedUser._id)]);
      }
    });

    socket.on('contactRequest:declined', ({ requestId }) => {
      setOutgoingContactRequests((prevRequests) => prevRequests.filter((request) => request._id !== requestId));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [authUser?._id]);

  const loadSidebarData = useCallback(async () => {
    try {
      const data = await apiRequest('/api/messages/users', { token });
      setUsers(normalizeUsers(data.users || []));
      setGroups(normalizeGroups(data.groups || []));
      setContactRequests(normalizeContactRequests(data.contactRequests || []));
      setUnseenMessages(data.unseenMessages || {});
    } catch (error) {
      Alert.alert('Chat App', error.message);
    }
  }, [token]);

  const loadContactRequests = useCallback(async () => {
    try {
      const data = await apiRequest('/api/messages/contact-requests', { token });
      setContactRequests(normalizeContactRequests(data.incoming || []));
      setOutgoingContactRequests(normalizeContactRequests(data.outgoing || []));
    } catch (error) {
      Alert.alert('Chat App', error.message);
    }
  }, [token]);

  const loadMessages = useCallback(async (chat) => {
    if (!chat?._id) return;

    try {
      const path = chat.isGroup ? `/api/messages/groups/${chat._id}` : `/api/messages/${chat._id}`;
      const data = await apiRequest(path, { token });
      setMessages(data.messages || []);
    } catch (error) {
      Alert.alert('Chat App', error.message);
    }
  }, [token]);

  useEffect(() => {
    loadSidebarData();
    loadContactRequests();
  }, [loadContactRequests, loadSidebarData]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadSidebarData();
      loadContactRequests();
      if (selectedChat?._id) loadMessages(selectedChat);
    }, 8000);

    return () => clearInterval(timer);
  }, [loadContactRequests, loadMessages, loadSidebarData, selectedChat]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setUnseenMessages((prev) => ({ ...prev, [chat._id]: 0 }));
    setMobilePanel('chat');
    loadMessages(chat);
  };

  const handleCreateGroup = async ({ name, memberIds }) => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/api/messages/groups', {
        method: 'POST',
        token,
        body: { name, memberIds },
      });
      const group = normalizeGroups([data.group])[0];
      setGroups((prevGroups) => [group, ...prevGroups.filter((item) => item._id !== group._id)]);
      handleSelectChat(group);
      return true;
    } catch (error) {
      Alert.alert('Create Group', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendContactRequest = async (email) => {
    setIsLoading(true);
    try {
      await apiRequest('/api/messages/contact-requests', {
        method: 'POST',
        token,
        body: { email },
      });
      await loadContactRequests();
      Alert.alert('New Chat', 'Contact request sent');
      return true;
    } catch (error) {
      Alert.alert('New Chat', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToContactRequest = async (requestId, action) => {
    setIsLoading(true);
    try {
      const data = await apiRequest(`/api/messages/contact-requests/${requestId}`, {
        method: 'PUT',
        token,
        body: { action },
      });

      setContactRequests((prevRequests) => prevRequests.filter((request) => request._id !== requestId));
      if (action === 'accept' && data.user) {
        const user = normalizeUsers([data.user])[0];
        setUsers((prevUsers) => [user, ...prevUsers.filter((item) => item._id !== user._id)]);
      }
      return true;
    } catch (error) {
      Alert.alert('Chat Request', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageData) => {
    if (!selectedChat?._id) return;
    handleStopTyping();

    try {
      const path = selectedChat.isGroup
        ? `/api/messages/send-group/${selectedChat._id}`
        : `/api/messages/send/${selectedChat._id}`;
      const body = typeof messageData === 'string' ? { text: messageData } : messageData;
      const data = await apiRequest(path, {
        method: 'POST',
        token,
        body,
      });
      setMessages((prevMessages) => [...prevMessages, data.newMessage]);
    } catch (error) {
      Alert.alert('Send Message', error.message);
    }
  };

  const handleStartTyping = useCallback(() => {
    const socket = socketRef.current;
    const currentChat = selectedChatRef.current;

    if (!socket || !currentChat?._id) return;

    if (currentChat.isGroup) {
      socket.emit('groupTyping', {
        groupId: currentChat._id,
        members: currentChat.members?.map((member) => member._id) || [],
        senderName: authUser?.fullName || authUser?.fullname || 'Someone',
      });
    } else {
      socket.emit('typing', { receiverId: currentChat._id });
    }
  }, [authUser]);

  const handleStopTyping = useCallback(() => {
    const socket = socketRef.current;
    const currentChat = selectedChatRef.current;

    if (!socket || !currentChat?._id) return;

    if (currentChat.isGroup) {
      socket.emit('groupStopTyping', {
        groupId: currentChat._id,
        members: currentChat.members?.map((member) => member._id) || [],
      });
    } else {
      socket.emit('stopTyping', { receiverId: currentChat._id });
    }
  }, []);

  const handleUpdateGroup = async (updatedGroup) => {
    if (!updatedGroup?._id) return;

    try {
      const data = await apiRequest(`/api/messages/groups/${updatedGroup._id}`, {
        method: 'PUT',
        token,
        body: { name: updatedGroup.name, bio: updatedGroup.bio },
      });
      const group = normalizeGroups([data.group])[0];
      setGroups((prevGroups) => prevGroups.map((item) => (item._id === group._id ? group : item)));
      setSelectedChat(group);
    } catch (error) {
      Alert.alert('Update Group', error.message);
    }
  };

  if (isWide) {
    return (
      <View style={styles.desktopShell}>
        <View style={styles.sidebarColumn}>
          <Sidebar
            groups={visibleGroups}
            users={visibleUsers}
            contactRequests={contactRequests}
            outgoingContactRequests={outgoingContactRequests}
            unseenMessages={unseenMessages}
            selectedChat={visibleSelectedChat}
            onSelectChat={handleSelectChat}
            onCreateGroup={handleCreateGroup}
            onSendContactRequest={handleSendContactRequest}
            onRespondToContactRequest={handleRespondToContactRequest}
            onOpenProfile={onOpenProfile}
            onLogout={onLogout}
            isLoading={isLoading}
          />
        </View>
        <View style={styles.chatColumn}>
          <ChatContainer
            authUser={authUser}
            messages={messages}
            selectedChat={visibleSelectedChat}
            typingUserId={typingUserId}
            groupTypingUsers={groupTypingUsers}
            onBack={() => setSelectedChat(null)}
            onOpenDetails={() => setIsRightSidebarOpen(true)}
            onSendMessage={handleSendMessage}
            onStartTyping={handleStartTyping}
            onStopTyping={handleStopTyping}
          />
        </View>
        <View style={styles.rightColumn}>
          <RightSidebar
            selectedChat={visibleSelectedChat}
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
          groups={visibleGroups}
          users={visibleUsers}
          contactRequests={contactRequests}
          outgoingContactRequests={outgoingContactRequests}
          unseenMessages={unseenMessages}
          selectedChat={visibleSelectedChat}
          onSelectChat={handleSelectChat}
          onCreateGroup={handleCreateGroup}
          onSendContactRequest={handleSendContactRequest}
          onRespondToContactRequest={handleRespondToContactRequest}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
          isLoading={isLoading}
        />
      ) : (
        <ChatContainer
          authUser={authUser}
          messages={messages}
          selectedChat={visibleSelectedChat}
          typingUserId={typingUserId}
          groupTypingUsers={groupTypingUsers}
          onBack={() => setMobilePanel('list')}
          onOpenDetails={() => setIsRightSidebarOpen(true)}
          onSendMessage={handleSendMessage}
          onStartTyping={handleStartTyping}
          onStopTyping={handleStopTyping}
        />
      )}

      <Modal animationType="slide" visible={isRightSidebarOpen} onRequestClose={() => setIsRightSidebarOpen(false)}>
        <SafeAreaView style={styles.modalSafeArea} edges={['top', 'left', 'right']}>
          <RightSidebar
            selectedChat={visibleSelectedChat}
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
