// scripts/download-videos.js
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function downloadBackgroundVideos(count = 2) {
  const videos = [];
  
  try {
    // YouTube Shorts için dikey (portrait) videolar arayın
    // Daha sürükleyici temalar: gizem, bilim kurgu, macera, gerilim
    const queries = [
      'mystery+vertical',
      'sci+fi+vertical',
      'adventure+vertical',
      'suspense+vertical',
      'fantasy+vertical',
      'time+travel+vertical',
      'space+vertical',
      'futuristic+vertical',
      'cinematic+vertical',
      'dramatic+vertical'
    ];
    
    // Rastgele bir sorgu seç
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    // Pexels API'den dikey video ara
    const response = await fetch(`https://api.pexels.com/videos/search?query=${randomQuery}&orientation=portrait&per_page=15&size=medium`, {
      headers: {
        'Authorization': process.env.PEXELS_API_KEY
      }
    });

    const data = await response.json();
    
    if (!data.videos || data.videos.length === 0) {
      throw new Error('Pexels\'dan dikey video bulunamadı');
    }

    // En kaliteli videoları seç (yüksek çözünürlüklü ve kısa süreli)
    const filteredVideos = data.videos
      .filter(video => {
        // Video dosyasının en az bir HD veya daha yüksek kaliteli versiyonu olmalı
        const hasHDVersion = video.video_files.some(file => 
          (file.quality === 'hd' || file.quality === 'sd' || file.height >= 720) && 
          file.file_type === 'video/mp4'
        );
        
        // Video süresi 20-60 saniye arasında olmalı (daha uzun videolar için)
        const appropriateDuration = video.duration >= 20 && video.duration <= 60;
        
        return hasHDVersion && appropriateDuration;
      });

    // Rastgele videolar seç ve indir
    const selectedVideos = filteredVideos
      .sort(() => 0.5 - Math.random())
      .slice(0, count);

    if (selectedVideos.length === 0) {
      throw new Error('Uygun dikey video bulunamadı');
    }

    for (let i = 0; i < selectedVideos.length; i++) {
      const video = selectedVideos[i];
      
      // En yüksek kaliteli MP4 dosyasını seç (dikey format için)
      const videoFiles = video.video_files
        .filter(file => file.file_type === 'video/mp4')
        .sort((a, b) => {
          // Önce en yüksek çözünürlüklü olanları seç
          if (a.height !== b.height) return b.height - a.height;
          // Aynı çözünürlükte olanlar için en yüksek bit hızını seç
          return b.width - a.width;
        });

      const videoFile = videoFiles[0];

      if (videoFile) {
        const fileName = `background_${i + 1}.mp4`;
        const filePath = path.join('temp', fileName);
        
        console.log(`Yüksek kaliteli dikey video indiriliyor: ${fileName} (${videoFile.width}x${videoFile.height})`);
        await downloadFile(videoFile.link, filePath);
        videos.push(filePath);
      }
    }

    return videos;
  } catch (error) {
    console.error('Video indirme hatası:', error);
    // Fallback: boş dizi döndür, video olmadan sadece ses kullan
    return [];
  }
}

async function downloadFile(url, filePath) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, buffer);
  console.log(`Dosya kaydedildi: ${filePath}`);
}

module.exports = { downloadBackgroundVideos };
