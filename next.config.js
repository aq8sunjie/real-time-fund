/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const forCapacitor = process.env.CAPACITOR_BUILD === '1';
const nextConfig = {
  output: 'export',
  // 打包成 Android App（Capacitor）时不用 basePath；否则生产环境用 GitHub Pages 路径
  basePath: forCapacitor ? '' : (isProd ? '/real-time-fund' : ''),
  images: { unoptimized: true },
  assetPrefix: forCapacitor ? '' : (isProd ? '/real-time-fund/' : ''),
};
module.exports = nextConfig;
