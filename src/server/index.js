import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();

// دالة ذكية مبسطة لقراءة رسائل البنوك
function parseBankSMS(smsBody) {
  // البحث عن أرقام المبالغ في الرسالة
  const amountRegex = /(?:قيمة|amount|paid|بلغت|شراء بقيمة)\s*([0-9.,]+)/i;
  const matchAmount = smsBody.match(amountRegex);
  const amount = matchAmount ? parseFloat(matchAmount[1].replace(/,/g, '')) : 0;

  // تحديد هل هو مصروف أم إيراد
  let type = 'مصروف';
  if (smsBody.includes('إيداع') || smsBody.includes('deposit') || smsBody.includes('تحويل وارد') || smsBody.includes('راتب')) {
    type = 'إيراد';
  }

  // محاولة معرفة اسم المكان
  let description = 'معاملة بنكية';
  const storeRegex = /(?:at|في)\s+([^.\n]+)/i;
  const matchStore = smsBody.match(storeRegex);
  if (matchStore) description = matchStore[1].trim();

  return { amount, type, description };
}

// الرابط (Webhook) اللي تليفونك هيبعت عليه الرسائل
app.post('/webhook', async (c) => {
  try {
    const body = await c.req.json();
    
    // التحقق من الرقم السري لحماية سيرفرك
    if (body.apiKey !== process.env.WEBHOOK_API_KEY) {
      return c.json({ error: 'غير مصرح لك بالدخول' }, 401);
    }

    // تحليل الرسالة
    const parsedData = parseBankSMS(body.smsBody);

    // هنا السيرفر بيطبع النتيجة في الـ Logs (ولاحقاً نربطها بـ Google Sheets)
    console.log("تم استقبال رسالة بنجاح:", parsedData);

    return c.json({ success: true, data: parsedData });
  } catch (error) {
    return c.json({ error: 'حدث خطأ في قراءة البيانات' }, 500);
  }
});

export default app.fetch;
