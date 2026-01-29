const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Issue = require('../models/Issue');

router.use(protect);

// GET dashboard stats
router.get('/stats', async (req, res) => {
  try {
    let query = {};
    const isAdmin = req.user.role === 'ADMIN';

    // Students see only their issues
    if (!isAdmin) {
      query.studentId = req.user.id;
    }

    // Fetch all issues based on role
    const issues = await Issue.find(query);

    // Calculate statistics
    const totalIssues = issues.length;
    const pendingIssues = issues.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length;
    const resolvedIssues = issues.filter(i => i.status === 'RESOLVED').length;

    // Calculate average response time (in hours)
    let avgResponseTime = '-';
    if (issues.length > 0) {
      const responseTimes = issues
        .filter(i => i.updatedAt)
        .map(i => {
          const createdTime = new Date(i.createdAt).getTime();
          const updatedTime = new Date(i.updatedAt).getTime();
          return (updatedTime - createdTime) / (1000 * 60 * 60); // Convert to hours
        });

      if (responseTimes.length > 0) {
        const avgHours = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        avgResponseTime = avgHours < 1 ? '<1h' : Math.round(avgHours) + 'h';
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalIssues,
        pendingIssues,
        resolvedIssues,
        avgResponseTime
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
