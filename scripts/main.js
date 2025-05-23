const { generateStoryText } = require('./generate-text');
const { convertTextToSpeech } = require('./text-to-speech');
const { downloadBackgroundVideos } = require('./download-videos');
const { createStoryVideo } = require('./create-video');
const { uploadToYouTube } = require('./upload-youtube');
const path = require('path');

async function main() {
  console.log('🎥 YouTube Shorts hikaye videosu oluşturuluyor...');
  
  try {
    // 1. Sürükleyici hikaye metni oluştur
    console.log('📝 Sürükleyici hikaye metni oluşturuluyor...');
    const { text, topic } = await generateStoryText();
    console.log('Oluşturulan metin:', text);

    // 2. Metni yüksek kaliteli sese çevir
    console.log('🎤 Metin yüksek kaliteli sese çevriliyor...');
    const audioPath = await convertTextToSpeech(text, 'temp/speech.mp3');

    // 3. Yüksek kaliteli dikey arkaplan videoları indir
    console.log('🎥 Yüksek kaliteli dikey arkaplan videoları indiriliyor...');
    const backgroundVideos = await downloadBackgroundVideos(2); // 2 video indiriyoruz

    // 4. YouTube Shorts formatında video oluştur (9:16 dikey format)
    console.log('🎥 YouTube Shorts hikaye videosu oluşturuluyor...');
    const videoPath = await createStoryVideo(
      audioPath, 
      backgroundVideos, 
      'output/shorts_story.mp4'
    );

    // 5. YouTube Shorts olarak yükle (test modunda değilse)
    if (process.env.TEST_MODE !== 'true') {
      console.log('📤 YouTube Shorts olarak yükleniyor...');
      
      // Video süresini 20 saniye ile sınırlat çekici başlık
      const today = new Date();
      const formattedDate = today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
      const title = `${topic.charAt(0).toUpperCase() + topic.slice(1)} Hikayesi | Part 1 | ${formattedDate} #shorts`;
      
      // Shorts için optimize edilmiş açıklama ve etiketler
      const description = `${text}\n\n#shorts #hikaye #${topic.replace(/\s+/g, '')} #ilgiçekici #türkçe #kısahikaye #part1 #devamıgelecek`;
      
      const uploadResult = await uploadToYouTube(videoPath, title, description);
      console.log('✅ YouTube Shorts başarıyla yüklendi:', uploadResult.url);
    } else {
      console.log('🧪 Test modu: YouTube Shorts yüklenmedi');
    }

    console.log('🎉 İşlem tamamlandı!');

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
    process.exit(1);
  }
}

// GitHub Actions'dan çağrıldığında çalıştır
if (require.main === module) {
  main();
}

module.exports = { main };
