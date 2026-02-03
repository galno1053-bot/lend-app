/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@pinjaman/shared", "@pinjaman/db"],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@metamask/sdk": false,
      "react-native": false,
      "@react-native-async-storage/async-storage": false
    };
    return config;
  }
};

export default nextConfig;
