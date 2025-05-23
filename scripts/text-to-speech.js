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


