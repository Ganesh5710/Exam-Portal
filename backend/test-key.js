const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const key = process.env.GEMINI_API_KEY;
console.log('Testing Key:', key ? key.substring(0, 10) + '...' : 'None');

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  .then(res => res.json())
  .then(json => {
    console.log('\n--- Supported Models ---');
    if (json.models) {
      json.models.forEach(m => console.log(m.name));
    } else {
      console.log(JSON.stringify(json, null, 2));
    }
  })
  .catch(err => console.error('Error:', err));
