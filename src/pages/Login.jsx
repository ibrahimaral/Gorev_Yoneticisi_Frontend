import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API from '../api/axios'; // Kendi axios dosyanın yolunun doğru olduğundan emin ol

function Login({ onLoginSuccess }) { 
  const navigate = useNavigate();
  
  // Form modunu tutan sihirli state (true ise Giriş Yap, false ise Kayıt Ol ekranı)
  const [isLogin, setIsLogin] = useState(true);
  
  // Form verileri
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      // --- GİRİŞ YAPMA İŞLEMİ ---
      try {
        const response = await API.post('/token/', { username, password });
       localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        if (onLoginSuccess) onLoginSuccess(); 
        
        toast.success('Başarıyla giriş yapıldı!');
        navigate('/');
      } catch (error) {
        toast.error('Kullanıcı adı veya şifre hatalı!');
      }
    } else {
      // --- KAYIT OLMA İŞLEMİ ---
      if (password !== confirmPassword) {
        toast.warning('Şifreler birbiriyle uyuşmuyor!');
        return;
      }
      if (password.length < 6) {
        toast.warning('Şifreniz en az 6 karakter olmalıdır.');
        return;
      }

      try {
        await API.post('/register/', { username, email, password });
        toast.success('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        
        // Kayıt başarılı olunca otomatik olarak "Giriş Yap" moduna geç ve şifreleri temizle
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      } catch (error) {
        // Django'dan dönen özel hataları yakalama (Örn: Bu kullanıcı adı zaten alınmış)
        if (error.response && error.response.data) {
          const errorMsg = Object.values(error.response.data)[0];
          toast.error(`Kayıt başarısız: ${errorMsg}`);
        } else {
          toast.error('Kayıt olunamadı. Lütfen bilgilerinizi kontrol edin.');
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl transition-all duration-300">
        
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          {isLogin ? 'Görev Yöneticisi Giriş' : 'Görev Yöneticisine Katıl'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm mb-1.5">Kullanıcı Adı</label>
            <input 
              required 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Sadece "Kayıt Ol" modundayken E-posta alanını göster */}
          {!isLogin && (
            <div>
              <label className="block text-slate-300 text-sm mb-1.5">E-posta Adresi</label>
              <input 
                required 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 text-sm mb-1.5">Şifre</label>
            <input 
              required 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Sadece "Kayıt Ol" modundayken Şifre Tekrar alanını göster */}
          {!isLogin && (
            <div>
              <label className="block text-slate-300 text-sm mb-1.5">Şifre (Tekrar)</label>
              <input 
                required 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-colors mt-2"
          >
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        {/* GEÇİŞ BUTONU */}
        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors focus:outline-none"
          >
            {isLogin ? 'Hemen Kayıt Ol' : 'Giriş Yap'}
          </button>
        </div>

      </div>
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />
    </div>
  );
}

export default Login;