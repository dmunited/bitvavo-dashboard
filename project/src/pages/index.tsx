// @ts-expect-error dynamic is a reserved export used by Netlify for SSR
export const dynamic = 'force-dynamic';

import dynamic from 'next/dynamic';

const Home = dynamic(() => import('../components/index.client'), { ssr: false });

export default Home;
