// scripts/text-to-speech.js
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');

async function convertTextToSpeech(text, outputPath = 'temp/speech.mp3') {
  try {
    // Google Cloud TTS istemcisi oluştur
    const client = new textToSpeech.TextToSpeechClient();

    // Metni SSML ile zenginleştir - daha doğal ses için
    const ssmlText = `<speak>
      <prosody rate="0.95" pitch="+0.5" volume="loud">
        <break time="500ms"/>
        ${text}
        <break time="700ms"/>
      </prosody>
    </speak>`;

    const request = {
      input: { ssml: ssmlText },
      voice: {
        languageCode: 'tr-TR',
        name: 'tr-TR-Standard-B',  // Türkçe kadın sesi (Standard modeli)
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        effectsProfileId: ['headphone-class-device'], // Daha yüksek kalite için
        pitch: 0.5,                // Biraz daha yüksek ses tonu
        speakingRate: 0.95,        // Biraz daha yavaş konuşma hızı
        volumeGainDb: 3.0,         // Biraz daha yüksek ses seviyesi
        sampleRateHertz: 24000     // Daha yüksek örnekleme hızı
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
    console.log(`Yüksek kaliteli ses dosyası oluşturuldu: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('TTS hatası:', error);
    throw error;
  }
}

module.exports = { convertTextToSpeech };


