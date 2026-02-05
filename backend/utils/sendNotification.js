let twilioClient = null;

const initTwilio = async () => {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  console.log('=== Initializing Twilio ===');
  console.log('Account SID:', accountSid ? `${accountSid.substring(0, 10)}...` : 'NOT SET');
  console.log('Auth Token:', authToken ? 'SET (hidden)' : 'NOT SET');

  if (!accountSid || !authToken) {
    console.log('❌ Twilio credentials missing');
    return null;
  }

  try {
    const twilio = (await import('twilio')).default;
    twilioClient = twilio(accountSid, authToken);
    console.log('✅ Twilio client initialized successfully');
    return twilioClient;
  } catch (error) {
    console.error('❌ Error initializing Twilio:', error.message);
    return null;
  }
};

// Send WhatsApp message
const sendWhatsApp = async (to, message) => {
  try {
    const client = await initTwilio();
    
    if (!client) {
      console.warn('⚠️ Twilio not configured.');
      return { success: false, message: 'Notification service not configured' };
    }

    // Format phone number for WhatsApp
    const whatsappNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    console.log(`📤 Sending WhatsApp to ${to}...`);
    
    const response = await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Twilio Sandbox number
      to: whatsappNumber
    });

    console.log('✅ WhatsApp sent successfully:', response.sid);
    return { success: true, sid: response.sid, method: 'whatsapp' };
  } catch (error) {
    console.error('❌ Error sending WhatsApp:', error.message);
    return { success: false, message: error.message, method: 'whatsapp' };
  }
};

// Send SMS (with fallback)
const sendSMS = async (to, message) => {
  try {
    const client = await initTwilio();
    
    if (!client) {
      console.warn('⚠️ Twilio not configured.');
      return { success: false, message: 'SMS service not configured' };
    }

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!to || !to.startsWith('+')) {
      console.error('❌ Invalid phone number format');
      return { success: false, message: 'Invalid phone number format' };
    }

    console.log(`📤 Sending SMS to ${to}...`);
    
    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    console.log('✅ SMS sent successfully:', response.sid);
    return { success: true, sid: response.sid, method: 'sms' };
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    
    // If SMS fails due to price limit, try WhatsApp
    if (error.code === 30044) {
      console.log('⚠️ SMS failed (price limit). Trying WhatsApp...');
      return await sendWhatsApp(to, message);
    }
    
    return { success: false, message: error.message, method: 'sms' };
  }
};

// Main function: Try SMS first, fallback to WhatsApp
const sendNotification = async (to, message) => {
  // Try SMS first
  const smsResult = await sendSMS(to, message);
  
  // If SMS succeeds, return
//   if (smsResult.success) {
//     return smsResult;
//   }
  
  // If SMS fails, try WhatsApp
//   console.log('📱 Falling back to WhatsApp...');
  return await sendWhatsApp(to, message);
};

export default sendNotification;
export { sendSMS, sendWhatsApp };