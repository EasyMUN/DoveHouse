export default {
  port: 46350,
  host: 'localhost',

  base: 'https://YOUR_FQDN',

  dburi: 'mongodb://localhost/dovehouse',

  secret: [
    'dovehouse',
  ],

  apikeys: {
    idverify: 'YONYOU APIKEY HERE',
  },

  mailer: {
    host: 'YOUR_SMTP_PROVIDER',
    port: 587,
    secure: false,

    from: 'DoveHouse <dovehouse@YOUR_FQDN>',

    auth: {
      user: 'YOUR_SMTP_USER',
      pass: 'YOUR_SMTP_CREDENTIAL',
    },
  },
}
