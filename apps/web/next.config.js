const withTM = require('next-transpile-modules')(['db'])

module.exports = withTM({
  reactStrictMode: true,
  images: {
    domains: ['cdn.discordapp.com', 'eu.ui-avatars.com'],
  },
})
