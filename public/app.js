document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    button.classList.add('active');

    const tabId = `${button.dataset.tab}-tab`;
    document.getElementById(tabId).classList.add('active');
  });
});

function showLoading() {
  document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

async function pingHost() {
  const host = document.getElementById('ping-host').value;
  if (!host) {
    alert('Please enter a hostname or IP address');
    return;
  }

  showLoading();
  try {
    const response = await fetch(`/api/ping/${host}`);
    const data = await response.json();
    document.getElementById('ping-result').textContent = JSON.stringify(data, null, 2);

    if (data.success && data.latency) {
      document.getElementById('latency').textContent = data.latency;
      document.getElementById('packet-loss').textContent = '0%';
    }
  } catch (error) {
    document.getElementById('ping-result').textContent = `Error: ${error.message}`;
  } finally {
    hideLoading();
  }
}

async function lookupDNS() {
  const type = document.getElementById('dns-type').value;
  const domain = document.getElementById('dns-domain').value;
  if (!domain) {
    alert('Please enter a domain');
    return;
  }

  showLoading();
  try {
    const response = await fetch(`/api/dns/${type}/${domain}`);
    const data = await response.json();
    document.getElementById('dns-result').textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    document.getElementById('dns-result').textContent = `Error: ${error.message}`;
  } finally {
    hideLoading();
  }
}

async function scanPorts() {
  const host = document.getElementById('port-host').value;
  if (!host) {
    alert('Please enter a hostname or IP address');
    return;
  }

  showLoading();
  try {
    const response = await fetch(`/api/port-scan/${host}`);
    const data = await response.json();
    document.getElementById('port-result').textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    document.getElementById('port-result').textContent = `Error: ${error.message}`;
  } finally {
    hideLoading();
  }
}

async function doTraceroute() {
  const host = document.getElementById('traceroute-host').value;
  if (!host) {
    alert('Please enter a hostname or IP address');
    return;
  }

  showLoading();
  try {
    const response = await fetch(`/api/traceroute/${host}`);
    const data = await response.json();
    document.getElementById('traceroute-result').textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    document.getElementById('traceroute-result').textContent = `Error: ${error.message}`;
  } finally {
    hideLoading();
  }
}

async function getPublicIP() {
  showLoading();
  try {
    const response = await fetch('/api/public-ip');
    const data = await response.json();
    document.getElementById('public-ip-result').textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    document.getElementById('public-ip-result').textContent = `Error: ${error.message}`;
  } finally {
    hideLoading();
  }
}

async function openAIAnalysis() {
  showLoading();
  try {
    const networkData = {
      tests: {
        ping: document.getElementById('ping-result').textContent,
        dns: document.getElementById('dns-result').textContent,
        ports: document.getElementById('port-result').textContent
      }
    };

    const response = await fetch('/api/ai-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ networkData })
    });

    const data = await response.json();
    document.getElementById('ai-analysis-result').textContent = JSON.stringify(data.analysis, null, 2);
    openModal('ai-modal');
  } catch (error) {
    document.getElementById('ai-analysis-result').textContent = `Error: ${error.message}`;
    openModal('ai-modal');
  } finally {
    hideLoading();
  }
}

window.onclick = function(event) {
  const modals = ['ai-modal', 'loading'];
  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
};