import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from './Avatar';
import { colors } from '../constants/theme';
import { formatMessageTime } from '../utils/formatMessageTime';

export default function ChatContainer({
  authUser,
  messages,
  selectedChat,
  typingUserId,
  groupTypingUsers,
  onBack,
  onOpenDetails,
  onSendMessage,
  onStartTyping,
  onStopTyping,
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const [input, setInput] = useState('');
  const listRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (messages.length) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onStopTyping?.();
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    onSendMessage(text);
    setInput('');
  };

  const handleInputChange = (value) => {
    setInput(value);
    onStartTyping?.();

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      onStopTyping?.();
    }, 1200);
  };

  useEffect(() => (
    () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      onStopTyping?.();
    }
  ), [onStopTyping]);

  if (!selectedChat) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>C</Text>
        </View>
        <Text style={styles.emptyTitle}>Chat Anytime, Anywhere</Text>
        <Text style={styles.emptySubtitle}>Select a person or group to start the conversation.</Text>
      </View>
    );
  }

  const title = selectedChat.isGroup ? selectedChat.name : selectedChat.fullName;
  const typingNames = Object.values(groupTypingUsers?.[selectedChat?._id] || {});
  const isTyping = selectedChat.isGroup ? typingNames.length > 0 : typingUserId === selectedChat._id;
  const subtitle = isTyping
    ? selectedChat.isGroup
      ? typingNames.length > 1
        ? `${typingNames.join(', ')} are typing...`
        : `${typingNames[0]} is typing...`
      : 'typing...'
    : selectedChat.isGroup
      ? `${selectedChat.members?.length || 0} members`
      : selectedChat.online
        ? 'Online'
        : 'offline';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </Pressable>
        <Pressable onPress={onOpenDetails} style={styles.headerIdentity}>
          <Avatar name={title} online={!selectedChat.isGroup && selectedChat.online} size={40} />
          <View style={styles.headerCopy}>
            <Text numberOfLines={1} style={styles.headerTitle}>
              {title}
            </Text>
            <Text style={[styles.headerSubtitle, (subtitle === 'Online' || isTyping) && styles.onlineText]}>{subtitle}</Text>
          </View>
        </Pressable>
        <Pressable onPress={onOpenDetails} style={styles.infoButton}>
          <Text style={styles.infoButtonText}>i</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const senderId = typeof item.senderId === 'object' ? item.senderId?._id : item.senderId;
          const isOwn = senderId === authUser?._id;

          return (
            <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
              {!isOwn && <Avatar name={title} size={28} />}
              <View style={[styles.bubble, isOwn && styles.bubbleOwn]}>
                {selectedChat.isGroup && !isOwn && <Text style={styles.senderName}>{title}</Text>}
                <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>{item.text}</Text>
                <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>{formatMessageTime(item.createdAt)}</Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={[
          styles.messagesContent,
          {
            paddingHorizontal: isCompact ? 12 : 16,
            paddingBottom: Math.max(insets.bottom + 88, 104),
          },
        ]}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={10}>
        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom + 10, 12) }]}>
          <Pressable style={styles.galleryButton}>
            <Text style={styles.galleryButtonText}>+</Text>
          </Pressable>
          <TextInput
            value={input}
            onChangeText={handleInputChange}
            placeholder="Send a message"
            placeholderTextColor={colors.textSoft}
            style={styles.messageInput}
          />
          <Pressable onPress={handleSend} style={[styles.sendButton, isCompact && styles.compactSendButton]}>
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    height: 72,
    justifyContent: 'center',
    marginBottom: 20,
    width: 72,
  },
  emptyIconText: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 68,
    paddingHorizontal: 14,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 15,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 32,
  },
  headerIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: colors.textSoft,
    fontSize: 12,
    marginTop: 2,
  },
  onlineText: {
    color: colors.accent,
  },
  infoButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 15,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  infoButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  messagesContent: {
    paddingTop: 16,
  },
  messageRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: 17,
    borderBottomLeftRadius: 5,
    maxWidth: '78%',
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  bubbleOwn: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 5,
  },
  senderName: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  messageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  messageTextOwn: {
    color: colors.text,
  },
  messageTime: {
    alignSelf: 'flex-end',
    color: colors.textSoft,
    fontSize: 10,
    marginTop: 6,
  },
  messageTimeOwn: {
    color: '#EDE9FE',
  },
  composer: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  galleryButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 17,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  galleryButtonText: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 26,
  },
  messageInput: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    color: colors.text,
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 17,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  compactSendButton: {
    paddingHorizontal: 12,
  },
  sendButtonText: {
    color: colors.text,
    fontWeight: '900',
  },
});
