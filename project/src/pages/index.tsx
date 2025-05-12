// Version marker test from Bolt – v1.8
import dynamic from 'next/dynamic';

// Voorkom SSR van de pagina zodat useSession() niet crasht bij build
const Home = dynamic(() => import('../components/index.client'), { ssr: false });

export default Home;
