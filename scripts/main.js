const { generateMotivationalText } = require('./generate-text');
const { convertTextToSpeech } = require('./text-to-speech');
const { downloadBackgroundVideos } = require('./download-videos');
const { createMotivationalVideo } = require('./create-video');
const { uploadToYouTube } = require('./upload-youtube');
const path = require('path');

async function main() {
  console.log('🎥 YouTube Shorts motivasyon videosu oluşturuluyor...');
  
  try {
    // 1. Kısa motivasyon metni oluştur
    console.log('📝 Kısa motivasyon metni oluşturuluyor...');
    const { text, topic } = await generateMotivationalText();
    console.log('Oluşturulan metin:', text);

    // 2. Metni yüksek kaliteli sese çevir
    console.log('🎤 Metin yüksek kaliteli sese çevriliyor...');
    const audioPath = await convertTextToSpeech(text, 'temp/speech.mp3');

    // 3. Yüksek kaliteli dikey arkaplan videoları indir
    console.log('🎥 Yüksek kaliteli dikey arkaplan videoları indiriliyor...');
    const backgroundVideos = await downloadBackgroundVideos(2); // 2 video indiriyoruz

    // 4. YouTube Shorts formatında video oluştur (9:16 dikey format)
    console.log('🎥 YouTube Shorts videosu oluşturuluyor...');
    const videoPath = await createMotivationalVideo(
      audioPath, 
      backgroundVideos, 
      'output/shorts_motivation.mp4'
    );

    // 5. YouTube Shorts olarak yükle (test modunda değilse)
    if (process.env.TEST_MODE !== 'true') {
      console.log('📤 YouTube Shorts olarak yükleniyor...');
      
      // Shorts için kısa ve dikkat çekici başlık
      const today = new Date();
      const formattedDate = today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
      const title = `${topic.charAt(0).toUpperCase() + topic.slice(1)} İçin Günlük Motivasyon | ${formattedDate} #shorts`;
      
      // Shorts için optimize edilmiş açıklama ve etiketler
      const description = `${text}\n\n#shorts #motivasyon #${topic.replace(/\s+/g, '')} #kısamotiv #türkçe #günlükmotivasyon #başarı #ilham`;
      
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
