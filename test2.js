const https = require('https');
https.get('https://en.wikipedia.org/wiki/Da_Nang', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // try to find a nice image of da nang
    const match = data.match(/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/.*?\.jpg/gi);
    console.log(match ? Array.from(new Set(match)).slice(0, 5) : "no");
  });
});
