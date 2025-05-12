import dynamic from 'next/dynamic';

// ✅ Gebruik het juiste pad naar components-map
const Home = dynamic(() => import('../components/index.client'), { ssr: false });

export default Home;
