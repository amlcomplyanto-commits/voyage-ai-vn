import https from 'node:https';

function fetchPhotos(query) {
  https.get(`https://unsplash.com/s/photos/${query}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const match = data.match(/photo-([a-zA-Z0-9-]+)/g);
      console.log(query, ":", match ? match.slice(0, 5) : "not found");
    });
  });
}

fetchPhotos('da-nang');
fetchPhotos('ha-long-bay');
