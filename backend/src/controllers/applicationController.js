const Application = require('../models/Application');

// APPLY - Students only
exports.applyForOpportunity = async (req, res) => {
  try {
    const { opportunityId, opportunityTitle, resumePath, statementOfInterest } = req.body;
    const studentId = req.user.id;
    const studentName = req.user.name;
    const studentEmail = req.user.email;

    if (!opportunityId || !opportunityTitle || !statementOfInterest) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ studentId, opportunityId });
    if (existingApplication) {
      return res.status(409).json({ error: 'You have already applied for this opportunity' });
    }

    const application = new Application({
      studentId,
      studentName,
      studentEmail,
      opportunityId,
      opportunityTitle,
      resumePath,
      statementOfInterest,
    });

    const saved = await application.save();
    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'You have already applied for this opportunity' });
    }
    console.error('Error applying for opportunity:', error);
    res.status(500).json({ error: 'Failed to apply for opportunity' });
  }
};

// GET Student's Applications
exports.getStudentApplications = async (req, res) => {
  try {
    const studentId = req.user.id;
    const applications = await Application.find({ studentId }).sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// GET All Applications (Admin only)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// UPDATE Application Status (Admin only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPLIED', 'REVIEWED', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await Application.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
};

// DELETE Application (Admin only)
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findByIdAndDelete(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
};

// CHECK if student has applied for an opportunity
exports.checkApplicationStatus = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const studentId = req.user.id;

    const application = await Application.findOne({ studentId, opportunityId });

    if (application) {
      return res.json({ hasApplied: true, status: application.status });
    }

    res.json({ hasApplied: false });
  } catch (error) {
    console.error('Error checking application status:', error);
    res.status(500).json({ error: 'Failed to check application status' });
  }
};
