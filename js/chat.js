document.addEventListener('DOMContentLoaded', () => {
  protectRoute();
  
  let currentUser = null;
  let currentChatId = null;
  
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      loadChats();
      loadOnlineUsers();
    }
  });
  
  // Load user's chats
  function loadChats() {
    const chatList = document.getElementById('chat-list');
    
    db.collection('chats')
      .where('participants', 'array-contains', currentUser.uid)
      .orderBy('lastMessageAt', 'desc')
      .onSnapshot(snapshot => {
        chatList.innerHTML = '';
        
        snapshot.forEach(doc => {
          const chat = doc.data();
          const otherUserId = chat.participants.find(id => id !== currentUser.uid);
          
          // Get other user's details
          db.collection('users').doc(otherUserId).get().then(userDoc => {
            if (userDoc.exists) {
              const userData = userDoc.data();
              const chatItem = document.createElement('div');
              chatItem.className = 'chat-item';
              chatItem.dataset.chatId = doc.id;
              chatItem.dataset.userId = otherUserId;
              
              chatItem.innerHTML = `
                <img src="${userData.profilePic || 'images/default-profile.png'}" alt="${userData.name}">
                <div class="chat-info">
                  <h4>${userData.name}</h4>
                  <p class="last-message">${chat.lastMessage || 'No messages yet'}</p>
                </div>
                <div class="chat-time">${formatTime(chat.lastMessageAt?.toDate())}</div>
              `;
              
              chatItem.addEventListener('click', () => openChat(doc.id, otherUserId));
              chatList.appendChild(chatItem);
            }
          });
        });
      });
  }
  
  // Load online users
  function loadOnlineUsers() {
    const onlineList = document.getElementById('online-list');
    
    // In a real app, you'd track online status more accurately
    db.collection('users')
      .where('profileType', '==', 'public')
      .limit(20)
      .onSnapshot(snapshot => {
        onlineList.innerHTML = '';
        
        snapshot.forEach(doc => {
          if (doc.id !== currentUser.uid) {
            const user = doc.data();
            const onlineItem = document.createElement('div');
            onlineItem.className = 'online-item';
            onlineItem.dataset.userId = doc.id;
            
            onlineItem.innerHTML = `
              <img src="${user.profilePic || 'images/default-profile.png'}" alt="${user.name}">
              <span>${user.name}</span>
              <span class="online-dot"></span>
            `;
            
            onlineItem.addEventListener('click', () => startNewChat(doc.id));
            onlineList.appendChild(onlineItem);
          }
        });
      });
  }
  
  // Start a new chat with a user
  function startNewChat(userId) {
    // Check if chat already exists
    db.collection('chats')
      .where('participants', 'array-contains', currentUser.uid)
      .get()
      .then(snapshot => {
        let existingChat = null;
        
        snapshot.forEach(doc => {
          const chat = doc.data();
          if (chat.participants.includes(userId)) {
            existingChat = doc.id;
          }
        });
        
        if (existingChat) {
          openChat(existingChat, userId);
        } else {
          // Create new chat
          db.collection('chats').add({
            participants: [currentUser.uid, userId],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
          }).then(docRef => {
            openChat(docRef.id, userId);
          });
        }
      });
  }
  
  // Open a chat
  function openChat(chatId, userId) {
    currentChatId = chatId;
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    
    // Show chat input
    chatInput.style.display = 'flex';
    
    // Clear previous messages
    chatMessages.innerHTML = '';
    
    // Load messages
    db.collection('chats').doc(chatId).collection('messages')
      .orderBy('timestamp')
      .onSnapshot(snapshot => {
        chatMessages.innerHTML = '';
        
        snapshot.forEach(doc => {
          const message = doc.data();
          const messageElement = document.createElement('div');
          messageElement.className = `message ${message.sender === currentUser.uid ? 'sent' : 'received'}`;
          
          messageElement.innerHTML = `
            <div class="message-content">${message.text}</div>
            <div class="message-time">${formatTime(message.timestamp?.toDate())}</div>
          `;
          
          chatMessages.appendChild(messageElement);
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
    
    // Set up message sending
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('message-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
  
  // Send a message
  function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (message && currentChatId) {
      // Add message to subcollection
      db.collection('chats').doc(currentChatId).collection('messages').add({
        text: message,
        sender: currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Update last message in chat
      db.collection('chats').doc(currentChatId).update({
        lastMessage: message,
        lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      input.value = '';
    }
  }
  
  // Format time
  function formatTime(date) {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // New chat button
  document.getElementById('new-chat-btn').addEventListener('click', () => {
    // In a real app, you'd show a modal to select a user
    alert('Feature coming soon!');
  });
});