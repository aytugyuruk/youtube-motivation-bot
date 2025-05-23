// scripts/text-to-speech.js
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');

async function convertTextToSpeech(text, outputPath = 'temp/speech.mp3') {
  try {
    // Google Cloud TTS istemcisi oluştur
    const client = new textToSpeech.TextToSpeechClient();

    const request = {
      input: { text: text },
      voice: {
        languageCode: 'tr-TR',
        name: 'tr-TR-Wavenet-E',  // Kadın ses
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9,
        pitch: 0.0,
        volumeGainDb: 0.0
      }
    };

    const [response] = await client.synthesizeSpeech(request);
    
    // Temp klasörü oluştur
    const tempDir = path.dirname(outputPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Ses dosyasını kaydet
    fs.writeFileSync(outputPath, response.audioContent, 'binary');
    console.log(`Ses dosyası oluşturuldu: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('TTS hatası:', error);
    throw error;
  }
}

module.exports = { convertTextToSpeech };

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
