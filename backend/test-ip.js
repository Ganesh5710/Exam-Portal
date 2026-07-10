const dns = require('dns');
const https = require('https');

const host = 'db.ndjorlaxqgapnngfaziy.supabase.co';

console.log(`Resolving DNS for ${host}...`);

dns.lookup(host, (err, address) => {
  if (err) {
    console.error('Failed to resolve host:', err);
    return;
  }
  console.log(`Host resolves to IP: ${address}`);

  // Query an IP geolocation API to find the location/region
  https.get(`https://ipapi.co/${address}/json/`, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log(`Location: ${json.city}, ${json.region}, ${json.country_name}`);
        console.log(`Org/ISP: ${json.org}`);
      } catch (e) {
        console.log('Failed to parse geolocation data');
      }
    });
  }).on('error', (e) => {
    console.error('Failed to query geolocation API:', e);
  });
});
