let twilioClient = null;

const initTwilio = async () => {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  console.log('=== Initializing Twilio ===');
  console.log('Account SID:', accountSid ? `${accountSid.substring(0, 10)}...` : 'NOT SET');
  console.log('Auth Token:', authToken ? 'SET (hidden)' : 'NOT SET');
  console.log('Phone Number:', twilioPhoneNumber || 'NOT SET');

  if (!accountSid || !authToken || !twilioPhoneNumber) {
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

const sendSMS = async (to, message) => {
  try {
    // Initialize Twilio client
    const client = await initTwilio();
    
    if (!client) {
      console.warn('⚠️ Twilio not configured. SMS not sent.');
      return { success: false, message: 'SMS service not configured' };
    }

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    // Validate phone number format
    if (!to || !to.startsWith('+')) {
      console.error('❌ Invalid phone number format. Must start with +');
      return { success: false, message: 'Invalid phone number format' };
    }

    console.log(`📤 Sending SMS to ${to}...`);
    
    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    console.log('✅ SMS sent successfully:', response.sid);
    return { success: true, sid: response.sid };
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    
    // Better error messages for common issues
    if (error.code === 21211) {
      return { success: false, message: 'Invalid phone number' };
    } else if (error.code === 21608) {
      return { success: false, message: 'Phone number not verified (Twilio trial account)' };
    }
    
    return { success: false, message: error.message };
  }
};

export default sendSMS;