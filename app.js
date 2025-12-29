class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Terjadi Kesalahan</h1>
            <p className="text-gray-600 mb-4">Maaf, terjadi kesalahan yang tidak terduga.</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  try {
    const [alert, setAlert] = React.useState(null);

    const showAlert = (message, type) => {
      setAlert({ message, type });
      setTimeout(() => setAlert(null), 3000);
    };

    const handleRegisterClick = () => {
      window.location.href = 'regis.html';
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4" data-name="app" data-file="app.js">
        {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--primary-color)] rounded-2xl mb-4">
              <div className="icon-flame text-4xl text-white"></div>
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Fire Detection System</h1>
            <p className="text-[var(--text-secondary)]">Sistem Deteksi Api Real-time</p>
          </div>

          <LoginForm onRegisterClick={handleRegisterClick} showAlert={showAlert} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);