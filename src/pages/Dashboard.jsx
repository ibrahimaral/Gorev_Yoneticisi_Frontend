import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Yeni Proje Formu İçin Stateler
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Projeleri Backend'den Çeken Fonksiyon (GET /api/projects/)
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await API.get('/projects/');
      // Eğer backend sayfalama (pagination) kullanıyorsa response.data.results olabilir
      const data = response.data.results ? response.data.results : response.data;
      setProjects(data);
    } catch (err) {
      console.error('Projeler çekilemedi:', err);
      setError('Projeler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa ilk açıldığında projeleri çek
  useEffect(() => {
    fetchProjects();
  }, []);

  // Yeni Proje Ekleme Fonksiyonu (POST /api/projects/)
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await API.post('/projects/', { 
  name: name, 
  description: description,
  created_at: new Date().toISOString() 
});
      setName('');
      setDescription('');
      setShowModal(false);
      fetchProjects(); // Listeyi güncelle
    } catch (err) {
      console.error('Proje eklenemedi:', err);
      alert('Proje oluşturulurken bir hata oluştu!');
    } finally {
      setCreateLoading(false);
    }
  };

  // Projeleri arama kelimesine göre (küçük/büyük harf duyarsız) filtrele
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      {/* Üst Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400">Görev Yöneticisi</h1>
          <p className="text-slate-400 text-sm mt-1">Proje ve Görev Yönetim Paneli</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          Çıkış Yap
        </button>
      </div>

      {/* Proje Ekleme Butonu ve Başlık */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-200">Projelerim ({projects.length})</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
        >
          + Yeni Proje Ekle
        </button>
      </div>
      {/* ARAMA ÇUBUĞU BAŞLANGICI */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {/* Büyüteç İkonu */}
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Proje ara (Örn: EHT Clinic)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 p-3 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
          />
        </div>
      </div>
      {/* ARAMA ÇUBUĞU BİTİŞİ */}

      {/* Hata veya Yükleniyor Mesajı */}
      {loading && <div className="text-center py-10 text-slate-400">Projeler yükleniyor...</div>}
      {error && <div className="text-center py-10 text-red-400">{error}</div>}

      {/* Projeler Kart Grid Yapısı */}
      {!loading && !error && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-800">
              <p className="text-slate-400">Henüz hiç proje oluşturulmamış.</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-800 border border-slate-700/60 p-6 rounded-2xl shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                  <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                    {project.description || 'Açıklama belirtilmemiş.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
                  <span>{new Date(project.created_at).toLocaleDateString('tr-TR')}</span>
                  <button 
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="text-emerald-400 hover:text-emerald-300 font-medium text-sm"
                  >
                    Görevleri Gör →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Yeni Proje Modal (Açılır Pencere) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Yeni Proje Oluştur</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-1">Proje Adı *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Örn: E-Ticaret Arayüzü"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Açıklama</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Projenin detayları..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {createLoading ? 'Kaydediliyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;