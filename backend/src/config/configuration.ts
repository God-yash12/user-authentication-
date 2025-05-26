export default () => ({
  recaptcha: {
    secretKey: process.env.RECAPTCHA_SECRET_KEY,
    siteKey: process.env.RECAPTCHA_SITE_KEY,
  },
});