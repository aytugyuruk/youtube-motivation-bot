const fetch = require('node-fetch');

async function generateStoryText() {
  // YouTube Shorts için ilgi çekici hikaye konuları
  const topics = [
    "gizem ve macera",
    "bilim kurgu",
    "romantik gerilim",
    "doğaüstü olaylar",
    "tarihi sırlar",
    "paralel evrenler",
    "zamanda yolculuk",
    "yapay zeka",
    "distopik gelecek",
    "kayıp hazineler"
  ];
  
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://localhost',
        'X-Title': 'YouTube Story Bot'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Sen bir TikTok ve YouTube Shorts hikaye anlatıcısısın. Çok sürükleyici, merak uyandırıcı ve ilgi çekici Türkçe hikaye metinleri yazıyorsun. Her hikaye 20 saniyelik konuşma için uygun olmalı (yaklaşık 40-50 kelime). Hikaye heyecanlı bir yerde kesilmeli ve "Devamı Part 2\'de" diyerek bitmeli. Emoji kullanma.'
          },
          {
            role: 'user',
            content: `${randomTopic} konusunda 20 saniyelik bir YouTube Shorts videosu için çok sürükleyici ve ilgi çekici bir hikaye metni yaz. Hikaye heyecanlı bir yerde kesilmeli ve "Devamı Part 2'de" diyerek bitmeli. Metin 40-50 kelimeyi geçmemeli.`
          }
        ],
        max_tokens: 150,
        temperature: 0.9
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      // Metni düzenle
      let text = data.choices[0].message.content.trim();
      
      // Metni 50 kelimeye kadar kısalt
      const words = text.split(/\s+/);
      if (words.length > 50) {
        text = words.slice(0, 50).join(' ');
      }
      
      // Eğer "Devamı Part 2'de" ifadesi yoksa ekle
      if (!text.includes("Devamı Part 2'de") && !text.includes('Devamı Part 2\'de')) {
        text = text + " Devamı Part 2'de";
      }
      
      return {
        text: text,
        topic: randomTopic
      };
    } else {
      throw new Error('API yanıtı beklenmeyen formatta');
    }
  } catch (error) {
    console.error('Hikaye metni oluşturma hatası:', error);
    // Shorts için fallback hikaye metinleri
    const fallbackTexts = [
      "Karanlık odada bir ışık belirdi. Kapı yavaşça açıldı ve içeri giren siluetin gözleri parlıyordu. Elindeki haritayı açtığında, gizli hazineye giden yolu bulduğunu anladı. Devamı Part 2'de",
      "Saatine baktı, zaman durmuştu. Etrafındaki herkes donmuş gibiydi. Sadece o hareket edebiliyordu. Pencereden dışarı baktığında gördüğü şey onu şoke etti. Devamı Part 2'de",
      "Telefonuna gelen mesaj hayatını değiştirecekti: 'Geçmişi değiştirmek için son şansın.' Koordinatları takip ettiğinde, eski bir laboratuvarla karşılaştı. Kapıyı açtığında... Devamı Part 2'de",
      "Yapay zeka asistanı aniden ekrandan çıkıp gerçek dünyada belirdi. 'Sana göstermem gereken bir şey var' dedi. Elini uzattığında, parmak uçlarından mavi bir ışık yayıldı. Devamı Part 2'de",
      "Aynaya baktığında kendi yansıması yerine başka birini gördü. Yansıma ona gülümsedi ve 'Sonunda buluştuk' dedi. Elini aynaya uzattığında... Devamı Part 2'de"
    ];
    return {
      text: fallbackTexts[Math.floor(Math.random() * fallbackTexts.length)],
      topic: randomTopic
    };
  }
}

module.exports = { generateStoryText: generateStoryText };

