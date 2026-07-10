const dns = require('dns');

const projectRef = 'ndjorlaxqgapnngfaziy';

const regions = [
  'aws-0-ap-south-1',       // Mumbai
  'aws-0-ap-southeast-1',   // Singapore
  'aws-0-ap-southeast-2',   // Sydney
  'aws-0-ap-northeast-1',   // Tokyo
  'aws-0-ap-northeast-2',   // Seoul
  'aws-0-us-east-1',        // N. Virginia
  'aws-0-us-east-2',        // Ohio
  'aws-0-us-west-1',        // N. California
  'aws-0-us-west-2',        // Oregon
  'aws-0-eu-central-1',     // Frankfurt
  'aws-0-eu-west-1',        // Ireland
  'aws-0-eu-west-2',        // London
  'aws-0-eu-west-3',        // Paris
  'aws-0-ca-central-1',     // Canada
  'aws-0-sa-east-1',        // São Paulo
];

console.log('Resolving DNS for candidate poolers...');

regions.forEach(region => {
  const host = `${region}.pooler.supabase.com`;
  dns.lookup(host, (err, address, family) => {
    if (err) {
      // console.log(`❌ ${host} -> Cannot resolve`);
    } else {
      console.log(`✅ ${host} -> Resolves to ${address}`);
    }
  });
});
