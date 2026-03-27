/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@validately/shared", "@validately/db"],
};

module.exports = nextConfig;
