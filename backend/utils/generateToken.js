import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role }, // Payload
    process.env.JWT_SECRET, // Secret key
    { expiresIn: '30d' } // Token expires in 30 days
  );
};

export default generateToken;