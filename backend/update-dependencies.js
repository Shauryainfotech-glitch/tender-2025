const fs = require('fs');
const path = require('path');

// Read current package.json
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Dependencies to add
const newDependencies = {
  'bcryptjs': '^2.4.3',
  'nodemailer': '^6.9.7',
  'handlebars': '^4.7.8',
  'twilio': '^4.19.0',
  '@nestjs/event-emitter': '^2.0.3',
  'class-transformer': '^0.5.1',
  'class-validator': '^0.14.0',
  '@nestjs/jwt': '^10.2.0',
  '@nestjs/passport': '^10.0.3',
  'passport': '^0.7.0',
  'passport-jwt': '^4.0.1',
  'passport-local': '^1.0.0',
  '@nestjs/typeorm': '^10.0.1',
  'typeorm': '^0.3.17',
  'pg': '^8.11.3',
  '@nestjs/config': '^3.1.1',
  'joi': '^17.11.0',
  'uuid': '^9.0.1',
  'dayjs': '^1.11.10',
  'multer': '^1.4.5-lts.1',
  '@types/multer': '^1.4.11'
};

const newDevDependencies = {
  '@types/bcryptjs': '^2.4.6',
  '@types/nodemailer': '^6.4.14',
  '@types/passport-jwt': '^3.0.13',
  '@types/passport-local': '^1.0.38',
  '@types/uuid': '^9.0.7'
};

// Merge dependencies
packageJson.dependencies = {
  ...packageJson.dependencies,
  ...newDependencies
};

packageJson.devDependencies = {
  ...packageJson.devDependencies,
  ...newDevDependencies
};

// Sort dependencies alphabetically
packageJson.dependencies = Object.keys(packageJson.dependencies)
  .sort()
  .reduce((obj, key) => {
    obj[key] = packageJson.dependencies[key];
    return obj;
  }, {});

packageJson.devDependencies = Object.keys(packageJson.devDependencies)
  .sort()
  .reduce((obj, key) => {
    obj[key] = packageJson.devDependencies[key];
    return obj;
  }, {});

// Write updated package.json
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('✅ Dependencies updated successfully!');
console.log('\nNew dependencies added:');
Object.keys(newDependencies).forEach(dep => {
  console.log(`  - ${dep}: ${newDependencies[dep]}`);
});
console.log('\nNew dev dependencies added:');
Object.keys(newDevDependencies).forEach(dep => {
  console.log(`  - ${dep}: ${newDevDependencies[dep]}`);
});
console.log('\n📦 Run "npm install" to install the new dependencies.');