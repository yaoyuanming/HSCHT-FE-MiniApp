const fs = require('fs');
const path = require('path');

const app = process.argv[2];
if (!app) {
  console.error('Missing app name. Usage: node scripts/switch-app.cjs <app1|app2>');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');

function copyIfExists(from, to) {
  if (!fs.existsSync(from)) {
    console.error(`Config not found: ${path.relative(root, from)}`);
    process.exit(1);
  }
  fs.copyFileSync(from, to);
  console.log(`Switched: ${path.relative(root, to)} <= ${path.relative(root, from)}`);
}

copyIfExists(path.join(srcDir, `pages.${app}.json`), path.join(srcDir, 'pages.json'));

const manifestVariant = path.join(srcDir, `manifest.${app}.json`);
if (fs.existsSync(manifestVariant)) {
  copyIfExists(manifestVariant, path.join(srcDir, 'manifest.json'));
}

const envVariant = path.join(root, `.env.${app}`);
if (fs.existsSync(envVariant)) {
  copyIfExists(envVariant, path.join(root, '.env'));
}
