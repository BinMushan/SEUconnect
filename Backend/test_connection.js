const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // Fix Node.js SRV resolution issue on Windows

const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

console.log('Testing connection to MongoDB Atlas with Google/Cloudflare DNS...');
console.log('Target URI:', uri ? uri.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED');

mongoose.connect(uri)
  .then(() => {
    console.log('>>> MongoDB Atlas Connection SUCCESSFUL! <<<');
    console.log('Database Name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch((err) => {
    console.error('>>> MongoDB Atlas Connection FAILED! <<<');
    console.error('Error details:', err);
    process.exit(1);
  });
