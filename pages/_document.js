import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html className="h-full bg-gray-100">
      <Head>
        <meta charSet="UTF-8" />
      </Head>
      <body className="h-full">
        <Main className="min-h-full" />
        <NextScript />
      </body>
    </Html>
  )
}
