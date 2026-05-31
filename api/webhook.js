import { Hono } from 'hono';
import { handle } from 'hono/vercel';

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

app.post('/webhook', async (c) => {
  try {
    const body = await c.req.json();
    if (body.apiKey !== process.env.WEBHOOK_API_KEY) return c.json({ error: 'غير مصرح' }, 401);
    const parsedData = parseBankSMS(body.smsBody);
    console.log("تم الاستقبال:", parsedData);
    return c.json({ success: true, data: parsedData });
  } catch (e) {
    return c.json({ error: 'خطأ' }, 500);
  }
});

export default handle(app);
