import '/index.css'
import '/reset.css'
import config from '@kaliber/config'
import App from '/App?universal'
import javascript from '@kaliber/build/lib/javascript'
import stylesheet from '@kaliber/build/lib/stylesheet'

export default (
  <html lang='en'>
    <head>
      <meta charSet='utf-8' />
      <title>@kaliber/sanity-image</title>
      {stylesheet}
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      {javascript}
    </head>
    <body>
      <App config={config.client} />
    </body>
  </html>
)
