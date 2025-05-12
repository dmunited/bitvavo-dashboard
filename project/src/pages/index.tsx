import dynamic from 'next/dynamic';

// Trigger redeploy - v1.3
// Voorkom SSR van de pagina zodat useSession() niet crasht bij build
const Home = dynamic(() => import('../components/index.client'), { ssr: false });

export default Home;
