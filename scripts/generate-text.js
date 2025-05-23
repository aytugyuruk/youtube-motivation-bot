const fetch = require('node-fetch');

async function generateMotivationalText() {
  // YouTube Shorts için daha çekici konular
  const topics = [
    "başarı ve azim",
    "kendine güven",
    "hedeflere odaklanma",
    "zorlukları aşma",
    "yeni başlangıçlar",
    "motivasyon",
    "pozitif düşünce",
    "hayallerini gerçekleştirme",
    "iç huzur",
    "güçlü olmak"
  ];
  
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://localhost',
        'X-Title': 'YouTube Motivation Bot'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Sen bir TikTok ve YouTube Shorts motivasyon içerik üreticisisin. Çok kısa, güçlü ve sürükleyici Türkçe motivasyon metinleri yazıyorsun. Her metin 10-15 saniyelik konuşma için uygun olmalı (yaklaşık 20-30 kelime). Metin kısa, vurucu ve akılda kalıcı olmalı. Emoji kullanma.'
          },
          {
            role: 'user',
            content: `${randomTopic} konusunda 10-15 saniyelik bir YouTube Shorts videosu için çok kısa, güçlü ve sürükleyici bir motivasyon mesajı yaz. Kişisel hitap et, pozitif ve harekete geçirici ol. Metin 20-30 kelimeyi geçmemeli.`
          }
        ],
        max_tokens: 100,
        temperature: 0.9
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      // Metni kısalt ve düzenle
      let text = data.choices[0].message.content.trim();
      
      // Metni 30 kelimeye kadar kısalt
      const words = text.split(/\s+/);
      if (words.length > 30) {
        text = words.slice(0, 30).join(' ') + '!';
      }
      
      return {
        text: text,
        topic: randomTopic
      };
    } else {
      throw new Error('API yanıtı beklenmeyen formatta');
    }
  } catch (error) {
    console.error('Metin oluşturma hatası:', error);
    // Shorts için daha kısa fallback metinler
    const fallbackTexts = [
      "Kendine inan! Bugün senin günün, harekete geç!",
      "Vazgeçme! Her zorluk seni daha güçlü yapıyor!",
      "Hayallerin için bugün bir adım at. Yarın çok geç olabilir!",
      "Başarı, konfor alanının dışında başlar. Şimdi harekete geç!",
      "Düştüğün yerden kalk ve devam et. Asla pes etme!"
    ];
    return {
      text: fallbackTexts[Math.floor(Math.random() * fallbackTexts.length)],
      topic: "motivasyon"
    };
  }
}

module.exports = { generateMotivationalText };

