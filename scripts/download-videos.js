// scripts/download-videos.js
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function downloadBackgroundVideos(count = 3) {
  const videos = [];
  
  try {
    // Pexels API'den video ara
    const response = await fetch('https://api.pexels.com/videos/search?query=nature+calm+peaceful&per_page=10', {
      headers: {
        'Authorization': process.env.PEXELS_API_KEY
      }
    });

    const data = await response.json();
    
    if (!data.videos || data.videos.length === 0) {
      throw new Error('Pexels\'dan video bulunamadı');
    }

    // Rastgele videolar seç ve indir
    const selectedVideos = data.videos
      .sort(() => 0.5 - Math.random())
      .slice(0, count);

    for (let i = 0; i < selectedVideos.length; i++) {
      const video = selectedVideos[i];
      const videoFile = video.video_files.find(file => 
        file.quality === 'hd' && file.file_type === 'video/mp4'
      ) || video.video_files[0];

      if (videoFile) {
        const fileName = `background_${i + 1}.mp4`;
        const filePath = path.join('temp', fileName);
        
        console.log(`Video indiriliyor: ${fileName}`);
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
}

module.exports = { downloadBackgroundVideos };
