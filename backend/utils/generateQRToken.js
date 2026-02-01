import crypto from 'crypto';

const generateQRToken = (employeeId, organizationId) => {
  // Create a unique token using employee + org + random string
  const data = `${employeeId}-${organizationId}-${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

export default generateQRToken;