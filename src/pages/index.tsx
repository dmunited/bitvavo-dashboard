import dynamic from 'next/dynamic';

const Home = dynamic(() => import('../components/index.client'), { ssr: false });

export default Home;
