const express = require('express');
const axios = require('axios');
const router = express.Router();

const LOG_URL = process.env.LOG_URL || '';
const LOG_API_TOKEN = process.env.LOG_API_TOKEN || '';

// GET /logs/:droneId?limit=12&page=1
router.get('/:droneId', async (req, res) => {
  const droneId = req.params.droneId;
  const limit = parseInt(req.query.limit) || 12;
  const page = parseInt(req.query.page) || 1;

  // ถ้าไม่มี LOG_URL ให้ส่งตัวอย่างกลับ (เพื่อทดสอบ local)
  if (!LOG_URL) {
    const sample = [];
    for (let i = 0; i < Math.min(limit, 3); i++) {
      sample.push({
        drone_id: Number(droneId),
        drone_name: "Dot Dot",
        created: new Date().toISOString(),
        country: "India",
        celsius: 40 + i
      });
    }
    return res.json(sample);
  }

  try {
    const resp = await axios.get(LOG_URL, {
      headers: LOG_API_TOKEN ? { Authorization: `Bearer ${LOG_API_TOKEN}` } : {},
      params: {
        filter: `drone_id=${droneId}`,
        sort: '-created',
        perPage: limit,
        page
      }
    });

    const records = resp.data?.items ?? resp.data ?? [];
    const logs = (records || []).map(r => ({
      drone_id: r.drone_id,
      drone_name: r.drone_name,
      created: r.created,
      country: r.country,
      celsius: r.celsius
    }));
    res.json(logs);
  } catch (err) {
    console.error('GET /logs error:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to fetch logs from server2' });
  }
});

// POST /logs
router.post('/', async (req, res) => {
  const { drone_id, drone_name, country, celsius } = req.body || {};
  if (!drone_id || !drone_name || !country || (celsius === undefined)) {
    return res.status(400).json({ error: 'Missing required fields: drone_id, drone_name, country, celsius' });
  }

  if (!LOG_URL) {
    // จำลองการสร้าง log เมื่อไม่มี LOG_URL (เพื่อทดสอบ local)
    return res.status(201).json({ message: 'Simulated create', record: { drone_id, drone_name, country, celsius, created: new Date().toISOString() } });
  }

  try {
    const resp = await axios.post(LOG_URL, { drone_id, drone_name, country, celsius }, {
      headers: {
        Authorization: `Bearer ${LOG_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    res.status(201).json(resp.data);
  } catch (err) {
    console.error('POST /logs error:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to create log on server2' });
  }
});

module.exports = router;
