const fs = require('fs');

const indexPage = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);
const script = fs.readFileSync(`${__dirname}/../client/client.js`);

const getIndex = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
  });
  res.write(indexPage);
  res.end();
};

const getCSS = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/css' });
  res.write(css);
  res.end();
};

const getScript = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/javascript' });
  res.write(script);
  res.end();
};

module.exports.getIndex = getIndex;
module.exports.getCSS = getCSS;
module.exports.getScript = getScript;
