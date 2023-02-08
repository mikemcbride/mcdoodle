import { Html, Head, Main, NextScript } from 'next/document'
import AppHeader from '../components/AppHeader.js'

export default function Document() {
  return (
    <Html className="h-full bg-gray-100">
      <Head>
        <meta charSet="UTF-8" />
      </Head>

      <body className="h-full">
        <div className="min-h-full">
          <AppHeader />
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Main />
          </div>
        </div>
        <NextScript />
      </body>
    </Html>
  )
}
