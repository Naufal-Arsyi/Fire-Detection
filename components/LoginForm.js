function LoginForm({ onRegisterClick, showAlert }) {
  try {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      
      if (!username || !password) {
        showAlert('Mohon isi username dan password', 'error');
        return;
      }

      setLoading(true);
      
      const result = await loginUser(username, password);
      
      setLoading(false);
      
      if (result.success) {
        showAlert('Login berhasil!', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      } else {
        showAlert(result.message, 'error');
      }
    };

    return (
      <div className="bg-white rounded-2xl shadow-xl p-8" data-name="login-form" data-file="components/LoginForm.js">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Masuk</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Masukkan password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[var(--text-secondary)]">
            Belum punya akun?{' '}
            <button onClick={onRegisterClick} className="text-[var(--primary-color)] font-medium hover:underline">
              Daftar di sini
            </button>
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('LoginForm component error:', error);
    return null;
  }
}