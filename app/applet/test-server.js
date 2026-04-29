import http from 'http';

http.get('http://localhost:3000', (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response Length:', data.length));
}).on('error', (err) => {
  console.log('Error:', err.message);
});
