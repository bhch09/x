
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
  const [lastReadMessage, setLastReadMessage] = useState(localStorage.getItem('lastReadMessage') || 0);
  const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3');

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
          // Play notification sound when a new message is received
          notificationSound.play().catch(e => console.log("Audio play error:", e));
        }
      });
      
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

          <ChatButton id="xx" onClick={handleStartChat}>
            Go to Chat
            {hasNewMessage && <ButtonNotificationDot />}
          </ChatButton>
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
  top: 20px;
  right: 20px;
  width: 12px;
  height: 12px;
  background-color: #4CAF50;
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const ChapterList = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
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
