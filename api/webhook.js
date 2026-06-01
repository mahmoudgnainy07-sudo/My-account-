import { Hono } from 'hono';

const app = new Hono();

function parseBankSMS(smsBody) {
  const amountRegex = /(?:قيمة|amount|paid|بلغت|شراء بقيمة)\s*([0-9.,]+)/i;
  const matchAmount = smsBody.match(amountRegex);
  const amount = matchAmount ? parseFloat(matchAmount[1].replace(/,/g, '')) : 0;
  let type = smsBody.includes('إيداع') || smsBody.includes('deposit') || smsBody.includes('تحويل وارد') || smsBody.includes('راتب') ? 'إيراد' : 'مصروف';
  let description = 'معاملة بنكية';
  const storeRegex = /(?:at|في)\s+([^.\n]+)/i;
  const matchStore = smsBody.match(storeRegex);
  if (matchStore) description = matchStore[1].trim();
  return { amount, type, description };
}

app.post('/api/webhook.js', async (c) => {
  try {
    // قراءة نص الطلب بالكامل لتفادي تعليق الـ JSON parser
    const rawText = await c.req.text();
    let body;
    
    try {
      body = JSON.parse(rawText);
    } catch (jsonErr) {
      return c.json({ error: 'Invalid JSON format' }, 400);
    }

    if (body.apiKey !== process.env.WEBHOOK_API_KEY) {
      return c.json({ error: 'غير مصرح' }, 401);
    }

    const parsedData = parseBankSMS(body.smsBody || '');
    console.log("تم الاستقبال:", parsedData);
    return c.json({ success: true, data: parsedData });
  } catch (e) {
    return c.json({ error: 'خطأ داخلي في السيرفر' }, 500);
  }
});

export default app.fetch;
