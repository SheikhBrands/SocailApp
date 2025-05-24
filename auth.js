// Initialize Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// Auth state observer
function initAuthStateListener() {
  auth.onAuthStateChanged(user => {
    console.log('Auth state changed:', user);
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
            const profilePics = document.querySelectorAll('#nav-profile-pic, .profile-pic');
            profilePics.forEach(pic => pic.src = userData.profilePic);
          }
        }
      });
    } else {
      // No user is signed in
      authButtons.style.display = 'block';
      profileButton.style.display = 'none';
    }
  });
}

// Initialize auth listener when the script loads
initAuthStateListener();

// Enhanced login function
async function login(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('User logged in:', userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    let message = 'Login failed. ';
    switch(error.code) {
      case 'auth/user-not-found':
        message += 'No user found with this email.';
        break;
      case 'auth/wrong-password':
        message += 'Incorrect password.';
        break;
      case 'auth/invalid-email':
        message += 'Invalid email format.';
        break;
      case 'auth/user-disabled':
        message += 'This account has been disabled.';
        break;
      case 'auth/too-many-requests':
        message += 'Too many attempts. Try again later.';
        break;
      default:
        message += error.message;
    }
    throw new Error(message);
  }
}

// Enhanced registration function
async function register(name, email, password) {
  try {
    // Create user in Firebase Authentication
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    console.log('User created:', userCredential.user);
    
    // Add user to Firestore
    await db.collection('users').doc(userCredential.user.uid).set({
      name: name,
      email: email,
      isAdmin: false,
      followers: 0,
      views: 0,
      profileType: 'public',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return userCredential.user;
  } catch (error) {
    console.error('Registration error:', error);
    let message = 'Registration failed. ';
    switch(error.code) {
      case 'auth/email-already-in-use':
        message += 'Email already in use.';
        break;
      case 'auth/weak-password':
        message += 'Password should be at least 6 characters.';
        break;
      case 'auth/invalid-email':
        message += 'Invalid email format.';
        break;
      case 'auth/operation-not-allowed':
        message += 'Email/password accounts are not enabled.';
        break;
      default:
        message += error.message;
    }
    throw new Error(message);
  }
}

// Google Sign-In
async function googleSignIn() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    
    // Check if user exists in Firestore
    const userDoc = await db.collection('users').doc(result.user.uid).get();
    
    if (!userDoc.exists) {
      // Create new user in Firestore
      await db.collection('users').doc(result.user.uid).set({
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
    
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    let message = 'Google sign-in failed. ';
    if (error.code === 'auth/popup-closed-by-user') {
      message = 'Sign in was canceled.';
    } else {
      message += error.message;
    }
    throw new Error(message);
  }
}

// Logout function
async function logout() {
  try {
    await auth.signOut();
    console.log('User signed out');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// Check if user is admin
async function isAdmin(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists && doc.data().isAdmin;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

// Route protection
function protectRoute() {
  auth.onAuthStateChanged(user => {
    if (!user) {
      console.log('Unauthorized access - redirecting to login');
      window.location.href = 'login.html';
    }
  });
}

function protectAdminRoute() {
  auth.onAuthStateChanged(async user => {
    if (!user) {
      window.location.href = 'login.html';
    } else {
      const admin = await isAdmin(user.uid);
      if (!admin) {
        console.log('Admin access denied - redirecting to home');
        window.location.href = 'index.html';
      }
    }
  });
}