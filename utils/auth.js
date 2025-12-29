async function loadUsers() {
  try {
    const response = await fetch('data_user.txt');
    if (!response.ok) {
      return [];
    }
    const text = await response.text();
    if (!text.trim()) {
      return [];
    }
    return text.trim().split('\n').map(line => {
      const [username, password, address, registeredAt] = line.split('|');
      return { username, password, address, registeredAt };
    });
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

async function saveUsers(users) {
  const content = users.map(u => 
    `${u.username}|${u.password}|${u.address}|${u.registeredAt}`
  ).join('\n');
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data_user.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return true;
}

async function registerUser(username, password, address) {
  try {
    const users = await loadUsers();
    
    const userExists = users.some(user => user.username === username);
    
    if (userExists) {
      return { success: false, message: 'Username sudah digunakan' };
    }

    const newUser = {
      username: username.trim(),
      password: password,
      address: address.trim(),
      registeredAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    const saved = await saveUsers(users);
    
    if (saved) {
      return { 
        success: true, 
        message: 'Registrasi berhasil! File data_user.txt yang diperbarui telah diunduh. Silakan upload file tersebut ke folder project untuk menggantikan file lama.' 
      };
    } else {
      return { success: false, message: 'Gagal menyimpan data' };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Gagal melakukan registrasi. Silakan coba lagi.' };
  }
}

async function loginUser(username, password) {
  try {
    const users = await loadUsers();
    
    const user = users.find(
      u => u.username === username && u.password === password
    );
    
    if (!user) {
      return { success: false, message: 'Username atau password salah' };
    }

    localStorage.setItem('currentUser', JSON.stringify({
      username: user.username
    }));

    return { success: true, user: user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Gagal melakukan login. Silakan coba lagi.' };
  }
}

function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}