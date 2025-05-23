const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

async function createStoryVideo(audioPath, backgroundVideos = [], outputPath = 'output/story_video.mp4') {
  return new Promise((resolve, reject) => {
    try {
      // Output klasörü oluştur
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      let command = ffmpeg();

      // Video süresini 20 saniye ile sınırla
      const maxDuration = 20;

      if (backgroundVideos.length > 0) {
        // Arkaplan videosu varsa - YouTube Shorts formatı (9:16 dikey format)
        command
          .input(backgroundVideos[0])
          .input(audioPath)
          .outputOptions([
            '-c:v libx264',
            '-c:a aac',
            '-b:v 2500k',        // Daha yüksek video bit hızı
            '-b:a 192k',         // Daha yüksek ses bit hızı
            // '-shortest' komutunu kaldırıyorum, böylece video tam 20 saniye olacak
            '-t', maxDuration,   // Tam 20 saniye
            // 9:16 dikey format (1080x1920) - Telefon ekranı için
            '-filter_complex [0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,eq=brightness=0.05:saturation=1.3[v]',
            '-map [v]',
            '-map 1:a',
            '-r 30',
            '-preset slow',      // Daha yüksek kalite için 'slow' preset
            '-profile:v high',   // Yüksek profil
            '-level 4.2',        // Uyumlu seviye
            '-movflags +faststart' // Web'de daha hızlı başlatma
          ]);
      } else {
        // Sadece ses + gradyan arkaplan (daha çekici)
        command
          .input(audioPath)
          .inputOptions([
            '-f lavfi',
            // Siyah yerine mavi-mor gradyan arkaplan
            '-i color=c=blue:s=1080x1920:d=15,format=yuv420p,gradients=s=1080x1920:c0=0x000066:c1=0x9933ff:x0=0:y0=0:x1=1080:y1=1920:r=9'
          ])
          .outputOptions([
            '-c:v libx264',
            '-c:a aac',
            '-b:v 2500k',        // Daha yüksek video bit hızı
            '-b:a 192k',         // Daha yüksek ses bit hızı
            // '-shortest' komutunu kaldırıyorum, böylece video tam 20 saniye olacak
            '-t', maxDuration,   // Tam 20 saniye
            '-r 30',
            '-preset slow',      // Daha yüksek kalite için 'slow' preset
            '-profile:v high',   // Yüksek profil
            '-movflags +faststart' // Web'de daha hızlı başlatma
          ]);
      }

      // Altyazı ekle (opsiyonel)
      // Bu kısım metni video üzerine ekler
      // command.videoFilters({
      //   filter: 'drawtext',
      //   options: {
      //     fontfile: '/path/to/font.ttf',
      //     text: 'Motivasyon',
      //     fontsize: 48,
      //     fontcolor: 'white',
      //     x: '(w-text_w)/2',
      //     y: 'h-th-50',
      //     shadowcolor: 'black',
      //     shadowx: 2,
      //     shadowy: 2
      //   }
      // });

      command
        .output(outputPath)
        .on('end', () => {
          console.log('Video oluşturuldu:', outputPath);
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('Video oluşturma hatası:', err);
          reject(err);
        })
        .run();

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { createStoryVideo: createStoryVideo };
