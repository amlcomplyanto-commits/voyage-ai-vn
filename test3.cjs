const https = require('https');
https.get('https://en.wikipedia.org/wiki/Ho_Chi_Minh_City', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/.*?[^"]+\.jpg/g);
    console.log(match ? Array.from(new Set(match)).slice(0, 40) : "no");
  });
});
