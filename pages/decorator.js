import Head from 'next/head';
import Scene from '../components/Scene';

export default function Decorator() {
  return (
    <div>
      <Head>
        <title>3D Home Decorator</title>
        <meta name="description" content="Interactive 3D Home Decoration App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='bg-white' >
        <h1>3D Home Decoration App</h1>
        <Scene />
      </main>

      <footer>
        {/* Footer content */}
      </footer>
    </div>
  );
}
