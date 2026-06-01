const { Hono } = require('hono');
const app = new Hono();

function parseBankSMS(smsBody) {
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
}

// مسار عام يستقبل من أي مكان لمنع الـ 404 والـ 500
app.all('*', async (c) => {
  try {
    const rawText = await c.req.text();
    let body = {};
    
    try {
      body = JSON.parse(rawText);
    } catch (jsonErr) {
      body = { smsBody: rawText };
    }

    const textToParse = body.smsBody || rawText || '';
    const parsedData = parseBankSMS(textToParse);
    
    return c.json({ success: true, data: parsedData }, 200);
  } catch (e) {
    return c.json({ success: false, error: e.message }, 200);
  }
});

module.exports = app.fetch;
    console.log("تم الاستقبال بنجاح:", parsedData);
    
    return c.json({ success: true, data: parsedData });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 200); // إجبار السيرفر يرد بـ 200 حتى لو حصلت حاجة
  }
});

export default app.fetch;
    return c.json({ error: 'خطأ داخلي في السيرفر' }, 500);
  }
});

export default app.fetch;
