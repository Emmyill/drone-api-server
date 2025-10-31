// routes/configs.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const CONFIG_URL = process.env.DRONE_CONFIG_URL;

router.get('/:droneId', async (req, res) => {
  const droneId = Number(req.params.droneId);

  try {
    const resp = await axios.get(CONFIG_URL);
    const rows = resp.data.data || [];
    const found = rows.find(r => r.drone_id === droneId);

    if (!found) {
      return res.status(404).json({ error: 'Drone not found' });
    }

    const config = {
      drone_id: found.drone_id,
      drone_name: found.drone_name,
      light: found.light,
      country: found.country,
      weight: found.weight
    };
    res.json(config);
  } catch (err) {
    console.error('configs error:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to fetch config from server1' });
  }
});

module.exports = router;
