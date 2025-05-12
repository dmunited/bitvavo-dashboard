import dynamic from 'next/dynamic';

// Disable SSR for the Home component
const Home = dynamic(() => import('../components/index.client'), { ssr: false });

// Force dynamic rendering for Netlify
export const config = {
  unstable_runtimeJS: true,
  unstable_JsPreload: false
};

export default Home;