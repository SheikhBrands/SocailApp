document.addEventListener('DOMContentLoaded', () => {
  protectRoute();
  
  let currentUser = null;
  let userData = null;
  
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      loadProfile();
    }
  });
  
  // Load profile data
  function loadProfile() {
    db.collection('users').doc(currentUser.uid).onSnapshot(doc => {
      if (doc.exists) {
        userData = doc.data();
        updateProfileUI(userData);
      }
    });
    
    // Load user's posts
    loadUserPosts();
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-tab`).style.display = 'block';
        
        // Load content for the tab if needed
        switch(btn.dataset.tab) {
          case 'stories':
            loadUserStories();
            break;
          case 'saved':
            loadSavedPosts();
            break;
          default:
            loadUserPosts();
        }
      });
    });
  }
  
  // Update profile UI with user data
  function updateProfileUI(data) {
    document.getElementById('profile-name').textContent = data.name;
    document.getElementById('profile-bio').textContent = data.bio || 'No bio yet';
    document.getElementById('follower-count').textContent = data.followers || 0;
    document.getElementById('following-count').textContent = data.following?.length || 0;
    
    if (data.profilePic) {
      document.getElementById('profile-pic').src = data.profilePic;
    }
    
    // Privacy toggle
    const privacyCheckbox = document.getElementById('privacy-checkbox');
    privacyCheckbox.checked = data.profileType === 'private';
    document.querySelector('.privacy-status').textContent = data.profileType === 'private' ? 'Private' : 'Public';
    
    privacyCheckbox.addEventListener('change', () => {
      const newPrivacy = privacyCheckbox.checked ? 'private' : 'public';
      db.collection('users').doc(currentUser.uid).update({
        profileType: newPrivacy
      }).then(() => {
        document.querySelector('.privacy-status').textContent = newPrivacy === 'private' ? 'Private' : 'Public';
      });
    });
    
    // Monetization badge
    if (data.monetized) {
      document.getElementById('monetization-badge').style.display = 'block';
    }
  }
  
  // Load user's posts
  function loadUserPosts() {
    const postsGrid = document.getElementById('posts-grid');
    postsGrid.innerHTML = '<div class="loading">Loading posts...</div>';
    
    db.collection('posts')
      .where('userId', '==', currentUser.uid)
      .orderBy('createdAt', 'desc')
      .get()
      .then(snapshot => {
        postsGrid.innerHTML = '';
        
        if (snapshot.empty) {
          postsGrid.innerHTML = '<div class="empty">No posts yet</div>';
          return;
        }
        
        // Update post count
        document.getElementById('post-count').textContent = snapshot.size;
        
        snapshot.forEach(doc => {
          const post = doc.data();
          const postElement = document.createElement('div');
          postElement.className = 'post-thumbnail';
          
          if (post.mediaType === 'image') {
            postElement.innerHTML = `<img src="${post.mediaUrl}" alt="Post">`;
          } else if (post.mediaType === 'video') {
            postElement.innerHTML = `
              <video>
                <source src="${post.mediaUrl}" type="video/mp4">
              </video>
              <div class="play-icon">▶</div>
            `;
          } else {
            postElement.innerHTML = `<div class="text-thumbnail">${post.text.substring(0, 50)}...</div>`;
          }
          
          postElement.addEventListener('click', () => {
            // In a real app, this would open the post in a modal or new view
            alert(`View post ${doc.id}`);
          });
          
          postsGrid.appendChild(postElement);
        });
      });
  }
  
  // Load user's stories
  function loadUserStories() {
    const storiesGrid = document.getElementById('stories-grid');
    storiesGrid.innerHTML = '<div class="loading">Loading stories...</div>';
    
    db.collection('stories')
      .where('userId', '==', currentUser.uid)
      .where('expiresAt', '>', new Date())
      .orderBy('expiresAt')
      .get()
      .then(snapshot => {
        storiesGrid.innerHTML = '';
        
        if (snapshot.empty) {
          storiesGrid.innerHTML = '<div class="empty">No active stories</div>';
          return;
        }
        
        snapshot.forEach(doc => {
          const story = doc.data();
          const storyElement = document.createElement('div');
          storyElement.className = 'story-thumbnail';
          
          if (story.mediaType === 'image') {
            storyElement.innerHTML = `<img src="${story.mediaUrl}" alt="Story">`;
          } else if (story.mediaType === 'video') {
            storyElement.innerHTML = `
              <video>
                <source src="${story.mediaUrl}" type="video/mp4">
              </video>
              <div class="play-icon">▶</div>
            `;
          } else {
            storyElement.innerHTML = `<div class="text-thumbnail">${story.text.substring(0, 30)}...</div>`;
          }
          
          storyElement.addEventListener('click', () => {
            // In a real app, this would open the story
            alert(`View story ${doc.id}`);
          });
          
          storiesGrid.appendChild(storyElement);
        });
      });
  }
  
  // Load saved posts
  function loadSavedPosts() {
    const savedGrid = document.getElementById('saved-grid');
    savedGrid.innerHTML = '<div class="loading">Loading saved posts...</div>';
    
    // In a real app, you'd have a 'savedPosts' collection or array
    savedGrid.innerHTML = '<div class="empty">No saved posts yet</div>';
  }
  
  // Edit profile button
  document.getElementById('edit-profile-btn').addEventListener('click', () => {
    const modal = document.getElementById('edit-modal');
    document.getElementById('edit-name').value = userData.name;
    document.getElementById('edit-bio').value = userData.bio || '';
    modal.style.display = 'block';
  });
  
  // Close modal
  document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
  });
  
  // Save profile changes
  document.getElementById('edit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('edit-name').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    
    db.collection('users').doc(currentUser.uid).update({
      name: name,
      bio: bio
    }).then(() => {
      document.getElementById('edit-modal').style.display = 'none';
    });
  });
  
  // Profile picture upload
  document.getElementById('profile-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    
    fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`, {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      // Update profile picture in Firestore
      return db.collection('users').doc(currentUser.uid).update({
        profilePic: data.secure_url
      });
    })
    .then(() => {
      alert('Profile picture updated successfully!');
    })
    .catch(error => {
      console.error('Error uploading profile picture:', error);
      alert('Error updating profile picture. Please try again.');
    });
  });
});