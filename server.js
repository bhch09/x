
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store messages in memory (in a real app, you'd use a database)
let messages = [];
const STORAGE_FILE = path.join(process.cwd(), 'messages.json');

// Load messages from file if exists
try {
  if (fs.existsSync(STORAGE_FILE)) {
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    messages = JSON.parse(data);
  }
} catch (err) {
  console.error('Error loading messages:', err);
}

// Save messages to file
const saveMessages = () => {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(messages), 'utf8');
  } catch (err) {
    console.error('Error saving messages:', err);
  }
};

// Connected users
const users = {
  R: { online: false, typing: false },
  B: { online: false, typing: false }
};

io.on('connection', (socket) => {
  console.log('New client connected');
  let currentUser = null;

  // User login
  socket.on('login', (user) => {
    if (user === 'R' || user === 'B') {
      currentUser = user;
      users[user].online = true;
      users[user].socketId = socket.id;
      socket.join(user);
      
      io.emit('userStatus', users);
      socket.emit('initialMessages', messages);
      console.log(`User ${user} logged in`);
    }
  });

  // Send message
  socket.on('sendMessage', (message) => {
    if (!currentUser) return;
    
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      sender: currentUser,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    messages.push(newMessage);
    io.emit('newMessage', newMessage);
    saveMessages();
  });

  // Mark message as read
  socket.on('markAsRead', (messageId) => {
    if (!currentUser) return;
    
    const message = messages.find(msg => msg.id === messageId);
    if (message && message.sender !== currentUser) {
      message.read = true;
      io.emit('messageRead', messageId);
      saveMessages();
    }
  });

  // Typing indicator
  socket.on('typing', (isTyping) => {
    if (!currentUser) return;
    
    users[currentUser].typing = isTyping;
    io.emit('userTyping', { user: currentUser, isTyping });
  });

  // Message reply
  socket.on('replyToMessage', (data) => {
    if (!currentUser) return;
    
    const newMessage = {
      ...data.message,
      id: Date.now().toString(),
      sender: currentUser,
      timestamp: new Date().toISOString(),
      replyTo: data.replyToId,
      read: false
    };
    
    messages.push(newMessage);
    io.emit('newMessage', newMessage);
    saveMessages();
  });

  // Delete chat
  socket.on('deleteChat', () => {
    messages = [];
    io.emit('chatDeleted');
    saveMessages();
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (currentUser) {
      users[currentUser].online = false;
      users[currentUser].typing = false;
      io.emit('userStatus', users);
      console.log(`User ${currentUser} disconnected`);
    }
  });

  // Logout
  socket.on('logout', () => {
    if (currentUser) {
      users[currentUser].online = false;
      users[currentUser].typing = false;
      currentUser = null;
      io.emit('userStatus', users);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
