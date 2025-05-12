import dynamic from 'next/dynamic';

// Disable SSR for this client-only component
const Home = dynamic(() => import('../components/index.client'), { ssr: false });

export default Home;