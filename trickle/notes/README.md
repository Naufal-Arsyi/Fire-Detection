# Fire Detection System

Sistem deteksi api secara real-time menggunakan pengolahan citra digital.

## Fitur

- **Autentikasi Pengguna**: Login dan registrasi dengan penyimpanan data menggunakan Trickle Database
- **Dashboard**: Halaman dashboard untuk pengguna yang sudah login
- **Deteksi Api Real-time**: (Dalam pengembangan)

## Struktur Halaman

- `index.html` - Halaman login
- `regis.html` - Halaman registrasi
- `dashboard.html` - Dashboard utama setelah login

## Komponen

- `LoginForm` - Form untuk login
- `RegisterForm` - Form untuk registrasi
- `Alert` - Komponen notifikasi untuk feedback pengguna

## Utilitas

- `auth.js` - Fungsi autentikasi (login, register, logout, getCurrentUser)

## Penyimpanan Data

Menggunakan file teks `data_user.txt` untuk menyimpan data pengguna dengan format:
- Format: `username|password|address|registeredAt`
- Setiap baris mewakili satu user, dipisahkan dengan karakter `|`

### Workflow Registrasi:
1. Pengguna mengisi form registrasi
2. Sistem membaca file `data_user.txt` yang ada
3. Data user baru ditambahkan ke dalam file
4. File `data_user.txt` yang diperbarui otomatis diunduh
5. Upload file yang baru diunduh ke folder project untuk menggantikan file lama

### Workflow Login:
1. Sistem membaca data dari file `data_user.txt`
2. Validasi username dan password
3. Jika cocok, user berhasil login

## Cara Menggunakan

1. Buka halaman utama untuk login atau registrasi
2. Registrasi akun baru dengan username dan password
3. Login menggunakan kredensial yang telah dibuat
4. Akses dashboard setelah berhasil login

## Teknologi

- React 18
- Tailwind CSS
- Lucide Icons
- Trickle Database