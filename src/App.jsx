
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
  orderByChild 
} from 'firebase/database';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { FiSend, FiLogOut, FiTrash2, FiImage, FiCheck } from 'react-icons/fi';
import { BsEmojiSmile, BsReply } from 'react-icons/bs';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import TextareaAutosize from 'react-textarea-autosize';

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
  }
  
  body {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    height: 100vh;
    overflow: hidden;
  }
  
  #root {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;

// Styled components
const Container = styled.div`
  height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  
  @media (min-width: 768px) {
    max-width: 800px;
    height: 100vh;
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
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

const HeaderStatus = styled.div`
  display: flex;
  align-items: center;
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.$online ? '#4CAF50' : '#9e9e9e'};
  margin-right: 5px;
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
  
  &:hover .message-actions {
    opacity: 1;
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
  padding: 8px 12px;
  border-radius: 18px;
  background-color: ${props => props.theme.secondary};
  color: ${props => props.theme.textSecondary};
  align-self: flex-start;
  margin-bottom: 10px;
  font-style: italic;
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
  right: 20px;
  z-index: 100;
  
  @media (max-width: 480px) {
    right: 10px;
    width: 90%;
    em-emoji-picker {
      width: 100%;
    }
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
  
  const messageListRef = useRef(null);
  const fileInputRef = useRef(null);
  let typingTimeout = useRef(null);

  // Firebase references
  const messagesRef = ref(database, 'messages');
  const statusRef = ref(database, 'status');
  const typingRef = ref(database, 'typing');

  // Listen for user login/logout
  useEffect(() => {
    if (user) {
      // Update user status when logged in
      const userStatusRef = ref(database, `status/${user}`);
      set(userStatusRef, true);

      // Set up a cleanup function for when user logs out or disconnects
      const userStatusDisconnectRef = ref(database, `status/${user}`);
      const onDisconnect = onValue(userStatusDisconnectRef, (snapshot) => {
        set(userStatusDisconnectRef, false);
      });

      return () => {
        // Cleanup function for component unmount
        set(userStatusRef, false);
      };
    }
  }, [user]);

  // Listen for status changes
  useEffect(() => {
    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserStatus(snapshot.val());
      }
    });

    return () => unsubscribe();
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
      const messagesData = [];
      snapshot.forEach((childSnapshot) => {
        const message = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
        messagesData.push(message);
      });
      
      setMessages(messagesData);
      setTimeout(scrollToBottom, 100);
      
      // Mark messages as read
      if (user) {
        messagesData.forEach(message => {
          if (message.sender !== user && !message.read) {
            const messageRef = ref(database, `messages/${message.id}`);
            update(messageRef, { read: true });
          }
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Login handler
  const handleLogin = (selectedUser) => {
    setUser(selectedUser);
    localStorage.setItem('chatUser', selectedUser);
    
    // Update user status when logged in
    const userStatusRef = ref(database, `status/${selectedUser}`);
    set(userStatusRef, true);
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
    setIsTyping(false);
    
    // Stop typing indicator
    const typingUserRef = ref(database, `typing/${user}`);
    set(typingUserRef, false);
    
    clearTimeout(typingTimeout.current);
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
  const addEmoji = (e) => {
    setMessageInput(prev => prev + e.native);
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

  // Render login screen
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

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Container>
        <Header>
          <HeaderTitle>
            {user === 'R' ? 'Chat with User B' : 'Chat with User R'}
          </HeaderTitle>
          <HeaderStatus>
            <StatusDot $online={user === 'R' ? userStatus.B : userStatus.R} />
            <span>{user === 'R' ? (userStatus.B ? 'Online' : 'Offline') : (userStatus.R ? 'Online' : 'Offline')}</span>
          </HeaderStatus>
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
                      
                      {message.text && <MessageText>{message.text}</MessageText>}
                      
                      {message.image && (
                        <MessageImage 
                          src={message.image} 
                          alt="Shared media" 
                          onClick={() => setFullscreenImage(message.image)}
                        />
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
                              <FiCheck style={{ color: '#4CAF50' }} />
                              <FiCheck style={{ color: '#4CAF50' }} />
                            </>
                          ) : (
                            <>
                              <FiCheck />
                              <FiCheck />
                            </>
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
            
            <IconActionButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <BsEmojiSmile />
            </IconActionButton>
            
            <TextInput
              value={messageInput}
              onChange={handleTyping}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              minRows={1}
              maxRows={5}
            />
            
            <SendButton onClick={sendMessage}>
              <FiSend />
            </SendButton>
          </InputContainer>
          
          {showEmojiPicker && (
            <EmojiPickerContainer>
              <Picker 
                data={data} 
                onEmojiSelect={addEmoji}
                theme="dark"
                set="google"
              />
            </EmojiPickerContainer>
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
