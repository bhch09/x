
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

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

const HomePage = ({ onStartChat }) => {
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [user, setUser] = useState(localStorage.getItem('chatUser') || null);
  const [messages, setMessages] = useState([]);
  const [lastReadMessage, setLastReadMessage] = useState(parseInt(localStorage.getItem('lastReadMessage') || '0', 10));
  
  // Create audio object outside component to ensure it's ready
  const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3');
  
  // Play notification sound when a new message is received
  useEffect(() => {
    if (hasNewMessage) {
      notificationSound.play().catch(e => console.log("Audio play error:", e));
    }
  }, [hasNewMessage]);

  // Listen for messages
  useEffect(() => {
    const messagesRef = ref(database, 'messages');
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData = [];
      let hasUnread = false;
      
      snapshot.forEach((childSnapshot) => {
        const message = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
        messagesData.push(message);
        
        // Check if this is a new message from the other user
        if (user && message.sender !== user && message.timestamp > lastReadMessage) {
          hasUnread = true;
        }
      });
      
      // Play sound if there's a new unread message (only when status changes from no unread to having unread)
      if (hasUnread && !hasNewMessage) {
        notificationSound.play().catch(e => console.log("Audio play error:", e));
      }
      
      setMessages(messagesData);
      setHasNewMessage(hasUnread);
      
      // Update document title if there's a new message
      if (hasUnread) {
        document.title = "New Message! - CBSE Science Notes";
      } else {
        document.title = "CBSE Science Notes - Physics Wallah";
      }
    });

    return () => unsubscribe();
  }, [user, lastReadMessage]);

  // Handle starting chat and updating the last read message timestamp
  const handleStartChat = () => {
    // Get the timestamp of the latest message
    if (messages.length > 0) {
      const latestTimestamp = Math.max(...messages.map(msg => msg.timestamp || 0));
      localStorage.setItem('lastReadMessage', latestTimestamp);
    }
    
    // Check if user is logged in
    if (!user) {
      // If no user is logged in, we'll proceed to chat which will show login screen
      console.log("No user logged in, will be redirected to login");
    }
    
    onStartChat();
  };

  return (
    <div>
      <Header>
        <h1>CBSE Science Notes for Board and Olympiad</h1>
        <p>Comprehensive Revision Notes</p>
        {hasNewMessage && <NotificationDot />}
      </Header>

      <Container>
        <ChapterList>
          {/* Chapter 1 */}
          <ChapterCard>
            <ChapterTitle>Chapter 1: Chemical Reactions and Equations</ChapterTitle>
            <ImportantPoints>
              <h3>Key Topics:</h3>
              <TopicList>
                <TopicItem>Chemical Reactions and their Representation</TopicItem>
                <TopicItem>Types of Chemical Reactions</TopicItem>
                <TopicItem>Oxidation and Reduction</TopicItem>
                <TopicItem>Balancing Chemical Equations</TopicItem>
              </TopicList>
            </ImportantPoints>
            <DownloadBtn>Download Notes</DownloadBtn>
          </ChapterCard>

          {/* Chapter 2 */}
          <ChapterCard>
            <ChapterTitle>Chapter 2: Acids, Bases and Salts</ChapterTitle>
            <ImportantPoints>
              <h3>Key Topics:</h3>
              <TopicList>
                <TopicItem>Properties of Acids and Bases</TopicItem>
                <TopicItem>pH Scale and Indicators</TopicItem>
                <TopicItem>Neutralization Reactions</TopicItem>
                <TopicItem>Types of Salts and their Uses</TopicItem>
              </TopicList>
            </ImportantPoints>
            <DownloadBtn>Download Notes</DownloadBtn>
          </ChapterCard>

          {/* Chapter 3 */}
          <ChapterCard>
            <ChapterTitle>Chapter 3: Metals and Non-metals</ChapterTitle>
            <ImportantPoints>
              <h3>Key Topics:</h3>
              <TopicList>
                <TopicItem>Physical Properties of Metals and Non-metals</TopicItem>
                <TopicItem>Chemical Properties of Metals</TopicItem>
                <TopicItem>Reactivity Series</TopicItem>
                <TopicItem>Extraction of Metals</TopicItem>
              </TopicList>
            </ImportantPoints>
            <DownloadBtn>Download Notes</DownloadBtn>
          </ChapterCard>

          {/* Chapter 4 */}
          <ChapterCard>
            <ChapterTitle>Chapter 4: Carbon and its Compounds</ChapterTitle>
            <ImportantPoints>
              <h3>Key Topics:</h3>
              <TopicList>
                <TopicItem>Bonding in Carbon Compounds</TopicItem>
                <TopicItem>Saturated and Unsaturated Carbon Compounds</TopicItem>
                <TopicItem>Functional Groups</TopicItem>
                <TopicItem>Alcohols, Carboxylic Acids, and Ethers</TopicItem>
              </TopicList>
            </ImportantPoints>
            <ChatButton className="xx" onClick={handleStartChat}>Download Notes</ChatButton>
          </ChapterCard>

          {/* Chapter 5 */}
          <ChapterCard>
            <ChapterTitle>Chapter 5: Life Processes</ChapterTitle>
            <ImportantPoints>
              <h3>Key Topics:</h3>
              <TopicList>
                <TopicItem>Nutrition in Plants and Animals</TopicItem>
                <TopicItem>Respiration</TopicItem>
                <TopicItem>Transportation in Plants and Animals</TopicItem>
                <TopicItem>Excretion in Plants and Animals</TopicItem>
              </TopicList>
            </ImportantPoints>
            <DownloadBtn>Download Notes</DownloadBtn>
          </ChapterCard>
        </ChapterList>
      </Container>
    </div>
  );
};

// Styled components
const Header = styled.div`
  text-align: center;
  padding: 40px 0;
  background-color: #004685;
  color: white;
  position: relative;
`;

const NotificationDot = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 14px;
  height: 14px;
  background-color: #4CAF50;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 130px); /* Adjust height based on header */
`;

const ChapterList = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  overflow-y: auto;
  padding-bottom: 20px;
`;

const ChapterCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  padding: 20px;
  width: 100%;
`;

const ChapterTitle = styled.h2`
  color: #004685;
  margin-bottom: 15px;
`;

const ImportantPoints = styled.div`
  background-color: #e9f5ff;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
`;

const TopicList = styled.ul`
  margin-left: 20px;
`;

const TopicItem = styled.li`
  margin: 10px 0;
`;

const DownloadBtn = styled.button`
  background-color: #004685;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 10px 0;
`;

const ChatButton = styled.button`
  background-color: #004685;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 20px 0;
  font-size: 16px;
  position: relative;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #003366;
  }
`;

const ButtonNotificationDot = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  background-color: #4CAF50;
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
`;

export default HomePage;
