# 🚀 Mini Görev Yöneticisi - Frontend (Web Arayüzü)
Bu proje, Mini Task Manager API'sinin kullanıcıyla buluştuğu modern, hızlı ve duyarlı web arayüzüdür. Kullanıcıların kendi projelerini yönetebileceği, görevleri takip edebileceği ve davet kodları ile arkadaşlarıyla ortak çalışabileceği şık bir kontrol paneli sunar.

# 📁 Temel Klasör Yapısı
```
src/
├── api/
│   └── axios.js           # İsteklere JWT token'ı otomatik ekleyen yapılandırma
├── pages/
│   ├── Login.jsx          # Kayıt Ol ve Giriş Yap ekranları
│   ├── Dashboard.jsx      # Projelerin listelendiği ve davet kodunun girildiği panel
│   └── ProjectDetail.jsx  # Görevlerin, grafiklerin ve onay bekleyen isteklerin olduğu detay sayfası
├── App.jsx                # Ana yönlendirmeler (Router) ve yetki kontrolleri
└── main.jsx               # React uygulamasının kök (root) noktası
```

---

# 🛠️ Kullanılan Teknolojiler
* Geliştirme Ortamı & Çerçeve: React.js & Vite

* Tasarım & Şekillendirme: Tailwind CSS (Modern ve esnek UI)

* HTTP İstemcisi: Axios (Token bazlı güvenli API istekleri için yapılandırıldı)

* Sayfa Yönlendirmeleri: React Router DOM

* Veri Görselleştirme: Recharts (Kapsamlı Donut Grafikleri)

* Kullanıcı Bildirimleri: React Toastify (Şık hata ve başarı mesajları)

---

# 🚀 Öne Çıkan Özellikler

* **Güvenli Oturum Yönetimi:** JWT ile giriş/çıkış işlemleri ve korumalı rotalar.

* **Ortak Proje Yönetimi:**

  * Her projenin benzersiz bir 6 haneli davet kodu bulunur.

  * Kullanıcılar bu kodu kullanarak diğer projelere katılma isteği gönderebilir.

  * Proje sahibi, gelen istekleri "Proje Detay" sayfasındaki özel panelden onaylayabilir veya reddedebilir.

* **Gelişmiş Görev Panosu:** Görevler "Yapılacak", "Devam Eden" ve "Tamamlanan" olarak listelenir ve filtrelenebilir.

* **Anlık İstatistikler:** Proje içindeki görev dağılımları dinamik Donut Grafik ile görselleştirilir.

---

# 💻 Kurulum ve Çalıştırma
Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

* ⚠️ Önemli Not: Frontend projesinin çalışabilmesi için öncelikle [Mini Görev Yöneticisi API (Backend)] projesinin bilgisayarınızda çalışır durumda olması gerekmektedir (Varsayılan olarak [http://127.0.0.1:8000](http://127.0.0.1:8000)).

**1. Repoyu Klonlayın:**
```bash
git clone https://github.com/ibrahimaral/Mini_Gorev_Frontend.git
cd Mini_Gorev_Frontend
```

---

**2. Gerekli Paketleri Yükleyin:**

Sisteminizde Node.js yüklü olduğundan emin olun.

```bash
npm install
```

---

**3. Çevre Değişkenlerini Ayarlayın:**

Proje ana dizininde .env adında bir dosya oluşturun ve backend API adresinizi içine yapıştırın.

**Kod snippet:**
```Kod snippet
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```
(Not: Eğer src/api/axios.js içinde URL'yi manuel tanımladıysanız bu adımı atlayabilirsiniz.)

---

**4. Geliştirme Sunucusunu Başlatın:**

```bash
npm run dev
```

---

**5. Tarayıcıda Görüntüleyin:**
Terminalde beliren adrese (genellikle http://localhost:5173) tıklayarak uygulamayı tarayıcınızda açın. Kayıt olup hemen yeni projeler oluşturmaya ve görevlerinizi yönetmeye başlayabilirsiniz!
