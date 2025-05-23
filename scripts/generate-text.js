const fetch = require('node-fetch');

async function generateMotivationalText() {
  const topics = [
    "başarı ve azim",
    "kendine güven",
    "hedeflere odaklanma",
    "zorlukları aşma",
    "yeni başlangıçlar"
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
            content: 'Sen bir motivasyon uzmanısın. Kısa, güçlü ve ilham verici Türkçe motivasyon metinleri yazıyorsun. Her metin 40-60 saniyelik konuşma için uygun olmalı (yaklaşık 80-120 kelime).'
          },
          {
            role: 'user',
            content: `${randomTopic} konusunda günlük motivasyon mesajı yaz. Kişisel hitap et, pozitif ve harekete geçirici ol.`
          }
        ],
        max_tokens: 200,
        temperature: 0.8
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      return {
        text: data.choices[0].message.content.trim(),
        topic: randomTopic
      };
    } else {
      throw new Error('API yanıtı beklenmeyen formatta');
    }
  } catch (error) {
    console.error('Metin oluşturma hatası:', error);
    // Fallback metinler
    const fallbackTexts = [
      "Bugün yeni fırsatlarla dolu bir gün. Kendine inan, hedeflerine odaklan ve adım adım ilerle. Başarı senin elinde!",
      "Her zorluk seni daha güçlü yapıyor. Vazgeçme, sabırlı ol ve rüyalarının peşinden koş. Sen harikasın!",
      "Küçük adımlar büyük değişimler yaratır. Bugün kendini geliştirmek için bir şey yap. Potansiyelin sınırsız!"
    ];
    return {
      text: fallbackTexts[Math.floor(Math.random() * fallbackTexts.length)],
      topic: "genel motivasyon"
    };
  }
}

module.exports = { generateMotivationalText };

