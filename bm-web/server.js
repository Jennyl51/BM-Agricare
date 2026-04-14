const http = require('http');
const path = require('path');
const express = require('express');

const app = express();
const parsed = Number.parseInt(process.env.PORT, 10);
const basePort = Number.isFinite(parsed) && parsed > 0 ? parsed : 3080;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

/**
 * Grayscale placeholder images.
 * Swap for via.placeholder.com if you prefer, e.g. `https://via.placeholder.com/${w}x${h}.png`
 */
app.locals.placeholder = (w, h, label = '') => {
  const text = encodeURIComponent(label || `${w}×${h}`);
  return `https://placehold.co/${w}x${h}/d4d4d8/525252?text=${text}`;
};

app.get('/', (req, res) => {
  res.render('home', {
    page: 'home',
    activeNav: 'home',
    showFAB: true,
  });
});

app.get('/products', (req, res) => {
  res.render('products', {
    page: 'products',
    activeNav: 'square',
    showFAB: false,
  });
});

const server = http.createServer(app);
let port = basePort;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const next = port + 1;
    if (next > basePort + 25) {
      console.error('No free port in range', basePort, '–', basePort + 25);
      process.exit(1);
    }
    console.warn(`Port ${port} in use — trying ${next}…`);
    port = next;
    server.listen(port);
    return;
  }
  console.error(err);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`BM AgriCare wireframe → http://localhost:${port}`);
});
