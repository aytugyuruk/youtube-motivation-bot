// scripts/text-to-speech.js
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');

async function convertTextToSpeech(text, outputPath = 'temp/speech.mp3') {
  try {
    // Google Cloud TTS istemcisi oluştur
    const client = new textToSpeech.TextToSpeechClient();

    // Metni SSML ile zenginleştir - daha doğal ve sürükleyici ses için
    const ssmlText = `<speak>
      <prosody rate="0.9" pitch="+0.2" volume="loud">
        <break time="700ms"/>
        <emphasis level="strong">${text}</emphasis>
        <break time="1000ms"/>
      </prosody>
    </speak>`;

    const request = {
      input: { ssml: ssmlText },
      voice: {
        languageCode: 'tr-TR',
        name: 'tr-TR-Wavenet-B',  // Türkçe kadın sesi (WaveNet modeli - daha doğal ses)
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        effectsProfileId: ['large-home-entertainment-class-device'], // Daha yüksek kalite için
        pitch: 0.2,                // Daha doğal ses tonu
        speakingRate: 0.85,        // Daha yavaş konuşma hızı (hikaye anlatımı için)
        volumeGainDb: 4.0,         // Daha yüksek ses seviyesi
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


