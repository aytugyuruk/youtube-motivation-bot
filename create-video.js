const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const FormData = require('form-data');

// Motivasyon başlıkları listesi
const motivationTitles = [
    "Hayallerinin Peşinden Koş",
    "Başarı Senin Ellerinde",
    "Vazgeçmek Yok, Sadece İlerlemek Var",
    "Her Gün Yeni Bir Fırsat",
    "Kendine İnan, Başaracaksın",
    "Zorluklar Seni Güçlendirir",
    "Bugün Harika Bir Gün",
    "İmkansız Diye Bir Şey Yok",
    "Sen Eşsizsin, Sen Güçlüsün",
    "Başarı Sabırla Gelir"
];

// 1. ADIM: Motivasyon metni üret
async function generateMotivationText() {
    console.log('📝 Motivasyon metni üretiliyor...');
    
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "openai/gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: "2 dakikalık motivasyonel bir konuşma yaz. Hayatın zorluklarına karşı insanları motive etsin. Türkçe olsun. Sadece konuşma metnini ver, başka açıklama ekleme."
            }]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const text = response.data.choices[0].message.content;
        console.log('✅ Metin üretildi:', text.substring(0, 100) + '...');
        return text;
    } catch (error) {
        console.error('❌ Metin üretme hatası:', error.message);
        return "Bugün harika bir gün! Sen güçlüsün ve her zorluğun üstesinden gelebilirsin. Hayallerinin peşinden koş ve asla vazgeçme!";
    }
}

// 2. ADIM: Metni sese çevir
async function textToSpeech(text) {
    console.log('🔊 Metin sese çevriliyor...');
    
    try {
        const response = await axios.post(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`, {
            input: { text: text },
            voice: { languageCode: 'tr-TR', name: 'tr-TR-Wavenet-E' },
            audioConfig: { audioEncoding: 'MP3' }
        });
        
        const audioContent = response.data.audioContent;
        fs.writeFileSync('speech.mp3', audioContent, 'base64');
        console.log('✅ Ses dosyası oluşturuldu: speech.mp3');
        return 'speech.mp3';
    } catch (error) {
        console.error('❌ TTS hatası:', error.message);
        throw error;
    }
}

// 3. ADIM: Stok video indir
async function downloadStockVideo() {
    console.log('🎥 Stok video indiriliyor...');
    
    try {
        // Motivasyonel anahtar kelimeler
        const keywords = ['motivation', 'success', 'nature', 'sunrise', 'mountain', 'ocean', 'forest'];
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        
        const response = await axios.get(`https://api.pexels.com/videos/search?query=${randomKeyword}&per_page=10`, {
            headers: {
                'Authorization': process.env.PEXELS_API_KEY
            }
        });
        
        if (response.data.videos.length > 0) {
            const randomVideo = response.data.videos[Math.floor(Math.random() * response.data.videos.length)];
            const videoUrl = randomVideo.video_files.find(file => file.quality === 'hd').link;
            
            // Video dosyasını indir
            const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
            const writer = fs.createWriteStream('background.mp4');
            videoResponse.data.pipe(writer);
            
            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log('✅ Video indirildi: background.mp4');
                    resolve('background.mp4');
                });
                writer.on('error', reject);
            });
        }
    } catch (error) {
        console.error('❌ Video indirme hatası:', error.message);
        // Fallback: Basit renk videosu oluştur
        return createFallbackVideo();
    }
}

// Yedek video oluştur
function createFallbackVideo() {
    console.log('🎨 Yedek video oluşturuluyor...');
    return new Promise((resolve, reject) => {
        exec('ffmpeg -f lavfi -i color=c=blue:size=1920x1080:duration=120 -c:v libx264 background.mp4 -y', (error) => {
            if (error) {
                reject(error);
            } else {
                console.log('✅ Yedek video oluşturuldu');
                resolve('background.mp4');
            }
        });
    });
}

// 4. ADIM: Video ve sesi birleştir
async function combineVideoAudio(videoFile, audioFile) {
    console.log('🎬 Video ve ses birleştiriliyor...');
    
    return new Promise((resolve, reject) => {
        const outputFile = 'final_video.mp4';
        const command = `ffmpeg -i ${videoFile} -i ${audioFile} -c:v copy -c:a aac -shortest ${outputFile} -y`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Video birleştirme hatası:', error);
                reject(error);
            } else {
                console.log('✅ Final video oluşturuldu:', outputFile);
                resolve(outputFile);
            }
        });
    });
}

// 5. ADIM: YouTube'a yükle
async function uploadToYouTube(videoFile, title, description) {
    console.log('📤 YouTube\'a yükleniyor...');
    
    try {
        // Access token al
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.YOUTUBE_CLIENT_ID,
            client_secret: process.env.YOUTUBE_CLIENT_SECRET,
            refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
            grant_type: 'refresh_token'
        });
        
        const accessToken = tokenResponse.data.access_token;
        
        // Video metadata
        const metadata = {
            snippet: {
                title: title,
                description: description,
                categoryId: '22',
                tags: ['motivasyon', 'başarı', 'ilham', 'kişisel gelişim']
            },
            status: {
                privacyStatus: 'public'
            }
        };
        
        // Form data hazırla
        const form = new FormData();
        form.append('metadata', JSON.stringify(metadata), {
            contentType: 'application/json'
        });
        form.append('media', fs.createReadStream(videoFile), {
            contentType: 'video/mp4'
        });
        
        // Upload
        const uploadResponse = await axios.post(
            'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status',
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'Authorization': `Bearer ${accessToken}`
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );
        
        console.log('✅ Video YouTube\'a yüklendi:', uploadResponse.data.id);
        return uploadResponse.data.id;
    } catch (error) {
        console.error('❌ YouTube yükleme hatası:', error.message);
        throw error;
    }
}

// ANA FONKSİYON
async function main() {
    try {
        console.log('🚀 Motivasyon videosu oluşturma başladı...');
        
        // 1. Metin üret
        const motivationText = await generateMotivationText();
        
        // 2. Sese çevir
        const audioFile = await textToSpeech(motivationText);
        
        // 3. Video indir
        const videoFile = await downloadStockVideo();
        
        // 4. Birleştir
        const finalVideo = await combineVideoAudio(videoFile, audioFile);
        
        // 5. YouTube'a yükle
        const randomTitle = motivationTitles[Math.floor(Math.random() * motivationTitles.length)];
        const description = `🌟 ${motivationText.substring(0, 200)}...\n\n#motivasyon #başarı #ilham #kişiselgelişim`;
        
        const videoId = await uploadToYouTube(finalVideo, randomTitle, description);
        
        console.log('🎉 Başarıyla tamamlandı! Video ID:', videoId);
        
        // Geçici dosyaları temizle
        ['speech.mp3', 'background.mp4', 'final_video.mp4'].forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });
        
    } catch (error) {
        console.error('💥 Genel hata:', error.message);
        process.exit(1);
    }
}

// Çalıştır
main();
