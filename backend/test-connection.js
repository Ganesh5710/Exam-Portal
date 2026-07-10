const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const projectRef = 'ndjorlaxqgapnngfaziy';
const passwordEncoded = 'GANESH7981877584';

const regions = [
  'aws-0-ap-south-1',
  'aws-0-ap-southeast-1',
  'aws-0-ap-southeast-2',
  'aws-0-ap-northeast-1',
  'aws-0-ap-northeast-2',
  'aws-0-us-east-1',
  'aws-0-us-east-2',
  'aws-0-us-west-1',
  'aws-0-us-west-2',
  'aws-0-eu-central-1',
  'aws-0-eu-west-1',
  'aws-0-eu-west-2',
  'aws-0-eu-west-3',
  'aws-0-ca-central-1',
  'aws-0-sa-east-1',
];

function updateEnvUrl(url) {
  let content = fs.readFileSync(envPath, 'utf8');
  content = content.replace(/DATABASE_URL=".*"/, `DATABASE_URL="${url}"`);
  fs.writeFileSync(envPath, content, 'utf8');
}

console.log('Starting detailed connection debugging scan...');

for (const region of regions) {
  const candidateUrl = `postgres://postgres.${projectRef}:${passwordEncoded}@${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
  console.log(`\n========================================`);
  console.log(`Testing region: ${region}`);
  updateEnvUrl(candidateUrl);

  try {
    const output = execSync('npx prisma db push', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(`✅ SUCCESS! Output:\n${output}`);
    break;
  } catch (err) {
    const stderr = err.stderr || '';
    const stdout = err.stdout || '';
    const combined = (stdout + '\n' + stderr).trim();
    
    // Log the actual error message
    console.log(`❌ FAILED.`);
    if (combined.includes('tenant/user') && combined.includes('not found')) {
      console.log(`   Detail: Tenant not found in this region (normal skip)`);
    } else {
      console.log(`   Detail Error Message:\n${combined}`);
    }
  }
}
