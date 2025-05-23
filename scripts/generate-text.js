const fetch = require('node-fetch');

async function generateMotivationalText() {
  const topics = [
    "başarı ve azim",
    "kendine güven",
    "hedeflere odaklanma",
    "zorlukları aşma",
    "yeni başlangıçlar"
  ];
  
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://localhost',
        'X-Title': 'YouTube Motivation Bot'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Sen bir motivasyon uzmanısın. Kısa, güçlü ve ilham verici Türkçe motivasyon metinleri yazıyorsun. Her metin 40-60 saniyelik konuşma için uygun olmalı (yaklaşık 80-120 kelime).'
          },
          {
            role: 'user',
            content: `${randomTopic} konusunda günlük motivasyon mesajı yaz. Kişisel hitap et, pozitif ve harekete geçirici ol.`
          }
        ],
        max_tokens: 200,
        temperature: 0.8
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      return {
        text: data.choices[0].message.content.trim(),
        topic: randomTopic
      };
    } else {
      throw new Error('API yanıtı beklenmeyen formatta');
    }
  } catch (error) {
    console.error('Metin oluşturma hatası:', error);
    // Fallback metinler
    const fallbackTexts = [
      "Bugün yeni fırsatlarla dolu bir gün. Kendine inan, hedeflerine odaklan ve adım adım ilerle. Başarı senin elinde!",
      "Her zorluk seni daha güçlü yapıyor. Vazgeçme, sabırlı ol ve rüyalarının peşinden koş. Sen harikasın!",
      "Küçük adımlar büyük değişimler yaratır. Bugün kendini geliştirmek için bir şey yap. Potansiyelin sınırsız!"
    ];
    return {
      text: fallbackTexts[Math.floor(Math.random() * fallbackTexts.length)],
      topic: "genel motivasyon"
    };
  }
}

module.exports = { generateMotivationalText };

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
