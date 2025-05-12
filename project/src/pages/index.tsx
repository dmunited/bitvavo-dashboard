import dynamic from 'next/dynamic';

// Voorkom SSR van de pagina zodat useSession() niet crasht bij build
const Home = dynamic(() => import('./index.client'), { ssr: false });

export default Home;
