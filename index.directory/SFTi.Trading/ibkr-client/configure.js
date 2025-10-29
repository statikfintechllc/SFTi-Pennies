// eslint-disable-next-line @typescript-eslint/no-require-imports
const { execSync } = require('child_process');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const readline = require('readline');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');

['dhparam.pem', 'private_encryption.pem', 'private_signature.pem'].forEach(
  (file) => {
    if (!fs.existsSync(`${file}`)) {
      console.error(`File ${file} not found.`);
      process.exit();
    }
  },
);

const config = { realm: 'limited_poa' };

try {
  const output = execSync(`openssl dhparam -in dhparam.pem -text`, {
    encoding: 'utf-8',
  });
  const match = output.match(/(?:prime|P):\s*((?:\s*[0-9a-fA-F:]+\s*)+)/);
  if (match) {
    config.dhPrime = match[1].replace(/[\s:]/g, '');
  } else {
    console.error('No prime (P) value found.');
  }
} catch (e) {
  console.error('Failed to run OpenSSL command:', e);
}

function ask(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    }),
  );
}

(async () => {
  config.consumerKey = await ask('Enter Consumer Key: ');
  config.accessToken = await ask('Enter Access Token: ');
  config.accessTokenSecret = await ask('Enter Access Token Secret: ');
  if (config.consumerKey === 'TESTCONS') config.realm = 'test_realm';
  console.log(config);
  config.signature = fs.readFileSync(`private_signature.pem`, 'utf8');
  config.encryption = fs.readFileSync(`private_encryption.pem`, 'utf8');
  fs.writeFileSync(`oauth1.json`, JSON.stringify(config));
})();
