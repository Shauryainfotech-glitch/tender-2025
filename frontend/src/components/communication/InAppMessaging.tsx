import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  InputAdornment,
  Badge,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
  Alert,
  Fab,
  Zoom,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  AvatarGroup,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  VolumeOff as MuteIcon,
  VolumeUp as UnmuteIcon,
  Block as BlockIcon,
  Report as ReportIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Videocam as VideoIcon,
  Phone as PhoneIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { communicationService } from '../../services/communicationService';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
  role?: string;
  department?: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  attachments?: MessageAttachment[];
  replyTo?: string;
  edited?: boolean;
  editedAt?: Date;
}

interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
}

interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: User[];
  name?: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`messaging-tabpanel-${index}`}
      aria-labelledby={`messaging-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
}

const InAppMessaging: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentMenu, setAttachmentMenu] = useState<null | HTMLElement>(null);
  const [conversationMenu, setConversationMenu] = useState<null | HTMLElement>(null);
  const [messageMenu, setMessageMenu] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, User>>({});

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadConversations();
    loadUsers();
    setupWebSocket();

    return () => {
      // Cleanup WebSocket connection
      communicationService.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await communicationService.getConversations({
        includeArchived: tabValue === 2,
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await communicationService.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await communicationService.getMessages(conversationId);
      setMessages(response.data);
      markMessagesAsRead(conversationId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const setupWebSocket = () => {
    // Setup WebSocket for real-time messaging
    communicationService.onMessage((message: Message) => {
      if (message.conversationId === activeConversation?.id) {
        setMessages(prev => [...prev, message]);
        markMessagesAsRead(message.conversationId);
      }
      updateConversationLastMessage(message);
    });

    communicationService.onTyping((data: { userId: string; conversationId: string; isTyping: boolean }) => {
      if (data.conversationId === activeConversation?.id) {
        if (data.isTyping) {
          const user = users.find(u => u.id === data.userId);
          if (user) {
            setTypingUsers(prev => ({ ...prev, [data.userId]: user }));
          }
        } else {
          setTypingUsers(prev => {
            const { [data.userId]: _, ...rest } = prev;
            return rest;
          });
        }
      }
    });

    communicationService.onUserStatusChange((data: { userId: string; status: User['status'] }) => {
      setUsers(prev => prev.map(user => 
        user.id === data.userId ? { ...user, status: data.status } : user
      ));
    });
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !activeConversation) return;

    setSending(true);
    try {
      const messageData = {
        conversationId: activeConversation.id,
        content: messageText,
        replyTo: replyingTo?.id,
      };

      const response = await communicationService.sendMessage(messageData);
      setMessages(prev => [...prev, response.data]);
      setMessageText('');
      setReplyingTo(null);
      updateConversationLastMessage(response.data);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!activeConversation) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    formData.append('conversationId', activeConversation.id);

    try {
      const response = await communicationService.uploadAttachments(formData);
      // Handle uploaded files
      const message = response.data;
      setMessages(prev => [...prev, message]);
      updateConversationLastMessage(message);
    } catch (error) {
      console.error('Failed to upload files:', error);
    }
  };

  const createNewConversation = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const data = {
        type: selectedUsers.length === 1 ? 'direct' : 'group',
        participantIds: selectedUsers,
        name: groupName || undefined,
      };

      const response = await communicationService.createConversation(data);
      const newConversation = response.data;
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      setShowNewChatDialog(false);
      setSelectedUsers([]);
      setGroupName('');
      loadMessages(newConversation.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await communicationService.markAsRead(conversationId);
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const updateConversationLastMessage = (message: Message) => {
    setConversations(prev => prev.map(conv => 
      conv.id === message.conversationId
        ? { ...conv, lastMessage: message, updatedAt: new Date() }
        : conv
    ));
  };

  const handleTyping = () => {
    if (!activeConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      communicationService.sendTypingIndicator(activeConversation.id, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      communicationService.sendTypingIndicator(activeConversation.id, false);
    }, 3000);
  };

  const toggleConversationPin = async (conversation: Conversation) => {
    try {
      await communicationService.togglePin(conversation.id);
      setConversations(prev => prev.map(conv => 
        conv.id === conversation.id ? { ...conv, isPinned: !conv.isPinned } : conv
      ));
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const toggleConversationMute = async (conversation: Conversation) => {
    try {
      await communicationService.toggleMute(conversation.id);
      setConversations(prev => prev.map(conv => 
        conv.id === conversation.id ? { ...conv, isMuted: !conv.isMuted } : conv
      ));
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  };

  const archiveConversation = async (conversation: Conversation) => {
    try {
      await communicationService.archiveConversation(conversation.id);
      setConversations(prev => prev.filter(conv => conv.id !== conversation.id));
      if (activeConversation?.id === conversation.id) {
        setActiveConversation(null);
      }
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  const deleteMessage = async (message: Message) => {
    try {
      await communicationService.deleteMessage(message.id);
      setMessages(prev => prev.filter(m => m.id !== message.id));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    }
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat';
    }
    const otherParticipant = conversation.participants.find(p => p.id !== 'currentUserId'); // Replace with actual current user ID
    return otherParticipant?.name || 'Unknown User';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.avatar;
    }
    const otherParticipant = conversation.participants.find(p => p.id !== 'currentUserId');
    return otherParticipant?.avatar;
  };

  const filteredConversations = conversations.filter(conv => {
    if (tabValue === 1 && !conv.isPinned) return false;
    if (tabValue === 2 && !conv.isArchived) return false;
    if (tabValue === 0 && (conv.isArchived || conv.isPinned)) return false;

    if (searchTerm) {
      const name = getConversationName(conv).toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Conversations List */}
      <Paper
        sx={{
          width: 350,
          display: 'flex',
          flexDirection: 'column',
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Messages</Typography>
            <IconButton onClick={() => setShowNewChatDialog(true)}>
              <AddIcon />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            size="small"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All" />
          <Tab label="Pinned" />
          <Tab label="Archived" />
        </Tabs>

        {/* Conversations List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : filteredConversations.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No conversations found
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredConversations.map((conversation) => (
                <ListItem
                  key={conversation.id}
                  button
                  selected={activeConversation?.id === conversation.id}
                  onClick={() => {
                    setActiveConversation(conversation);
                    loadMessages(conversation.id);
                  }}
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                  <ListItemAvatar>
                    <Badge
                      color="success"
                      variant="dot"
                      invisible={
                        conversation.type === 'group' ||
                        conversation.participants.find(p => p.id !== 'currentUserId')?.status !== 'online'
                      }
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                      <Avatar src={getConversationAvatar(conversation)}>
                        {conversation.type === 'group' ? <GroupIcon /> : <PersonIcon />}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="subtitle2" noWrap>
                          {getConversationName(conversation)}
                        </Typography>
                        {conversation.isPinned && <StarIcon fontSize="small" color="primary" />}
                        {conversation.isMuted && <MuteIcon fontSize="small" color="action" />}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">
                        {conversation.lastMessage &&
                          formatDistanceToNow(new Date(conversation.lastMessage.timestamp), {
                            addSuffix: true,
                          })}
                      </Typography>
                      {conversation.unreadCount > 0 && (
                        <Chip
                          label={conversation.unreadCount}
                          size="small"
                          color="primary"
                          sx={{ mt: 0.5, height: 20, minWidth: 20 }}
                        />
                      )}
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* Chat Area */}
      {activeConversation ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Chat Header */}
          <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }} elevation={0}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={getConversationAvatar(activeConversation)}>
                  {activeConversation.type === 'group' ? <GroupIcon /> : <PersonIcon />}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {getConversationName(activeConversation)}
                  </Typography>
                  {activeConversation.type === 'direct' && (
                    <Typography variant="caption" color="text.secondary">
                      {activeConversation.participants.find(p => p.id !== 'currentUserId')?.status || 'offline'}
                    </Typography>
                  )}
                  {activeConversation.type === 'group' && (
                    <Typography variant="caption" color="text.secondary">
                      {activeConversation.participants.length} members
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box>
                <IconButton>
                  <PhoneIcon />
                </IconButton>
                <IconButton>
                  <VideoIcon />
                </IconButton>
                <IconButton>
                  <InfoIcon />
                </IconButton>
                <IconButton
                  onClick={(e) => setConversationMenu(e.currentTarget)}
                >
                  <MoreIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>

          {/* Messages Area */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: 'grey.50' }}>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === 'currentUserId'; // Replace with actual current user ID
              const sender = activeConversation.participants.find(p => p.id === message.senderId);

              return (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  {!isOwnMessage && (
                    <Avatar
                      src={sender?.avatar}
                      sx={{ mr: 1, width: 32, height: 32 }}
                    >
                      {sender?.name[0]}
                    </Avatar>
                  )}
                  <Box sx={{ maxWidth: '70%' }}>
                    {activeConversation.type === 'group' && !isOwnMessage && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {sender?.name}
                      </Typography>
                    )}
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: isOwnMessage ? 'primary.main' : 'background.paper',
                        color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                      }}
                      elevation={1}
                    >
                      {message.replyTo && (
                        <Box
                          sx={{
                            borderLeft: 3,
                            borderColor: 'divider',
                            pl: 1,
                            mb: 1,
                            opacity: 0.7,
                          }}
                        >
                          <Typography variant="caption">
                            Replying to
                          </Typography>
                        </Box>
                      )}
                      <Typography variant="body2">{message.content}</Typography>
                      {message.attachments && message.attachments.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {message.attachments.map((attachment) => (
                            <Chip
                              key={attachment.id}
                              label={attachment.name}
                              size="small"
                              icon={
                                attachment.type.startsWith('image/') ? <ImageIcon /> : <FileIcon />
                              }
                              onClick={() => window.open(attachment.url, '_blank')}
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {formatMessageTime(new Date(message.timestamp))}
                        </Typography>
                        {isOwnMessage && (
                          <>
                            {message.status === 'sent' && <DoneIcon sx={{ fontSize: 14 }} />}
                            {message.status === 'delivered' && <DoneAllIcon sx={{ fontSize: 14 }} />}
                            {message.status === 'read' && (
                              <DoneAllIcon sx={{ fontSize: 14, color: 'info.main' }} />
                            )}
                          </>
                        )}
                        {message.edited && (
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            (edited)
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Box>
                  {isOwnMessage && (
                    <IconButton
                      size="small"
                      sx={{ ml: 0.5, opacity: 0 }}
                      onClick={(e) => {
                        setSelectedMessage(message);
                        setMessageMenu(e.currentTarget);
                      }}
                    >
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              );
            })}

            {/* Typing Indicator */}
            {Object.keys(typingUsers).length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                  {Object.values(typingUsers).map((user) => (
                    <Avatar key={user.id} src={user.avatar}>
                      {user.name[0]}
                    </Avatar>
                  ))}
                </AvatarGroup>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {Object.values(typingUsers).map(u => u.name).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
                </Typography>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Reply Preview */}
          {replyingTo && (
            <Paper sx={{ p: 1, mx: 2, mb: 1 }} elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="primary">
                    Replying to
                  </Typography>
                  <Typography variant="body2" noWrap>
                    {replyingTo.content}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setReplyingTo(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          )}

          {/* Message Input */}
          <Paper sx={{ p: 2, borderTop: 1, borderColor: 'divider' }} elevation={0}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
              <IconButton onClick={(e) => setAttachmentMenu(e.currentTarget)}>
                <AttachIcon />
              </IconButton>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <EmojiIcon />
              </IconButton>
              <IconButton
                color="primary"
                onClick={sendMessage}
                disabled={!messageText.trim() || sending}
              >
                {sending ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
            </Box>
          </Paper>
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.50',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Select a conversation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a conversation from the list to start messaging
            </Typography>
          </Box>
        </Box>
      )}

      {/* New Chat Dialog */}
      <Dialog
        open={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Select users</InputLabel>
            <Select
              multiple
              value={selectedUsers}
              onChange={(e) => setSelectedUsers(e.target.value as string[])}
              label="Select users"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const user = users.find(u => u.id === value);
                    return <Chip key={value} label={user?.name} size="small" />;
                  })}
                </Box>
              )}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <ListItemAvatar>
                    <Avatar src={user.avatar}>{user.name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={user.email}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedUsers.length > 1 && (
            <TextField
              fullWidth
              label="Group name (optional)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewChatDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={createNewConversation}
            disabled={selectedUsers.length === 0}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attachment Menu */}
      <Menu
        anchorEl={attachmentMenu}
        open={Boolean(attachmentMenu)}
        onClose={() => setAttachmentMenu(null)}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files) {
              handleFileUpload(e.target.files);
            }
            setAttachmentMenu(null);
          }}
        />
        <MenuItem
          onClick={() => {
            fileInputRef.current?.click();
            setAttachmentMenu(null);
          }}
        >
          <ListItemIcon>
            <FileIcon />
          </ListItemIcon>
          <ListItemText primary="Document" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = 'image/*';
              fileInputRef.current.click();
            }
            setAttachmentMenu(null);
          }}
        >
          <ListItemIcon>
            <ImageIcon />
          </ListItemIcon>
          <ListItemText primary="Image" />
        </MenuItem>
      </Menu>

      {/* Conversation Menu */}
      <Menu
        anchorEl={conversationMenu}
        open={Boolean(conversationMenu)}
        onClose={() => setConversationMenu(null)}
      >
        <MenuItem
          onClick={() => {
            if (activeConversation) {
              toggleConversationPin(activeConversation);
            }
            setConversationMenu(null);
          }}
        >
          <ListItemIcon>
            {activeConversation?.isPinned ? <StarIcon /> : <StarBorderIcon />}
          </ListItemIcon>
          <ListItemText primary={activeConversation?.isPinned ? 'Unpin' : 'Pin'} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeConversation) {
              toggleConversationMute(activeConversation);
            }
            setConversationMenu(null);
          }}
        >
          <ListItemIcon>
            {activeConversation?.isMuted ? <UnmuteIcon /> : <MuteIcon />}
          </ListItemIcon>
          <ListItemText primary={activeConversation?.isMuted ? 'Unmute' : 'Mute'} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeConversation) {
              archiveConversation(activeConversation);
            }
            setConversationMenu(null);
          }}
        >
          <ListItemIcon>
            <ArchiveIcon />
          </ListItemIcon>
          <ListItemText primary="Archive" />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setConversationMenu(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <BlockIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Block User" />
        </MenuItem>
      </Menu>

      {/* Message Menu */}
      <Menu
        anchorEl={messageMenu}
        open={Boolean(messageMenu)}
        onClose={() => setMessageMenu(null)}
      >
        <MenuItem
          onClick={() => {
            if (selectedMessage) {
              setReplyingTo(selectedMessage);
            }
            setMessageMenu(null);
          }}
        >
          Reply
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedMessage) {
              navigator.clipboard.writeText(selectedMessage.content);
            }
            setMessageMenu(null);
          }}
        >
          Copy
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedMessage) {
              deleteMessage(selectedMessage);
            }
            setMessageMenu(null);
          }}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default InAppMessaging;
