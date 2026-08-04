//dir
//cd gorev-frontend
// npm run dev
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Toast stillerini ekliyoruz
import API from '../api/axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function ProjectDetail({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal ve Form State'leri
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // 1. FAZ 5: Filtreleme ve Sayfalama State'leri
  const [filterStatus, setFilterStatus] = useState(''); // Boş ise tümünü getirir
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Görevleri Çek (GET) - Filtreleme ve Sayfalama Destekli
  const fetchTasks = async (page = 1, status = filterStatus) => {
    setLoading(true);
    try {
      // Dinamik URL oluşturma (Sayfa ve Durum parametreleri ile)
      let url = `/projects/${id}/tasks/?page=${page}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await API.get(url);
      const data = response.data;
      
      // Backend'den sayfalama (pagination) yapısı geliyorsa
      if (data && data.results) {
        setTasks(data.results);
        setCurrentPage(page);
        // Senin views.py dosyasında page_size = 5 olduğu için:
        setTotalPages(Math.ceil(data.count / 30)); 
      } else {
        // Sayfalama yoksa veya boşsa
        setTasks(Array.isArray(data) ? data : []);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Görevler çekilemedi:', err);
      // 2. FAZ 5: Şık Hata Yönetimi
      toast.error(err.response?.data?.error || 'Görevler yüklenirken bir hata oluştu!');
      setTasks([]); 
    } finally {
      setLoading(false);
    }
  };

  // Filtre değiştiğinde veya sayfa ilk açıldığında verileri baştan çek
  useEffect(() => {
    fetchTasks(1, filterStatus);
  }, [id, filterStatus]);

  // Yeni Görev Ekle (POST)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning('Lütfen görev başlığını boş bırakmayın!');
      return;
    }
    try {
      await API.post(`/projects/${id}/tasks/`, { 
        project: id,
        title, 
        description, 
        status: 'TODO' 
      });
      setTitle('');
      setDescription('');
      setShowModal(false);
      toast.success('Görev başarıyla oluşturuldu!');
      fetchTasks(currentPage);
    } catch (err) {
      toast.error('Görev oluşturulurken eksik veya hatalı bilgi girildi.');
    }
  };

   // Kanban Kolonları İçin Ayrıştırma
  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  // Grafik İçin Veri Seti (Sıfır olanları grafikte göstermemek için filtreleyebilirsin ama PieChart bunu otomatik halleder)
  const chartData = [
    { name: 'Yapılacak', value: todoTasks.length, color: '#facc15' }, // Sarı
    { name: 'Devam Ediyor', value: inProgressTasks.length, color: '#3b82f6' }, // Mavi
    { name: 'Tamamlandı', value: doneTasks.length, color: '#10b981' }, // Zümrüt Yeşili
  ];

  // Görev Durumu Güncelle (PATCH)
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.patch(`/tasks/${taskId}/`, { status: newStatus });
      toast.success('Görev durumu güncellendi!');
      fetchTasks(currentPage); 
    } catch (err) {
      toast.error('Durum güncellenemedi, lütfen tekrar deneyin.');
    }
  };

  // Görev Sil (DELETE)
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Bu görevi silmek istediğine emin misin?')) return;
    try {
      await API.delete(`/tasks/${taskId}/`);
      toast.info('Görev silindi.');
      fetchTasks(currentPage);
    } catch (err) {
      toast.error('Görev silinirken yetkisiz erişim veya hata oluştu.');
    }
  };

  // Tekil Görev Kartı Bileşeni
  const TaskCard = ({ task }) => (
    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 mb-3 hover:border-emerald-500/50 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-white">{task.title}</h4>
        <button onClick={() => handleDeleteTask(task.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
          🗑️
        </button>
      </div>
      <p className="text-sm text-slate-400 mb-4">{task.description}</p>
      
      <select 
        value={task.status}
        onChange={(e) => handleStatusChange(task.id, e.target.value)}
        className="w-full bg-slate-800 text-xs text-slate-300 border border-slate-600 rounded p-1.5 focus:outline-none focus:border-emerald-500"
      >
        <option value="TODO">Yapılacak</option>
        <option value="IN_PROGRESS">Devam Ediyor</option>
        <option value="DONE">Tamamlandı</option>
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      
      {/* Şık Bildirimleri Ekranda Göstermek İçin Gerekli Konteyner */}
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-800 pb-5 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg">
            ← Geri
          </button>
          <h1 className="text-3xl font-bold text-emerald-400">Proje Görevleri</h1>
        </div>
        <button onClick={onLogout} className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-sm transition-all">
          Çıkış Yap
        </button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        
        {/* FAZ 5: Filtreleme Butonları */}
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button onClick={() => setFilterStatus('')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === '' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            Tümü
          </button>
          <button onClick={() => setFilterStatus('TODO')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'TODO' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            Yapılacaklar
          </button>
          <button onClick={() => setFilterStatus('IN_PROGRESS')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'IN_PROGRESS' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            Devam Edenler
          </button>
          <button onClick={() => setFilterStatus('DONE')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'DONE' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            Tamamlananlar
          </button>
        </div>

        <button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl transition-all">
          + Yeni Görev Ekle
        </button>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-10">Görevler Yükleniyor...</div>
      ) : (
        <>
          {/* HARİKA DONUT GRAFİK VE İSTATİSTİK BÖLÜMÜ */}
          {tasks.length > 0 && (
            <div className="max-w-7xl mx-auto bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-lg">
              
              {/* Sol Taraf: Donut Grafik */}
              <div className="relative w-48 h-48 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Grafiğin Ortasındaki Yazı (Görseldeki Gibi) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-white">{tasks.length}</span>
                  <span className="text-xs text-slate-400">Toplam Görev</span>
                </div>
              </div>

              {/* Sağ Taraf: Göstergeler (Legend) */}
              <div className="flex-1 w-full flex justify-around items-center border-t md:border-t-0 md:border-l border-slate-700 pt-6 md:pt-0 md:pl-8 gap-2">
                
                <div className="text-center w-full">
                  <div className="w-12 h-1.5 bg-yellow-400 mx-auto mb-3 rounded-full"></div>
                  <p className="text-3xl font-bold text-white">{todoTasks.length}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Yapılacak</p>
                </div>
                
                <div className="text-center w-full border-l border-slate-700/50">
                  <div className="w-12 h-1.5 bg-blue-500 mx-auto mb-3 rounded-full"></div>
                  <p className="text-3xl font-bold text-white">{inProgressTasks.length}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Devam Eden</p>
                </div>
                
                <div className="text-center w-full border-l border-slate-700/50">
                  <div className="w-12 h-1.5 bg-emerald-500 mx-auto mb-3 rounded-full"></div>
                  <p className="text-3xl font-bold text-white">{doneTasks.length}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Tamamlanan</p>
                </div>

              </div>
            </div>
          )}
          {/* GRAFİK BÖLÜMÜ BİTİŞİ */}
          {/* Grid yapısını dinamik yapıyoruz: Tümü seçiliyse 3 kolon, tek filtre varsa 1 geniş kolon */}
          <div className={`max-w-7xl mx-auto grid gap-6 ${filterStatus === '' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
            
            {/* Sadece "Tümü" veya "Yapılacaklar" seçiliyse bu bloğu render et */}
            {(filterStatus === '' || filterStatus === 'TODO') && (
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                <h3 className="text-lg font-bold text-slate-300 mb-4 flex justify-between">
                  Yapılacaklar <span className="bg-slate-700 px-2 py-0.5 rounded text-sm">{todoTasks.length}</span>
                </h3>
                {todoTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            )}

            {/* Sadece "Tümü" veya "Devam Edenler" seçiliyse bu bloğu render et */}
            {(filterStatus === '' || filterStatus === 'IN_PROGRESS') && (
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                <h3 className="text-lg font-bold text-blue-400 mb-4 flex justify-between">
                  Devam Edenler <span className="bg-slate-700 px-2 py-0.5 rounded text-sm text-slate-300">{inProgressTasks.length}</span>
                </h3>
                {inProgressTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            )}

            {/* Sadece "Tümü" veya "Tamamlananlar" seçiliyse bu bloğu render et */}
            {(filterStatus === '' || filterStatus === 'DONE') && (
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                <h3 className="text-lg font-bold text-emerald-400 mb-4 flex justify-between">
                  Tamamlananlar <span className="bg-slate-700 px-2 py-0.5 rounded text-sm text-slate-300">{doneTasks.length}</span>
                </h3>
                {doneTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            )}
          </div>

          {/* FAZ 5: Sayfalama (Pagination) Kontrolleri */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 gap-4">
              <button 
                onClick={() => fetchTasks(currentPage - 1)} 
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Önceki
              </button>
              <span className="text-slate-400 font-medium text-sm">
                Sayfa {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => fetchTasks(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki →
              </button>
            </div>
          )}
        </>
      )}

      {/* Görev Ekleme Modalı */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Yeni Görev Oluştur</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-1">Görev Başlığı *</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Açıklama</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-700">İptal</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl">Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;