const { google } = require('googleapis');
const fs = require('fs');

async function uploadToYouTube(videoPath, title, description) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/youtube.upload']
    });

    const youtube = google.youtube({ version: 'v3', auth });

    // YouTube Shorts için optimize edilmiş metadata
    const videoMetadata = {
      snippet: {
        title: title,
        description: description,
        tags: [
          'shorts',           // Shorts etiketi önemli
          'motivasyon', 
          'başarı', 
          'ilham', 
          'motivasyonshorts',
          'kısamotiv',
          'türkçe',
          'günlük',
          'motivasyonvideo'
        ],
        categoryId: '22',     // People & Blogs
        defaultLanguage: 'tr',
        defaultAudioLanguage: 'tr'
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false,  // Çocuklar için değil
      }
    };

    const media = {
      body: fs.createReadStream(videoPath)
    };

    console.log('YouTube Shorts videosu yükleniyor...');
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: videoMetadata,
      media: media,
      notifySubscribers: true  // Abonelere bildirim gönder
    });

    const videoId = response.data.id;
    const videoUrl = `https://youtube.com/shorts/${videoId}`;
    console.log('YouTube Shorts videosu yüklendi:', videoUrl);
    
    return {
      id: videoId,
      url: videoUrl,
      isShort: true
    };

  } catch (error) {
    console.error('YouTube yükleme hatası:', error);
    throw error;
  }
}

module.exports = { uploadToYouTube };
