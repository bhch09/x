
import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  onValue, 
  push, 
  set, 
  update, 
  remove, 
  serverTimestamp,
  query,
  orderByChild,
  onDisconnect as fbOnDisconnect
} from 'firebase/database';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { FiSend, FiLogOut, FiTrash2, FiImage, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { BsEmojiSmile, BsReply } from 'react-icons/bs';
import { RiFileGifLine } from 'react-icons/ri';
import Emoji from 'react-emoji-render';
import TextareaAutosize from 'react-textarea-autosize';
import EmojiPicker from 'emoji-picker-react';
import HomePage from './HomePage';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCmqS52ypihassF4hYlFnfNr5VMxxlYsis",
  authDomain: "project-6a7c4.firebaseapp.com",
  databaseURL: "https://project-6a7c4-default-rtdb.firebaseio.com",
  projectId: "project-6a7c4",
  storageBucket: "project-6a7c4.appspot.com",
  messagingSenderId: "152367969169",
  appId: "1:152367969169:web:6bc05a9d8152391e07e030"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Theme
const theme = {
  background: '#121212',
  primary: '#1a1a1a',
  secondary: '#252525',
  accent: '#6a5acd',
  text: '#f5f5f5',
  textSecondary: '#a0a0a0',
  userR: '#5b68ff',
  userB: '#ff5b87',
};

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    -webkit-tap-highlight-color: transparent;
  }
  
  html {
    height: -webkit-fill-available;
  }
  
  body {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    height: 100vh;
    height: -webkit-fill-available;
    overflow: hidden;
    position: fixed;
    width: 100%;
    touch-action: manipulation;
  }
  
  #root {
    height: 100vh;
    height: -webkit-fill-available;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
`;

// Styled components
const Container = styled.div`
  height: 100vh;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  
  @media (min-width: 768px) {
    width: 100%;
    max-width: 100%;
    height: 100vh;
  }
  
  @media (max-width: 480px) {
    height: 100vh;
    /* Fix for mobile browsers with address bar */
    height: -webkit-fill-available;
  }
`;

const LoginContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background-color: ${props => props.theme.background};
  padding: 0 20px;
`;

const LoginTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 20px;
  color: ${props => props.theme.text};
  text-align: center;
`;

const UserButton = styled.button`
  padding: 15px 30px;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.$userColor === 'R' ? props.theme.userR : props.theme.userB};
  color: white;
  width: 100%;
  max-width: 250px;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: ${props => props.theme.primary};
  border-bottom: 1px solid ${props => props.theme.secondary};
`;

const HeaderTitle = styled.h1`
  font-size: 1.2rem;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.secondary};
  }
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.primary};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.secondary};
    border-radius: 3px;
  }
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$sent ? 'flex-end' : 'flex-start'};
  margin-bottom: 15px;
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 12px 15px;
  border-radius: 18px;
  background-color: ${props => {
    if (props.$sent) {
      return props.theme[props.$userColor === 'R' ? 'userR' : 'userB'];
    }
    return props.theme.secondary;
  }};
  color: ${props => props.theme.text};
  word-break: break-word;
  position: relative;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
    
    .message-actions {
      opacity: 1;
    }
  }
  
  @media (max-width: 480px) {
    max-width: 85%;
    padding: 10px 12px;
  }
`;

const ReplyContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 8px;
  border-left: 3px solid ${props => props.theme.accent};
`;

const ReplyText = styled.p`
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 4px;
`;

const MessageText = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.4;
`;

const MessageImage = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  margin-top: 5px;
  cursor: pointer;
`;

const MessageActions = styled.div`
  position: absolute;
  top: -20px;
  right: 0;
  background-color: ${props => props.theme.primary};
  border-radius: 8px;
  display: flex;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
`;

const MessageInfo = styled.div`
  font-size: 0.7rem;
  color: ${props => props.theme.textSecondary};
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ReadReceipt = styled.div`
  display: flex;
  margin-left: 5px;
`;

const TypingIndicator = styled.div`
  padding: 5px 8px;
  border-radius: 12px;
  background-color: ${props => props.theme.secondary};
  color: ${props => props.theme.textSecondary};
  align-self: flex-start;
  margin-bottom: 5px;
  font-style: italic;
  position: sticky;
  bottom: 0;
  z-index: 10;
  width: fit-content;
  font-size: 0.7rem;
`;

const InputArea = styled.div`
  padding: 15px;
  background-color: ${props => props.theme.primary};
  border-top: 1px solid ${props => props.theme.secondary};
  position: relative;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  background-color: ${props => props.theme.secondary};
  border-radius: 24px;
  padding: 8px 15px;
  animation: slideUp 0.3s ease-in-out;
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const TextInput = styled(TextareaAutosize)`
  flex: 1;
  background: none;
  border: none;
  color: ${props => props.theme.text};
  font-size: 1rem;
  resize: none;
  outline: none;
  max-height: 120px;
  padding: 5px 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.secondary};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.accent};
    border-radius: 3px;
  }
`;

const SendButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.accent};
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
`;

const IconActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.textSecondary};
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  transition: color 0.2s;
  
  &:hover {
    color: ${props => props.theme.text};
  }
`;

const EmojiPickerContainer = styled.div`
  position: absolute;
  bottom: 80px;
  right: 15px;
  left: 15px;
  z-index: 100;
  background-color: ${props => props.theme.primary};
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
  padding: 10px;
  max-height: 300px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 480px) {
    bottom: 70px;
  }
`;

const ReplyPreview = styled.div`
  background-color: ${props => props.theme.secondary};
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-left: 3px solid ${props => props.theme.accent};
`;

const ReplyPreviewText = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 90%;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  font-size: 1rem;
`;

const ImagePreview = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  position: relative;
`;

const PreviewImage = styled.img`
  max-height: 200px;
  max-width: 100%;
  border-radius: 8px;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const FileInput = styled.input`
  display: none;
`;

const FullscreenImage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const FullscreenImageContent = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
`;

// Helper function to format date
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Common emoji list for quick selection
const commonEmojis = [
  '😀', '😂', '😊', '😍', '🥰', '😎', '😭', '😢', '🙄', '😴', 
  '👍', '👎', '👏', '🙏', '🔥', '❤️', '💕', '💯', '✅', '🎉',
  '🤔', '🤣', '😅', '😁', '😉', '😋', '😘', '🤗', '😪', '😱',
  '👋', '🤝', '✌️', '👌', '🤞', '🙌', '💪', '👀', '🧠', '💩'
];

// Main component
export default function App() {
  // State
  const [user, setUser] = useState(localStorage.getItem('chatUser') || null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [userStatus, setUserStatus] = useState({ R: false, B: false });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [userTyping, setUserTyping] = useState(null);
  const [image, setImage] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [windowFocus, setWindowFocus] = useState(true);
  const [showHomePage, setShowHomePage] = useState(
    localStorage.getItem('showChatInterface') !== 'true'
  );
  
  const messageListRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  let typingTimeout = useRef(null);

  // Firebase references
  const messagesRef = ref(database, 'messages');
  const statusRef = ref(database, 'status');
  const typingRef = ref(database, 'typing');
  const presenceRef = ref(database, 'presence');

  // Track window focus for accurate online status
  useEffect(() => {
    const handleFocus = () => setWindowFocus(true);
    const handleBlur = () => setWindowFocus(false);
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Update presence status based on window focus
  useEffect(() => {
    if (user) {
      const userPresenceRef = ref(database, `presence/${user}`);
      set(userPresenceRef, windowFocus);
    }
  }, [windowFocus, user]);

  // Listen for user login/logout and handle disconnects
  useEffect(() => {
    if (user) {
      // Update user status when logged in
      const userStatusRef = ref(database, `status/${user}`);
      set(userStatusRef, true);
      
      // Set up disconnect handler
      const userPresenceRef = ref(database, `presence/${user}`);
      set(userPresenceRef, true);
      fbOnDisconnect(userStatusRef).set(false);
      fbOnDisconnect(userPresenceRef).set(false);

      return () => {
        // Cleanup function for component unmount
        set(userStatusRef, false);
        set(userPresenceRef, false);
      };
    } else if (!showHomePage) {
      // If no user and not on homepage, go to homepage
      setShowHomePage(true);
      localStorage.removeItem('showChatInterface');
    }
  }, [user, showHomePage]);

  // Listen for status changes
  useEffect(() => {
    const statusUnsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserStatus(snapshot.val());
      }
    });
    
    const presenceUnsubscribe = onValue(presenceRef, (snapshot) => {
      // This will be used for real-time presence (active in window)
      // The UI will use this for showing "online" status
    });

    return () => {
      statusUnsubscribe();
      presenceUnsubscribe();
    };
  }, []);

  // Listen for typing status
  useEffect(() => {
    const unsubscribe = onValue(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const typingUsers = snapshot.val();
        if (user && typingUsers) {
          const otherUser = user === 'R' ? 'B' : 'R';
          setUserTyping(typingUsers[otherUser] ? otherUser : null);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for messages
  useEffect(() => {
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      try {
        const messagesData = [];
        snapshot.forEach((childSnapshot) => {
          const message = {
            id: childSnapshot.key,
            ...childSnapshot.val()
          };
          messagesData.push(message);
        });
        
        setMessages(messagesData);
        
        if (!showHomePage) {
          setTimeout(scrollToBottom, 100);
        }
        
        // Only mark messages as read if on chat screen and window is focused
        if (user && windowFocus && !showHomePage) {
          messagesData.forEach(message => {
            if (message.sender !== user && !message.read) {
              const messageRef = ref(database, `messages/${message.id}`);
              update(messageRef, { read: true });
            }
          });
        }
      } catch (error) {
        console.error("Error processing messages:", error);
      }
    });

    return () => unsubscribe();
  }, [user, windowFocus, showHomePage]);

  // Login handler
  const handleLogin = (selectedUser) => {
    setUser(selectedUser);
    localStorage.setItem('chatUser', selectedUser);
    
    // Update user status when logged in
    const userStatusRef = ref(database, `status/${selectedUser}`);
    set(userStatusRef, true);
    
    // Ensure we stay on chat interface after login
    setShowHomePage(false);
    localStorage.setItem('showChatInterface', 'true');
  };

  // Logout handler
  const handleLogout = () => {
    if (user) {
      const userStatusRef = ref(database, `status/${user}`);
      set(userStatusRef, false);
      
      localStorage.removeItem('chatUser');
      setUser(null);
    }
  };

  // Send message handler
  const sendMessage = () => {
    if ((!messageInput.trim() && !image) || !user) return;

    const messageData = {
      text: messageInput.trim(),
      image: image,
      sender: user,
      timestamp: Date.now(),
      read: false
    };

    if (replyTo) {
      messageData.replyTo = replyTo.id;
      setReplyTo(null);
    }

    const newMessageRef = push(messagesRef);
    set(newMessageRef, messageData);

    setMessageInput('');
    setImage(null);
    
    // Stop typing indicator
    const typingUserRef = ref(database, `typing/${user}`);
    set(typingUserRef, false);
    
    clearTimeout(typingTimeout.current);
    
    // Focus the input again on mobile to prevent keyboard retraction
    if (window.innerWidth <= 768 && inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Typing indicator handler
  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    
    const typingUserRef = ref(database, `typing/${user}`);
    
    if (e.target.value.trim()) {
      set(typingUserRef, true);
    } else {
      set(typingUserRef, false);
    }
    
    clearTimeout(typingTimeout.current);
    
    typingTimeout.current = setTimeout(() => {
      set(typingUserRef, false);
    }, 2000);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    // If Enter is pressed without Shift, send message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll to bottom of message list
  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  // Add emoji to message
  const addEmoji = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Reply to message
  const handleReply = (message) => {
    setReplyTo(message);
  };

  // Delete all messages
  const handleDeleteChat = () => {
    if (window.confirm('Are you sure you want to delete the entire chat? This cannot be undone.')) {
      remove(messagesRef);
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Navigate to home page
  const goToHomePage = () => {
    setShowHomePage(true);
    localStorage.removeItem('showChatInterface');
  };
  
  // Handle browser back button
  useEffect(() => {
    const handleBackButton = () => {
      if (!showHomePage) {
        goToHomePage();
      }
    };
    
    window.addEventListener('popstate', handleBackButton);
    
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [showHomePage]);

  // Navigate to chat
  const goToChat = () => {
    setShowHomePage(false);
    // Store that user is in chat interface so if page refreshes, 
    // they stay in chat interface
    localStorage.setItem('showChatInterface', 'true');
    
    // Mark all messages as read
    if (user) {
      messages.forEach(message => {
        if (message.sender !== user && !message.read) {
          const messageRef = ref(database, `messages/${message.id}`);
          update(messageRef, { read: true });
        }
      });
    }
    
    // Update last read timestamp in localStorage
    const latestTimestamp = Math.max(...messages.map(msg => msg.timestamp || 0), 0);
    localStorage.setItem('lastReadMessage', latestTimestamp);
  };

  // Render home page first
  if (showHomePage) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <HomePage onStartChat={goToChat} />
      </ThemeProvider>
    );
  }

  // Render login screen if not authenticated and trying to access chat
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <LoginContainer>
          <LoginTitle>Choose Your User</LoginTitle>
          <UserButton $userColor="R" onClick={() => handleLogin('R')}>User R</UserButton>
          <UserButton $userColor="B" onClick={() => handleLogin('B')}>User B</UserButton>
        </LoginContainer>
      </ThemeProvider>
    );
  }

  // Group messages by date
  const messagesByDate = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // Auto-scroll when typing indicator appears
  useEffect(() => {
    if (userTyping) {
      scrollToBottom();
    }
  }, [userTyping]);

  // Emoji picker component styling
  const EmojiPickerWrapper = styled.div`
    position: absolute;
    bottom: 80px;
    left: 15px;
    z-index: 100;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.3);

    @media (max-width: 480px) {
      bottom: 70px;
      left: 15px;
      right: 15px;
      width: auto;
    }

    & .EmojiPickerReact {
      --epr-bg-color: ${props => props.theme.primary};
      --epr-category-label-bg-color: ${props => props.theme.secondary};
      --epr-text-color: ${props => props.theme.text};
      --epr-search-input-bg-color: ${props => props.theme.secondary};
      --epr-hover-bg-color: ${props => props.theme.secondary};
      height: 350px !important;
      width: 100% !important;
    }
  `;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Container>
        <Header>
          <HeaderActions>
            <IconButton onClick={goToHomePage} title="Back to Home">
              <FiArrowLeft />
            </IconButton>
            <HeaderTitle>
              {user === 'R' ? 'Chat with User B' : 'Chat with User R'}
            </HeaderTitle>
          </HeaderActions>
          <ActionButtons>
            <IconButton onClick={handleDeleteChat} title="Delete Chat">
              <FiTrash2 />
            </IconButton>
            <IconButton onClick={handleLogout} title="Logout">
              <FiLogOut />
            </IconButton>
          </ActionButtons>
        </Header>

        <MessageList ref={messageListRef}>
          {Object.entries(messagesByDate).map(([date, dateMessages]) => (
            <React.Fragment key={date}>
              <div style={{ textAlign: 'center', margin: '20px 0', color: theme.textSecondary, fontSize: '0.8rem' }}>
                {date}
              </div>
              {dateMessages.map((message) => {
                const isSent = message.sender === user;
                const replyMessage = message.replyTo && messages.find(m => m.id === message.replyTo);
                
                return (
                  <MessageGroup key={message.id} $sent={isSent}>
                    <MessageBubble 
                      $sent={isSent} 
                      $userColor={message.sender}
                      onDoubleClick={() => handleReply(message)}
                    >
                      {replyMessage && (
                        <ReplyContainer>
                          <ReplyText>{replyMessage.sender}: {replyMessage.text}</ReplyText>
                        </ReplyContainer>
                      )}
                      
                      {message.text && <MessageText><Emoji text={message.text} /></MessageText>}
                      
                      {message.image && (
                        <>
                          <MessageImage 
                            src={message.image} 
                            alt="Shared media" 
                            onClick={() => setFullscreenImage(message.image)}
                          />
                        </>
                      )}
                      
                      <MessageActions className="message-actions">
                        <IconActionButton onClick={() => handleReply(message)}>
                          <BsReply />
                        </IconActionButton>
                      </MessageActions>
                    </MessageBubble>
                    
                    <MessageInfo>
                      {formatTime(message.timestamp)}
                      {isSent && (
                        <ReadReceipt>
                          {message.read ? (
                            <>
                              <FiCheck style={{ color: '#4CAF50', marginRight: '-4px' }} />
                              <FiCheck style={{ color: '#4CAF50' }} />
                            </>
                          ) : (
                            <FiCheck />
                          )}
                        </ReadReceipt>
                      )}
                    </MessageInfo>
                  </MessageGroup>
                );
              })}
            </React.Fragment>
          ))}
          
          {userTyping && (
            <TypingIndicator>
              User {userTyping} is typing...
            </TypingIndicator>
          )}
        </MessageList>

        <InputArea>
          {replyTo && (
            <ReplyPreview>
              <ReplyPreviewText>
                <BsReply style={{ marginRight: '5px' }} />
                Replying to {replyTo.sender}: {replyTo.text}
              </ReplyPreviewText>
              <CloseButton onClick={() => setReplyTo(null)}>✕</CloseButton>
            </ReplyPreview>
          )}
          
          {image && (
            <ImagePreview>
              <PreviewImage src={image} alt="Upload preview" />
              <RemoveImageButton onClick={() => setImage(null)}>✕</RemoveImageButton>
            </ImagePreview>
          )}
          
          <InputContainer>
            <IconActionButton onClick={() => fileInputRef.current.click()}>
              <FiImage />
              <FileInput 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </IconActionButton>
            
            <IconActionButton 
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
              }}
            >
              <BsEmojiSmile />
            </IconActionButton>
            
            <TextInput
              ref={inputRef}
              value={messageInput}
              onChange={handleTyping}
              onKeyDown={handleKeyPress}
              onClick={() => {
                if (showEmojiPicker) setShowEmojiPicker(false);
              }}
              placeholder="Type a message..."
              minRows={1}
              maxRows={5}
            />
            
            <SendButton onClick={sendMessage}>
              <FiSend />
            </SendButton>
          </InputContainer>
          
          {showEmojiPicker && (
            <EmojiPickerWrapper>
              <EmojiPicker
                onEmojiClick={(emojiObj) => {
                  setMessageInput(prev => prev + emojiObj.emoji);
                  // Don't close picker after selection so user can pick multiple emojis
                }}
                searchDisabled={false}
                lazyLoadEmojis={true}
                skinTonesDisabled={false}
              />
            </EmojiPickerWrapper>
          )}
        </InputArea>
        
        {fullscreenImage && (
          <FullscreenImage onClick={() => setFullscreenImage(null)}>
            <FullscreenImageContent src={fullscreenImage} alt="Fullscreen view" />
          </FullscreenImage>
        )}
      </Container>
    </ThemeProvider>
  );
}
