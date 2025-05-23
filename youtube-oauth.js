// YouTube OAuth Helper - Refresh Token almak için
// Bu scripti bir kez çalıştırıp refresh token alacağız

const https = require('https');
const url = require('url');

// YouTube OAuth ayarları
const CLIENT_ID = 'BURAYA_CLIENT_ID_GİRİN';
const CLIENT_SECRET = 'BURAYA_CLIENT_SECRET_GİRİN';
const REDIRECT_URI = 'http://localhost:8080';

// 1. ADIM: Authorization URL oluştur
function getAuthUrl() {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${REDIRECT_URI}&` +
        `scope=https://www.googleapis.com/auth/youtube.upload&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;
    
    console.log('\n🔗 Bu URL\'i tarayıcıda açın:');
    console.log('\n' + authUrl);
    console.log('\n📝 Giriş yaptıktan sonra gelen URL\'deki "code=" parametresini kopyalayın\n');
}

// 2. ADIM: Authorization Code ile Token al
async function getTokens(authCode) {
    const postData = `client_id=${CLIENT_ID}&` +
        `client_secret=${CLIENT_SECRET}&` +
        `code=${authCode}&` +
        `grant_type=authorization_code&` +
        `redirect_uri=${REDIRECT_URI}`;

    const options = {
        hostname: 'oauth2.googleapis.com',
        port: 443,
        path: '/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.refresh_token) {
                        console.log('\n✅ Başarılı! Refresh Token:');
                        console.log('\n' + response.refresh_token);
                        console.log('\n💡 Bu token\'ı GitHub Secrets\'a "YOUTUBE_REFRESH_TOKEN" olarak ekleyin\n');
                        resolve(response);
                    } else {
                        console.log('\n❌ Hata:', response);
                        reject(new Error('Refresh token alınamadı'));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

// Kullanım kılavuzu
console.log('🎥 YouTube OAuth Token Alma Rehberi');
console.log('=====================================\n');

console.log('📋 ÖNCELİKLE YAPIN:');
console.log('1. Bu scriptteki CLIENT_ID ve CLIENT_SECRET değerlerini değiştirin');
console.log('2. Google Cloud Console\'da Redirect URI olarak "http://localhost:8080" ekleyin\n');

console.log('📋 SONRA YAPIN:');
console.log('1. node youtube-oauth.js auth → Authorization URL alın');
console.log('2. URL\'i tarayıcıda açın ve Google\'a giriş yapın');
console.log('3. Çıkan URL\'deki code parametresini kopyalayın');
console.log('4. node youtube-oauth.js token [CODE] → Refresh token alın\n');

// Komut satırı argümanlarını kontrol et
const args = process.argv.slice(2);

if (args[0] === 'auth') {
    getAuthUrl();
} else if (args[0] === 'token' && args[1]) {
    getTokens(args[1]).catch(console.error);
} else {
    console.log('❌ Kullanım:');
    console.log('  node youtube-oauth.js auth');
    console.log('  node youtube-oauth.js token [AUTHORIZATION_CODE]');
}
