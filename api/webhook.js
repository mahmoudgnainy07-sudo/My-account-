const parseBankSMS = (smsBody) => {
  if (!smsBody) return { amount: 0, type: 'مصروف', description: 'رسالة فارغة' };
  
  const amountRegex = /(?:قيمة|amount|paid|بلغت|شراء بقيمة)\s*([0-9.,]+)/i;
  const matchAmount = smsBody.match(amountRegex);
  const amount = matchAmount ? parseFloat(matchAmount[1].replace(/,/g, '')) : 0;
  
  let type = smsBody.includes('إيداع') || smsBody.includes('deposit') || smsBody.includes('تحويل وارد') || smsBody.includes('راتب') ? 'إيراد' : 'مصروف';
  let description = 'معاملة بنكية';
  
  const storeRegex = /(?:at|في)\s+([^.\n]+)/i;
  const matchStore = smsBody.match(storeRegex);
  if (matchStore) description = matchStore[1].trim();
  
  return { amount, type, description };
};

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(200).json({ success: false, error: 'Method not allowed' });
  }

  try {
    let smsBody = '';
    
    if (request.body) {
      if (typeof request.body === 'string') {
        try {
          const parsed = JSON.parse(request.body);
          smsBody = parsed.smsBody || request.body;
        } catch (e) {
          smsBody = request.body;
        }
      } else {
        smsBody = request.body.smsBody || JSON.stringify(request.body);
      }
    }

    const parsedData = parseBankSMS(smsBody);
    
    // إرسال البيانات لـ Make بشكل آمن تماماً في الخلفية
    fetch("https://hook.eu1.make.com/k439wwu2yryclnm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parsedData.amount,
        type: parsedData.type,
        description: parsedData.description,
        rawSMS: smsBody,
        date: new Date().toISOString()
      })
    }).catch(err => console.error("Make Error:", err.message));

    // الرد الفوري بـ 200 للموبايل
    return response.status(200).json({ success: true, data: parsedData });
  } catch (error) {
    return response.status(200).json({ success: false, error: error.message });
  }
};
