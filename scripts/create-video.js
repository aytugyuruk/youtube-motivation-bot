const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

async function createMotivationalVideo(audioPath, backgroundVideos = [], outputPath = 'output/motivation_video.mp4') {
  return new Promise((resolve, reject) => {
    try {
      // Output klasörü oluştur
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      let command = ffmpeg();

      if (backgroundVideos.length > 0) {
        // Arkaplan videosu varsa
        command
          .input(backgroundVideos[0])
          .input(audioPath)
          .outputOptions([
            '-c:v libx264',
            '-c:a aac',
            '-shortest',
            '-filter_complex [0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1[v]',
            '-map [v]',
            '-map 1:a',
            '-r 30',
            '-preset fast'
          ]);
      } else {
        // Sadece ses + statik arkaplan
        command
          .input(audioPath)
          .inputOptions([
            '-f lavfi',
            '-i color=c=black:s=1920x1080:d=60'  // 60 saniye siyah arkaplan
          ])
          .outputOptions([
            '-c:v libx264',
            '-c:a aac',
            '-shortest',
            '-r 30',
            '-preset fast'
          ]);
      }

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

module.exports = { createMotivationalVideo };
