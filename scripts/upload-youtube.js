const { google } = require('googleapis');
const fs = require('fs');

async function uploadToYouTube(videoPath, title, description) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/youtube.upload']
    });

    const youtube = google.youtube({ version: 'v3', auth });

    const videoMetadata = {
      snippet: {
        title: title,
        description: description,
        tags: ['motivasyon', 'başarı', 'ilham', 'günlük motiv', 'türkçe'],
        categoryId: '22', // People & Blogs
        defaultLanguage: 'tr',
        defaultAudioLanguage: 'tr'
      },
      status: {
        privacyStatus: 'public'
      }
    };

    const media = {
      body: fs.createReadStream(videoPath)
    };

    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: videoMetadata,
      media: media
    });

    console.log('Video yüklendi:', `https://youtube.com/watch?v=${response.data.id}`);
    return response.data;

  } catch (error) {
    console.error('YouTube yükleme hatası:', error);
    throw error;
  }
}

module.exports = { uploadToYouTube };
