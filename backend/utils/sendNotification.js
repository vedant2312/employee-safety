let twilioClient = null;

const initTwilio = async () => {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  console.log('=== Initializing Twilio SMS ===');

  if (!accountSid || !authToken) {
    console.log('❌ Twilio credentials missing');
    return null;
  }

  try {
    const twilio = (await import('twilio')).default;
    twilioClient = twilio(accountSid, authToken);
    console.log('✅ Twilio client initialized');
    return twilioClient;
  } catch (error) {
    console.error('❌ Twilio init error:', error.message);
    return null;
  }
};

// 🔥 SMS ONLY FUNCTION
const sendSMS = async (to, message) => {
  try {
    const client = await initTwilio();

    if (!client) {
      return { success: false, message: 'SMS service not configured' };
    }

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioPhoneNumber) {
      return { success: false, message: 'TWILIO_PHONE_NUMBER missing' };
    }

    if (!to || !to.startsWith('+')) {
      return { success: false, message: 'Invalid phone number format' };
    }

    console.log(`📤 Sending SMS to ${to}...`);

    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    console.log('✅ SMS sent:', response.sid);

    return {
      success: true,
      sid: response.sid,
      method: 'sms'
    };

  } catch (error) {
    console.error('❌ SMS error:', error.message);

    return {
      success: false,
      message: error.message,
      method: 'sms'
    };
  }
};

export { sendSMS };
