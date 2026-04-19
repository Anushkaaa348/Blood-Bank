const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');

// GET /api/about/team
router.get('/team', async (req, res) => {
  try {
    const members = await TeamMember.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching team members' });
  }
});

// Static stats & partners (keep if not in DB)
router.get('/stats', (req, res) => {
  res.json([
    { value: "10,000+", label: "Lives Saved" },
    { value: "5,000+", label: "Active Donors" },
    { value: "200+", label: "Partner Hospitals" },
    { value: "24/7", label: "Emergency Support" }
  ]);
});

router.get('/partners', (req, res) => {
  res.json([
    { name: "Red Cross", logo: "https://via.placeholder.com/150x60?text=Red+Cross" },
    { name: "Children's Hospital", logo: "https://via.placeholder.com/150x60?text=Children's+Hospital" },
    { name: "National Blood Service", logo: "https://via.placeholder.com/150x60?text=National+Blood+Service" },
    { name: "City Medical Center", logo: "https://via.placeholder.com/150x60?text=City+Medical+Center" }
  ]);
});

module.exports = router;
