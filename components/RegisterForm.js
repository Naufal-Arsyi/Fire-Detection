function RegisterForm({ onLoginClick, showAlert }) {
  try {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleRegister = async (e) => {
      e.preventDefault();
      
      if (!username || !password || !confirmPassword || !address) {
        showAlert('Mohon isi semua field', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showAlert('Password tidak cocok', 'error');
        return;
      }

      if (password.length < 6) {
        showAlert('Password minimal 6 karakter', 'error');
        return;
      }

      setLoading(true);
      
      const result = await registerUser(username, password, address);
      
      setLoading(false);
      
      if (result.success) {
        showAlert(result.message, 'success');
        setTimeout(() => {
          onLoginClick();
        }, 3000);
      } else {
        showAlert(result.message, 'error');
      }
    };

    return (
      <div className="bg-white rounded-2xl shadow-xl p-8" data-name="register-form" data-file="components/RegisterForm.js">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Daftar</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
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
              placeholder="Buat password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Ulangi password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Alamat Rumah</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field resize-none"
              rows="3"
              placeholder="Masukkan alamat lengkap"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[var(--text-secondary)]">
            Sudah punya akun?{' '}
            <button onClick={onLoginClick} className="text-[var(--primary-color)] font-medium hover:underline">
              Masuk di sini
            </button>
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('RegisterForm component error:', error);
    return null;
  }
}