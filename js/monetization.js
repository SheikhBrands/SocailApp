document.addEventListener('DOMContentLoaded', () => {
  protectRoute();
  
  let currentUser = null;
  
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      checkMonetizationStatus();
    }
  });
  
  // Check user's monetization status
  function checkMonetizationStatus() {
    db.collection('users').doc(currentUser.uid).get()
      .then(userDoc => {
        const userData = userDoc.data();
        
        // Update stats
        document.getElementById('follower-count').textContent = userData.followers || 0;
        document.getElementById('view-count').textContent = userData.views || 0;
        
        // Update progress bars
        const followerProgress = Math.min((userData.followers || 0) / 10000 * 100, 100);
        const viewProgress = Math.min((userData.views || 0) / 1000000 * 100, 100);
        
        document.getElementById('follower-progress').style.width = `${followerProgress}%`;
        document.getElementById('view-progress').style.width = `${viewProgress}%`;
        
        // Check if user is already monetized
        if (userData.monetized) {
          document.getElementById('monetization-badge').style.display = 'block';
          document.getElementById('monetization-requirements').style.display = 'none';
          return;
        }
        
        // Check if user has pending application
        db.collection('monetizationRequests')
          .where('userId', '==', currentUser.uid)
          .where('status', '==', 'pending')
          .get()
          .then(snapshot => {
            if (!snapshot.empty) {
              document.getElementById('monetization-pending').style.display = 'block';
              document.getElementById('monetization-requirements').style.display = 'none';
              return;
            }
            
            // Enable apply button if eligible
            const eligible = (userData.followers >= 10000) || (userData.views >= 1000000);
            document.getElementById('apply-btn').disabled = !eligible;
          });
      });
  }
  
  // Apply for monetization
  document.getElementById('apply-btn').addEventListener('click', () => {
    // Get user data
    db.collection('users').doc(currentUser.uid).get()
      .then(userDoc => {
        const userData = userDoc.data();
        
        // Create monetization request
        return db.collection('monetizationRequests').add({
          userId: currentUser.uid,
          name: userData.name,
          followers: userData.followers || 0,
          views: userData.views || 0,
          status: 'pending',
          appliedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        alert('Monetization application submitted successfully!');
        document.getElementById('monetization-pending').style.display = 'block';
        document.getElementById('monetization-requirements').style.display = 'none';
      })
      .catch(error => {
        console.error('Error applying for monetization:', error);
        alert('Error submitting application. Please try again.');
      });
  });
});