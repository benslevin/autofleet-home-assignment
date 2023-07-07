import '@styles/globals.scss';
import Head from 'next/head'

function MyApp({ Component, pageProps }) {

  return <>
   <Head>
      <title>Test</title>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/leaflet.css" rel="stylesheet" key="test"/>
    </Head>
   <Component {...pageProps} />
  </>
    
}

export default MyApp
