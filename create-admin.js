const readline = require('readline');
const http = require('http');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter admin email: ', (email) => {
  rl.question('Enter admin Name: ', (name) => {
    rl.question('Enter admin password: ', (password) => {
      const data = JSON.stringify({ name, email, password });

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/create/admin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = http.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            if (res.statusCode === 201) {
              console.log('Director account created successfully');
            } else {
              console.error('Error:', parsedData.error);
            }
          } catch (error) {
            console.error('Error parsing response:', error);
            console.error('Raw response:', responseData);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error creating admin account:', error);
      });

      req.write(data);
      req.end();

      rl.close();
    });
  });
});