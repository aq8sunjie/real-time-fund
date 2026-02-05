/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  // 必须配置：输出为静态文件
  output: 'export',
  // 仅在生产（如 GitHub Pages）使用 basePath；本地开发用根路径，避免 404
  basePath: isProd ? '/real-time-fund' : '',
  // 可选：配置图片优化等，静态导出时需注意限制
  images: {
    unoptimized: true,
  },
  // 生产环境资源前缀与 basePath 一致；本地开发不用
  assetPrefix: isProd ? '/real-time-fund/' : '',
};
module.exports = nextConfig;
