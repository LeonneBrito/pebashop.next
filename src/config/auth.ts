export default {
  jwt: {
    secret: process.env.SECRET || 'ABACATE',
    expiresIn: process.env.JWT_EXPIRES_TOKEN || '1d',
  },
};
