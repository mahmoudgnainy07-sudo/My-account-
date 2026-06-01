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

// التصدير المتوافق 100% مع بيئة Vercel Node.js التقليدية
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
    console.log("تم الاستقبال بنجاح:", parsedData);
    
    return response.status(200).json({ success: true, data: parsedData });
  } catch (error) {
    return response.status(200).json({ success: false, error: error.message });
  }
};
        smsBody = request.body.smsBody || JSON.stringify(request.body);
      }
    }

    const parsedData = parseBankSMS(smsBody);
    console.log("تم الاستقبال بنجاح:", parsedData);
    
    // الرد بـ 200 الأكيدة
    return response.status(200).json({ success: true, data: parsedData });
  } catch (error) {
    return response.status(200).json({ success: false, error: error.message });
  }
}
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
