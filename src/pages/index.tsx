import dynamic from 'next/dynamic';

// ✅ Voorkom SSR van de homepage door deze client-only te maken
const Home = dynamic(() => import('../components/index.client'), { ssr: false });

export default Home;
