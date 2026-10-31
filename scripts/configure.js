// Usage: node scripts/configure.js            (local/Codespaces setup)
//        node scripts/configure.js --pages <repo-name>   (GitHub Pages build)
const fs = require('fs');
const pagesIdx = process.argv.indexOf('--pages');
const repo = pagesIdx > -1 ? process.argv[pagesIdx + 1] : null;

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.main = 'expo-router/entry';
pkg.scripts = { ...(pkg.scripts || {}), test: 'jest' };
pkg.jest = pkg.jest || { preset: 'jest-expo' };
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const e = app.expo;
e.name = 'Khaya Bank';
e.slug = 'khaya-bank';
e.scheme = 'khaya';
e.web = { ...(e.web || {}), bundler: 'metro', output: 'static' };
e.plugins = Array.from(new Set([...(e.plugins || []), 'expo-router']));
if (!e.plugins.some(p => [].concat(p)[0] === 'expo-local-authentication')) {
  e.plugins.push(['expo-local-authentication', { faceIDPermission: 'Allow Khaya Bank to use Face ID to unlock the app.' }]);
}
if (repo) e.experiments = { ...(e.experiments || {}), baseUrl: '/' + repo };
fs.writeFileSync('app.json', JSON.stringify(app, null, 2));
console.log('Configured' + (repo ? ' for GitHub Pages at /' + repo : ''));
