
const nextConfig = {
  images: {
    domains: ['pixabay.com', 'cdn.pixabay.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.pixabay.com',
      },
    ],
  },
};

export default nextConfig;
