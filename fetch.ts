import https from 'node:https';

const options = {
  hostname: 'html.duckduckgo.com',
  path: '/html/?q=site:unsplash.com+da+nang',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/photo-[a-zA-Z0-9-]+/g);
    console.log(Array.from(new Set(match)).slice(0, 5));
  });
});
