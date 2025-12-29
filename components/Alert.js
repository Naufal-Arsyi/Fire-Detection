function Alert({ message, type, onClose }) {
  try {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 'check-circle' : 'alert-circle';

    return (
      <div className="fixed top-4 right-4 z-50 animate-slide-in" data-name="alert" data-file="components/Alert.js">
        <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px]`}>
          <div className={`icon-${icon} text-xl`}></div>
          <p className="flex-1">{message}</p>
          <button onClick={onClose} className="hover:opacity-80">
            <div className="icon-x text-lg"></div>
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Alert component error:', error);
    return null;
  }
}