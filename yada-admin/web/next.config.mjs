/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // L'URL de l'API est lue côté navigateur.
  env: { NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api' },
};
export default nextConfig;
