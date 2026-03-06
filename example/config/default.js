const sanity = {
  projectId: '5r7p2zew',
  dataset: 'dev',
  apiVersion: '2021-10-12',
}

module.exports = {
  kaliber: {
    includeInServerCompilation: [
      /^@kaliber\/use-observed-ref/,
      /^@kaliber\/use-element-size/,
      /^@kaliber\/sanity-image/
    ],
    /** @arg {Error} e */
    reportError(e) { console.error(e) },
  },
  client: {
    sanity: {
      ...sanity,
      token: null,
      useCdn: process.env.NODE_ENV === 'production'
    }
  }
}
