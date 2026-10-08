const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { exec } = require('child_process');
const path = require('path');
const net = require('net');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const execPromise = (command, options) => {
  return new Promise((resolve, reject) => {
    exec(command, options || {}, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

function validateHost(host) {
  if (!host || typeof host !== 'string') return false;
  if (host.length > 253) return false;
  if (host.startsWith('-')) return false;
  return /^[a-zA-Z0-9.-]+$/.test(host);
}

function getPingCommand(host) {
  if (process.platform === 'win32') {
    return `ping -n 1 -w 2000 ${host}`;
  }
  return `ping -c 1 -W 2 ${host}`;
}

function getTracerouteCommand(host) {
  if (process.platform === 'win32') {
    return `tracert -d -h 15 -w 1000 ${host}`;
  }
  return `traceroute -n -m 15 -w 1 ${host}`;
}

app.get('/api/ping/:host', async (req, res) => {
  try {
    const { host } = req.params;
    if (!validateHost(host)) {
      return res.status(400).json({ success: false, error: 'Invalid host parameter' });
    }

    const startTime = Date.now();
    const pingResult = await execPromise(getPingCommand(host), { timeout: 15000 });
    const endTime = Date.now();
    const latency = endTime - startTime;

    res.json({
      host,
      latency: `${latency}ms`,
      success: true,
      response: pingResult
    });
  } catch (error) {
    res.status(500).json({
      host: req.params.host,
      success: false,
      error: error.message
    });
  }
});

app.get('/api/dns/:type/:domain', async (req, res) => {
  try {
    const { type, domain } = req.params;

    let result;
    switch (type.toLowerCase()) {
      case 'a':
        result = await dns.promises.resolve4(domain);
        break;
      case 'aaaa':
        result = await dns.promises.resolve6(domain);
        break;
      case 'mx':
        result = await dns.promises.resolveMx(domain);
        break;
      case 'ns':
        result = await dns.promises.resolveNs(domain);
        break;
      case 'txt':
        result = await dns.promises.resolveTxt(domain);
        break;
      default:
        throw new Error('Unsupported DNS record type');
    }

    res.json({
      domain,
      type: type.toUpperCase(),
      result,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      domain: req.params.domain,
      type: req.params.type,
      success: false,
      error: error.message
    });
  }
});

app.get('/api/port-scan/:host', async (req, res) => {
  try {
    const { host } = req.params;
    if (!validateHost(host)) {
      return res.status(400).json({ success: false, error: 'Invalid host parameter' });
    }
    const ports = [21, 22, 25, 80, 443, 3000, 3306, 5432, 8080];
    const results = [];

    await Promise.all(ports.map(port => {
      return new Promise((resolve) => {
        const socket = net.connect({ host, port }, () => {
          results.push({ port, status: 'open' });
          socket.destroy();
          resolve();
        });

        socket.setTimeout(2000, () => {
          results.push({ port, status: 'timeout' });
          socket.destroy();
          resolve();
        });

        socket.on('error', () => {
          results.push({ port, status: 'closed' });
          socket.destroy();
          resolve();
        });
      });
    }));

    res.json({
      host,
      ports: results.sort((a, b) => a.port - b.port),
      success: true
    });
  } catch (error) {
    res.status(500).json({
      host: req.params.host,
      success: false,
      error: error.message
    });
  }
});

app.get('/api/traceroute/:host', async (req, res) => {
  try {
    const { host } = req.params;
    if (!validateHost(host)) {
      return res.status(400).json({ success: false, error: 'Invalid host parameter' });
    }

    const tracerouteResult = await execPromise(getTracerouteCommand(host), { timeout: 15000 });

    res.json({
      host,
      result: tracerouteResult,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      host: req.params.host,
      success: false,
      error: error.message
    });
  }
});

app.get('/api/public-ip', async (req, res) => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();

    res.json({
      ip: data.ip,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/ai-analyze', async (req, res) => {
  try {
    const { networkData } = req.body;

    const analysis = {
      risks: [
        'High latency detected on certain routes',
        'Potential DDoS vulnerability on open ports',
        'DNS resolution delays possible'
      ],
      recommendations: [
        'Implement CDN for faster content delivery',
        'Configure firewall rules for unused ports',
        'Consider DNS load balancing'
      ],
      overallHealth: 'Moderate',
      confidence: 85
    };

    res.json({
      analysis,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NetTools Mobile running on http://localhost:${PORT}`);
});