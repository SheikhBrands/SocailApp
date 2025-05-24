// Auth state observer
auth.onAuthStateChanged(user => {
  const authButtons = document.getElementById('auth-buttons');
  const profileButton = document.getElementById('profile-button');
  
  if (user) {
    // User is signed in
    authButtons.style.display = 'none';
    profileButton.style.display = 'block';
    
    // Load user profile picture
    db.collection('users').doc(user.uid).get().then(doc => {
      if (doc.exists) {
        const userData = doc.data();
        if (userData.profilePic) {
          document.getElementById('nav-profile-pic').src = userData.profilePic;
        }
      }
    });
  } else {
    // No user is signed in
    authButtons.style.display = 'block';
    profileButton.style.display = 'none';
  }
});

// Login function
function login(email, password) {
  return auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      return userCredential.user;
    })
    .catch(error => {
      throw error;
    });
}

// Google Sign-In
function googleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider)
    .then(result => {
      // Check if user exists in Firestore
      return db.collection('users').doc(result.user.uid).get();
    })
    .then(doc => {
      if (!doc.exists) {
        // Create new user in Firestore
        return db.collection('users').doc(result.user.uid).set({
          name: result.user.displayName,
          email: result.user.email,
          profilePic: result.user.photoURL,
          isAdmin: false,
          followers: 0,
          views: 0,
          profileType: 'public',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    });
}

// Register function
function register(name, email, password) {
  return auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      // Add user to Firestore
      return db.collection('users').doc(userCredential.user.uid).set({
        name: name,
        email: email,
        isAdmin: false,
        followers: 0,
        views: 0,
        profileType: 'public',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
}

// Logout function
function logout() {
  return auth.signOut();
}

// Check if user is admin
async function isAdmin(uid) {
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists && doc.data().isAdmin;
}

// Protect admin routes
function protectAdminRoute() {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'login.html';
    } else {
      isAdmin(user.uid).then(admin => {
        if (!admin) {
          window.location.href = 'index.html';
        }
      });
    }
  });
}

// Protect authenticated routes
function protectRoute() {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'login.html';
    }
  });
}