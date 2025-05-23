const { generateMotivationalText } = require('./generate-text');
const { convertTextToSpeech } = require('./text-to-speech');
const { downloadBackgroundVideos } = require('./download-videos');
const { createMotivationalVideo } = require('./create-video');
const { uploadToYouTube } = require('./upload-youtube');
const path = require('path');

async function main() {
  console.log('🎬 Motivasyon videosu oluşturuluyor...');
  
  try {
    // 1. Motivasyon metni oluştur
    console.log('📝 Motivasyon metni oluşturuluyor...');
    const { text, topic } = await generateMotivationalText();
    console.log('Oluşturulan metin:', text);

    // 2. Metni sese çevir
    console.log('🎤 Metin sese çevriliyor...');
    const audioPath = await convertTextToSpeech(text, 'temp/speech.mp3');

    // 3. Arkaplan videoları indir (isteğe bağlı)
    console.log('🎥 Arkaplan videoları indiriliyor...');
    const backgroundVideos = await downloadBackgroundVideos(1);

    // 4. Video oluştur
    console.log('🎬 Video oluşturuluyor...');
    const videoPath = await createMotivationalVideo(
      audioPath, 
      backgroundVideos, 
      'output/motivation_video.mp4'
    );

    // 5. YouTube'a yükle (test modunda değilse)
    if (process.env.TEST_MODE !== 'true') {
      console.log('📤 YouTube\'a yükleniyor...');
      const title = `Günlük Motivasyon - ${new Date().toLocaleDateString('tr-TR')}`;
      const description = `${text}\n\n#motivasyon #başarı #ilham #günlükmotiv #türkçe\n\nOtomatik oluşturulmuş günlük motivasyon videosu.`;
      
      const uploadResult = await uploadToYouTube(videoPath, title, description);
      console.log('✅ Video başarıyla yüklendi:', uploadResult.id);
    } else {
      console.log('🧪 Test modu: Video yüklenmedi');
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
