document.addEventListener('DOMContentLoaded', () => {
  protectRoute();
  
  let currentUser = null;
  let currentSort = 'trending';
  
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      loadPosts();
    }
  });
  
  // Sort buttons
  document.querySelectorAll('[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSort = btn.dataset.sort;
      loadPosts();
    });
  });
  
  // Load posts
  function loadPosts() {
    const feed = document.getElementById('feed');
    feed.innerHTML = '<div class="loading">Loading posts...</div>';
    
    let query = db.collection('posts')
      .where('isPublic', '==', true);
    
    if (currentSort === 'trending') {
      query = query.orderBy('likes', 'desc');
    } else {
      query = query.orderBy('createdAt', 'desc');
    }
    
    query.limit(20).get()
      .then(snapshot => {
        feed.innerHTML = '';
        
        if (snapshot.empty) {
          feed.innerHTML = '<div class="empty-feed">No posts found</div>';
          return;
        }
        
        snapshot.forEach(doc => {
          const post = doc.data();
          displayPost(doc.id, post);
        });
      })
      .catch(error => {
        console.error('Error loading posts:', error);
        feed.innerHTML = '<div class="error">Error loading posts</div>';
      });
  }
  
  // Display a post
  function displayPost(postId, post) {
    const feed = document.getElementById('feed');
    
    // Get user info
    db.collection('users').doc(post.userId).get().then(userDoc => {
      const user = userDoc.data();
      
      const postElement = document.createElement('div');
      postElement.className = 'post';
      postElement.dataset.postId = postId;
      
      let mediaContent = '';
      if (post.mediaType === 'image') {
        mediaContent = `<img src="${post.mediaUrl}" alt="Post image">`;
      } else if (post.mediaType === 'video') {
        mediaContent = `
          <video controls>
            <source src="${post.mediaUrl}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        `;
      }
      
      postElement.innerHTML = `
        <div class="post-header">
          <img src="${user.profilePic || 'images/default-profile.png'}" alt="${user.name}" class="post-avatar">
          <div class="post-user">
            <h4>${user.name}</h4>
            <small>${formatTime(post.createdAt.toDate())}</small>
          </div>
          ${user.monetized ? '<span class="monetized-badge">💰 Monetized</span>' : ''}
        </div>
        
        <div class="post-content">
          ${post.text ? `<p class="post-text">${post.text}</p>` : ''}
          ${post.mediaUrl ? `<div class="post-media">${mediaContent}</div>` : ''}
        </div>
        
        <div class="post-actions">
          <button class="like-btn ${post.likes?.includes(currentUser.uid) ? 'liked' : ''}" data-action="like">
            ❤️ ${post.likes?.length || 0}
          </button>
          <button class="comment-btn" data-action="comment">
            💬 Comment
          </button>
          <button class="share-btn" data-action="share">
            🔗 Share
          </button>
        </div>
        
        <div class="post-comments" style="display: none;">
          <div class="comments-list" id="comments-${postId}"></div>
          <div class="comment-input">
            <input type="text" placeholder="Add a comment..." id="comment-input-${postId}">
            <button class="btn btn-small" data-action="post-comment">Post</button>
          </div>
        </div>
      `;
      
      feed.appendChild(postElement);
      
      // Add event listeners
      postElement.querySelector('[data-action="like"]').addEventListener('click', () => toggleLike(postId, post));
      postElement.querySelector('[data-action="comment"]').addEventListener('click', () => toggleComments(postId));
      postElement.querySelector('[data-action="share"]').addEventListener('click', () => sharePost(postId));
      postElement.querySelector('[data-action="post-comment"]').addEventListener('click', () => postComment(postId));
      
      // Load comments
      loadComments(postId);
    });
  }
  
  // Toggle like on a post
  function toggleLike(postId, post) {
    const likes = post.likes || [];
    const likeBtn = document.querySelector(`.post[data-post-id="${postId}"] .like-btn`);
    
    if (likes.includes(currentUser.uid)) {
      // Unlike
      const newLikes = likes.filter(uid => uid !== currentUser.uid);
      db.collection('posts').doc(postId).update({
        likes: newLikes
      }).then(() => {
        likeBtn.classList.remove('liked');
        likeBtn.innerHTML = `❤️ ${newLikes.length}`;
      });
    } else {
      // Like
      const newLikes = [...likes, currentUser.uid];
      db.collection('posts').doc(postId).update({
        likes: newLikes
      }).then(() => {
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = `❤️ ${newLikes.length}`;
      });
    }
  }
  
  // Toggle comments section
  function toggleComments(postId) {
    const commentsSection = document.querySelector(`.post[data-post-id="${postId}"] .post-comments`);
    if (commentsSection.style.display === 'none') {
      commentsSection.style.display = 'block';
    } else {
      commentsSection.style.display = 'none';
    }
  }
  
  // Load comments for a post
  function loadComments(postId) {
    const commentsList = document.getElementById(`comments-${postId}`);
    
    db.collection('posts').doc(postId).collection('comments')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .onSnapshot(snapshot => {
        commentsList.innerHTML = '';
        
        snapshot.forEach(doc => {
          const comment = doc.data();
          
          // Get user info
          db.collection('users').doc(comment.userId).get().then(userDoc => {
            const user = userDoc.data();
            
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            
            commentElement.innerHTML = `
              <img src="${user.profilePic || 'images/default-profile.png'}" alt="${user.name}" class="comment-avatar">
              <div class="comment-content">
                <strong>${user.name}</strong>
                <p>${comment.text}</p>
                <small>${formatTime(comment.createdAt.toDate())}</small>
              </div>
            `;
            
            commentsList.appendChild(commentElement);
          });
        });
      });
  }
  
  // Post a comment
  function postComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const text = input.value.trim();
    
    if (text) {
      db.collection('posts').doc(postId).collection('comments').add({
        userId: currentUser.uid,
        text: text,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        input.value = '';
      });
    }
  }
  
  // Share a post
  function sharePost(postId) {
    // In a real app, this would use the Web Share API or copy a link
    alert(`Share link for post ${postId} copied to clipboard!`);
  }
  
  // Format time
  function formatTime(date) {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
});