document.addEventListener('DOMContentLoaded', () => {
  protectAdminRoute();
  
  let growthChart = null;
  
  // Tab switching
  const tabs = document.querySelectorAll('.admin-menu li');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      document.querySelectorAll('.admin-tab').forEach(content => {
        content.style.display = 'none';
      });
      
      document.getElementById(`${tab.dataset.tab}-tab`).style.display = 'block';
      
      // Load data for the tab if needed
      switch(tab.dataset.tab) {
        case 'analytics':
          loadAnalytics();
          break;
        case 'monetization':
          loadMonetizationRequests();
          break;
        case 'reports':
          loadReports();
          break;
        default:
          loadUsers();
      }
    });
  });
  
  // Load users
  function loadUsers() {
    const usersTable = document.getElementById('users-table');
    
    db.collection('users').onSnapshot(snapshot => {
      usersTable.innerHTML = '';
      
      snapshot.forEach(doc => {
        const user = doc.data();
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>
            <img src="${user.profilePic || 'images/default-profile.png'}" class="user-avatar">
            ${user.name}
          </td>
          <td>${user.email}</td>
          <td>${user.followers || 0}</td>
          <td>
            <span class="status-badge ${user.isAdmin ? 'admin' : user.monetized ? 'monetized' : 'active'}">
              ${user.isAdmin ? 'Admin' : user.monetized ? 'Monetized' : 'Active'}
            </span>
          </td>
          <td class="actions">
            <button class="btn btn-small ${user.banned ? 'btn-success' : 'btn-warning'}" data-action="ban" data-user="${doc.id}" data-status="${user.banned ? 'false' : 'true'}">
              ${user.banned ? 'Unban' : 'Ban'}
            </button>
            ${!user.isAdmin ? `
              <button class="btn btn-small ${user.monetized ? 'btn-warning' : 'btn-primary'}" data-action="monetize" data-user="${doc.id}" data-status="${user.monetized ? 'false' : 'true'}">
                ${user.monetized ? 'Revoke' : 'Monetize'}
              </button>
              <button class="btn btn-small btn-danger" data-action="delete" data-user="${doc.id}">
                Delete
              </button>
            ` : ''}
          </td>
        `;
        
        usersTable.appendChild(row);
      });
      
      // Add event listeners to buttons
      document.querySelectorAll('[data-action="ban"]').forEach(btn => {
        btn.addEventListener('click', handleUserAction);
      });
      
      document.querySelectorAll('[data-action="monetize"]').forEach(btn => {
        btn.addEventListener('click', handleUserAction);
      });
      
      document.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', handleUserAction);
      });
    });
  }
  
  // Load monetization requests
  function loadMonetizationRequests() {
    const monetizationTable = document.getElementById('monetization-table');
    
    db.collection('monetizationRequests')
      .where('status', '==', 'pending')
      .onSnapshot(snapshot => {
        monetizationTable.innerHTML = '';
        
        if (snapshot.empty) {
          monetizationTable.innerHTML = '<tr><td colspan="5">No pending requests</td></tr>';
          return;
        }
        
        snapshot.forEach(doc => {
          const request = doc.data();
          
          // Get user data
          db.collection('users').doc(request.userId).get().then(userDoc => {
            if (userDoc.exists) {
              const user = userDoc.data();
              const row = document.createElement('tr');
              
              row.innerHTML = `
                <td>
                  <img src="${user.profilePic || 'images/default-profile.png'}" class="user-avatar">
                  ${user.name}
                </td>
                <td>${user.followers || 0}</td>
                <td>${user.views || 0}</td>
                <td>
                  <span class="status-badge pending">Pending</span>
                </td>
                <td class="actions">
                  <button class="btn btn-small btn-success" data-action="approve-request" data-request="${doc.id}" data-user="${request.userId}">
                    Approve
                  </button>
                  <button class="btn btn-small btn-danger" data-action="reject-request" data-request="${doc.id}">
                    Reject
                  </button>
                </td>
              `;
              
              monetizationTable.appendChild(row);
              
              // Add event listeners
              document.querySelectorAll('[data-action="approve-request"]').forEach(btn => {
                btn.addEventListener('click', handleMonetizationRequest);
              });
              
              document.querySelectorAll('[data-action="reject-request"]').forEach(btn => {
                btn.addEventListener('click', handleMonetizationRequest);
              });
            }
          });
        });
      });
  }
  
  // Load reports
  function loadReports() {
    // Similar implementation to loadMonetizationRequests
    // Would fetch reported content from a 'reports' collection
  }
  
  // Load analytics
  function loadAnalytics() {
    // Total users
    db.collection('users').get().then(snapshot => {
      document.getElementById('total-users').textContent = snapshot.size;
    });
    
    // Active users (simplified - in real app would track activity)
    db.collection('users')
      .where('lastActive', '>', new Date(Date.now() - 24 * 60 * 60 * 1000))
      .get()
      .then(snapshot => {
        document.getElementById('active-users').textContent = snapshot.size;
      });
    
    // Monetized users
    db.collection('users')
      .where('monetized', '==', true)
      .get()
      .then(snapshot => {
        document.getElementById('monetized-users').textContent = snapshot.size;
      });
    
    // Total posts
    db.collection('posts').get().then(snapshot => {
      document.getElementById('total-posts').textContent = snapshot.size;
    });
    
    // Growth chart
    if (growthChart) {
      growthChart.destroy();
    }
    
    // Simplified - in real app would track growth over time
    const ctx = document.getElementById('growth-chart').getContext('2d');
    growthChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'User Growth',
          data: [120, 190, 300, 500, 800, 1200],
          borderColor: '#4CAF50',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          }
        }
      }
    });
  }
  
  // Handle user actions (ban, monetize, delete)
  function handleUserAction(e) {
    const action = e.target.dataset.action;
    const userId = e.target.dataset.user;
    
    switch(action) {
      case 'ban':
        const banStatus = e.target.dataset.status === 'true';
        db.collection('users').doc(userId).update({
          banned: banStatus
        }).then(() => {
          alert(`User ${banStatus ? 'banned' : 'unbanned'} successfully`);
        });
        break;
        
      case 'monetize':
        const monetizeStatus = e.target.dataset.status === 'true';
        db.collection('users').doc(userId).update({
          monetized: monetizeStatus
        }).then(() => {
          alert(`User ${monetizeStatus ? 'monetized' : 'monetization revoked'} successfully`);
        });
        break;
        
      case 'delete':
        if (confirm('Are you sure you want to delete this user?')) {
          db.collection('users').doc(userId).delete().then(() => {
            alert('User deleted successfully');
          });
        }
        break;
    }
  }
  
  // Handle monetization requests
  function handleMonetizationRequest(e) {
    const action = e.target.dataset.action.split('-')[0]; // approve or reject
    const requestId = e.target.dataset.request;
    const userId = e.target.dataset.user;
    
    if (action === 'approve') {
      // Update user as monetized
      db.collection('users').doc(userId).update({
        monetized: true
      }).then(() => {
        // Update request status
        db.collection('monetizationRequests').doc(requestId).update({
          status: 'approved',
          processedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          alert('Monetization approved successfully');
        });
      });
    } else {
      // Reject request
      db.collection('monetizationRequests').doc(requestId).update({
        status: 'rejected',
        processedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        alert('Monetization request rejected');
      });
    }
  }
  
  // Initial load
  loadUsers();
});