#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the version type from command line args
const versionType = process.argv[2] || 'patch';
const validTypes = ['patch', 'minor', 'major', 'prerelease'];

if (!validTypes.includes(versionType)) {
  console.error(`❌ Invalid version type: ${versionType}`);
  console.error(`Valid types: ${validTypes.join(', ')}`);
  process.exit(1);
}

try {
  console.log(`🔄 Bumping ${versionType} version...`);
  
  // Run npm version
  const result = execSync(`npm version ${versionType}`, { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  const newVersion = result.trim();
  console.log(`✅ Version bumped to: ${newVersion}`);
  
  // Read package.json to get the new version
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const version = packageJson.version;
  
  console.log(`\n📝 Next steps:`);
  console.log(`1. Review changes: git diff`);
  console.log(`2. Commit changes: git add . && git commit -m "chore: bump version to ${version}"`);
  console.log(`3. Push to GitHub: git push && git push --tags`);
  console.log(`4. Publish to npm: npm publish`);
  
  console.log(`\n🚀 The GitHub Action will automatically create a release when you push!`);
  
} catch (error) {
  console.error(`❌ Error bumping version:`, error.message);
  process.exit(1);
}
