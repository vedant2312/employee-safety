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
      return { success: false, message: 'WhatsApp service not configured' };
    }

    // Validate phone number
    if (!to || !to.startsWith('+')) {
      console.error('❌ Invalid phone number format. Must start with +');
      return { success: false, message: 'Invalid phone number format' };
    }

    // Format phone number for WhatsApp
    const whatsappNumber = `whatsapp:${to}`;
    
    console.log(`📱 Sending WhatsApp to ${to}...`);
    
    const response = await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Twilio WhatsApp Sandbox
      to: whatsappNumber
    });

    console.log('✅ WhatsApp sent successfully:', response.sid);
    return { success: true, sid: response.sid, method: 'whatsapp' };
  } catch (error) {
    console.error('❌ Error sending WhatsApp:', error.message);
    console.error('Error code:', error.code);
    
    // Better error messages
    if (error.code === 63007) {
      return { 
        success: false, 
        message: 'Phone number not registered with WhatsApp Sandbox. Ask recipient to join.', 
        method: 'whatsapp' 
      };
    }
    
    return { success: false, message: error.message, method: 'whatsapp' };
  }
};

// Send SMS (fallback)
const sendSMS = async (to, message) => {
  try {
    const client = await initTwilio();
    
    if (!client) {
      console.warn('⚠️ Twilio not configured.');
      return { success: false, message: 'SMS service not configured' };
    }

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioPhoneNumber) {
      console.warn('⚠️ SMS phone number not configured.');
      return { success: false, message: 'SMS phone number not configured' };
    }

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
    return { success: false, message: error.message, method: 'sms' };
  }
};

// Main function: Try WhatsApp first, fallback to SMS
const sendNotification = async (to, message) => {
  console.log(`\n📬 Sending notification to ${to}...`);
  
  // Try WhatsApp first
  const whatsappResult = await sendWhatsApp(to, message);
  
  // If WhatsApp succeeds, return
  if (whatsappResult.success) {
    return whatsappResult;
  }
  
  // If WhatsApp fails, try SMS as fallback
  console.log('📱 WhatsApp failed. Trying SMS fallback...');
  const smsResult = await sendSMS(to, message);
  
  return smsResult;
};

export default sendNotification;
export { sendSMS, sendWhatsApp };