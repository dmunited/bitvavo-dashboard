import { dynamic as forceDynamic } from './force-dynamic'; // <-- alias gebruiken om naamconflict te vermijden
import dynamicImport from 'next/dynamic'; // <-- hernoem deze import om geen conflict te veroorzaken

const Home = dynamicImport(() => import('../components/index.client'), { ssr: false });

export default Home;
