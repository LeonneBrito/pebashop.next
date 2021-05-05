export default {
  jwt: {
    secret: process.env.SECRET,
    expiresIn: process.env.JWT_EXPIRES_TOKEN,
  },
};
