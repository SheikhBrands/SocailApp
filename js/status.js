document.addEventListener('DOMContentLoaded', () => {
  protectRoute();
  
  let currentUser = null;
  let selectedFile = null;
  
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      loadStories();
    }
  });
  
  // File upload handling
  document.getElementById('media-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      selectedFile = file;
      
      const preview = document.getElementById('preview-media');
      preview.innerHTML = '';
      
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        preview.appendChild(img);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        preview.appendChild(video);
      }
      
      document.getElementById('upload-prompt').style.display = 'none';
      document.getElementById('upload-preview').style.display = 'block';
    }
  });
  
  // Cancel upload
  document.getElementById('cancel-upload').addEventListener('click', () => {
    selectedFile = null;
    document.getElementById('media-upload').value = '';
    document.getElementById('upload-prompt').style.display = 'flex';
    document.getElementById('upload-preview').style.display = 'none';
  });
  
  // Post story
  document.getElementById('post-story').addEventListener('click', () => {
    if (!selectedFile) return;
    
    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    
    fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`, {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      // Save story to Firestore
      return db.collection('stories').add({
        userId: currentUser.uid,
        mediaUrl: data.secure_url,
        mediaType: selectedFile.type.startsWith('image/') ? 'image' : 'video',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });
    })
    .then(() => {
      alert('Story posted successfully!');
      selectedFile = null;
      document.getElementById('media-upload').value = '';
      document.getElementById('upload-prompt').style.display = 'flex';
      document.getElementById('upload-preview').style.display = 'none';
      loadStories();
    })
    .catch(error => {
      console.error('Error uploading story:', error);
      alert('Error uploading story. Please try again.');
    });
  });
  
  // Post text status
  document.getElementById('post-text-status').addEventListener('click', () => {
    const text = document.getElementById('status-text').value.trim();
    if (!text) return;
    
    db.collection('stories').add({
      userId: currentUser.uid,
      text: text,
      mediaType: 'text',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    })
    .then(() => {
      alert('Text status posted successfully!');
      document.getElementById('status-text').value = '';
      loadStories();
    })
    .catch(error => {
      console.error('Error posting text status:', error);
      alert('Error posting text status. Please try again.');
    });
  });
  
  // Load stories from followed users
  function loadStories() {
    const storiesList = document.getElementById('stories-list');
    
    // First get the list of users the current user follows
    db.collection('users').doc(currentUser.uid).get()
      .then(userDoc => {
        const following = userDoc.data().following || [];
        
        if (following.length === 0) {
          storiesList.innerHTML = '<p>Follow some users to see their stories</p>';
          return;
        }
        
        // Get stories from followed users
        db.collection('stories')
          .where('userId', 'in', following)
          .where('expiresAt', '>', new Date())
          .orderBy('expiresAt')
          .get()
          .then(snapshot => {
            storiesList.innerHTML = '';
            
            if (snapshot.empty) {
              storiesList.innerHTML = '<p>No stories available</p>';
              return;
            }
            
            // Group stories by user
            const storiesByUser = {};
            
            snapshot.forEach(doc => {
              const story = doc.data();
              if (!storiesByUser[story.userId]) {
                storiesByUser[story.userId] = [];
              }
              storiesByUser[story.userId].push({
                id: doc.id,
                ...story
              });
            });
            
            // Display stories
            Object.keys(storiesByUser).forEach(userId => {
              // Get user info
              db.collection('users').doc(userId).get().then(userDoc => {
                const user = userDoc.data();
                const storyItem = document.createElement('div');
                storyItem.className = 'story-item';
                storyItem.dataset.userId = userId;
                
                storyItem.innerHTML = `
                  <div class="story-avatar">
                    <img src="${user.profilePic || 'images/default-profile.png'}" alt="${user.name}">
                  </div>
                  <span>${user.name}</span>
                `;
                
                storyItem.addEventListener('click', () => viewStory(userId, storiesByUser[userId]));
                storiesList.appendChild(storyItem);
              });
            });
          });
      });
  }
  
  // View story
  function viewStory(userId, stories) {
    const viewer = document.getElementById('story-viewer');
    const mediaContainer = document.getElementById('story-media-container');
    
    // Get user info
    db.collection('users').doc(userId).get().then(userDoc => {
      const user = userDoc.data();
      
      document.getElementById('story-user-avatar').src = user.profilePic || 'images/default-profile.png';
      document.getElementById('story-username').textContent = user.name;
      
      // Display first story
      let currentIndex = 0;
      displayStory(stories[currentIndex]);
      
      // Show viewer
      viewer.style.display = 'block';
      
      // Close button
      document.getElementById('close-story').addEventListener('click', () => {
        viewer.style.display = 'none';
      });
      
      // Navigation (click to next)
      mediaContainer.addEventListener('click', () => {
        currentIndex++;
        if (currentIndex < stories.length) {
          displayStory(stories[currentIndex]);
        } else {
          viewer.style.display = 'none';
        }
      });
    });
    
    function displayStory(story) {
      mediaContainer.innerHTML = '';
      document.getElementById('story-time').textContent = formatTime(story.createdAt.toDate());
      
      if (story.mediaType === 'text') {
        const textElement = document.createElement('div');
        textElement.className = 'story-text';
        textElement.textContent = story.text;
        mediaContainer.appendChild(textElement);
      } else if (story.mediaType === 'image') {
        const img = document.createElement('img');
        img.src = story.mediaUrl;
        mediaContainer.appendChild(img);
      } else if (story.mediaType === 'video') {
        const video = document.createElement('video');
        video.src = story.mediaUrl;
        video.controls = true;
        video.autoplay = true;
        mediaContainer.appendChild(video);
      }
    }
  }
  
  // Format time
  function formatTime(date) {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
});