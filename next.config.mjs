/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@pinjaman/shared", "@pinjaman/db"]
};

export default nextConfig;
