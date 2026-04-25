/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // We will lock this down to your specific storage bucket (e.g., AWS/Cloudinary) later
      },
    ],
  },
};

module.exports = nextConfig;
