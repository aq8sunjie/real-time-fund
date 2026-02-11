process.env.CAPACITOR_BUILD = '1';
const { execSync } = require('child_process');
execSync('next build', { stdio: 'inherit', env: process.env });
