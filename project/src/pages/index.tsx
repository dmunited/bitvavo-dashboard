// src/pages/index.tsx
import { dynamic } from './force-dynamic'; // haal 'force-dynamic' binnen
import dynamicImport from 'next/dynamic';

const Home = dynamicImport(() => import('../components/index.client'), { ssr: false });

export default Home;
