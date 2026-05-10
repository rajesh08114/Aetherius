const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const FRONTEND_DIR = path.join(ROOT, 'frontend');
const BACKEND_DIR = path.join(ROOT, 'backend');

// Helper to safely move directories/files
function safeMove(src, dest) {
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${src} -> ${dest}`);
  }
}

// Helper to safely copy directories/files
function safeCopy(src, dest) {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`Copied ${src} -> ${dest}`);
  }
}

console.log("Starting architectural split...");

// 1. Create directories
if (!fs.existsSync(FRONTEND_DIR)) fs.mkdirSync(FRONTEND_DIR, { recursive: true });
if (!fs.existsSync(BACKEND_DIR)) fs.mkdirSync(BACKEND_DIR, { recursive: true });
if (!fs.existsSync(path.join(FRONTEND_DIR, 'app'))) fs.mkdirSync(path.join(FRONTEND_DIR, 'app'), { recursive: true });
if (!fs.existsSync(path.join(BACKEND_DIR, 'app'))) fs.mkdirSync(path.join(BACKEND_DIR, 'app'), { recursive: true });

// 2. Segregate `app` folder
const appContents = fs.readdirSync(path.join(ROOT, 'app'));
for (const item of appContents) {
  const srcPath = path.join(ROOT, 'app', item);
  if (item === 'api') {
    safeMove(srcPath, path.join(BACKEND_DIR, 'app', 'api'));
  } else {
    safeMove(srcPath, path.join(FRONTEND_DIR, 'app', item));
  }
}
// Remove old app folder if empty
if (fs.existsSync(path.join(ROOT, 'app')) && fs.readdirSync(path.join(ROOT, 'app')).length === 0) {
  fs.rmdirSync(path.join(ROOT, 'app'));
}

// 3. Move UI folders to frontend
['components', 'hooks', 'store', 'public', 'styles'].forEach(folder => {
  safeMove(path.join(ROOT, folder), path.join(FRONTEND_DIR, folder));
});

// 4. Copy shared configs & utils to BOTH
['lib', 'types', 'package.json', 'tsconfig.json', 'tailwind.config.ts', 'postcss.config.js', 'next.config.ts', 'middleware.ts'].forEach(item => {
  if (fs.existsSync(path.join(ROOT, item))) {
    safeCopy(path.join(ROOT, item), path.join(FRONTEND_DIR, item));
    safeMove(path.join(ROOT, item), path.join(BACKEND_DIR, item)); // Move to backend (which removes it from root)
  }
});

// 5. Update backend package.json to run on port 3001
const backendPkgPath = path.join(BACKEND_DIR, 'package.json');
if (fs.existsSync(backendPkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(backendPkgPath, 'utf8'));
  pkg.name = 'traveloop-backend';
  pkg.scripts.dev = 'next dev -p 3001';
  pkg.scripts.start = 'next start -p 3001';
  fs.writeFileSync(backendPkgPath, JSON.stringify(pkg, null, 2));
  console.log("Updated backend package.json");
}

// 6. Update frontend package.json
const frontendPkgPath = path.join(FRONTEND_DIR, 'package.json');
if (fs.existsSync(frontendPkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(frontendPkgPath, 'utf8'));
  pkg.name = 'traveloop-frontend';
  pkg.scripts.dev = 'next dev -p 3000';
  pkg.scripts.start = 'next start -p 3000';
  fs.writeFileSync(frontendPkgPath, JSON.stringify(pkg, null, 2));
  console.log("Updated frontend package.json");
}

// 7. Update frontend next.config.ts to proxy API requests to backend
const frontendNextConfigPath = path.join(FRONTEND_DIR, 'next.config.ts');
if (fs.existsSync(frontendNextConfigPath)) {
  let configContent = fs.readFileSync(frontendNextConfigPath, 'utf8');
  // Inject rewrites method just before the final '};' or 'export default'
  const rewritesBlock = `
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*'
      }
    ];
  },
`;
  configContent = configContent.replace('async headers() {', rewritesBlock + '  async headers() {');
  fs.writeFileSync(frontendNextConfigPath, configContent);
  console.log("Added API proxy rewrites to frontend/next.config.ts");
}

// 8. Create root package.json for workspaces
const rootPkg = {
  name: "traveloop-monorepo",
  private: true,
  workspaces: ["frontend", "backend"],
  scripts: {
    "dev": "npm run dev --workspaces",
    "build": "npm run build --workspaces",
    "install:all": "npm install"
  }
};
fs.writeFileSync(path.join(ROOT, 'package.json'), JSON.stringify(rootPkg, null, 2));
console.log("Created root workspace package.json");

console.log("=========================================");
console.log("Segregation Complete!");
console.log("To run your separated application:");
console.log("1. Run: npm install");
console.log("2. Run: npm run dev");
console.log("=========================================");
