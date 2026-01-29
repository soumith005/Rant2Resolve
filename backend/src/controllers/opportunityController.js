const Opportunity = require('../models/Opportunity');

// CREATE - Admin only
exports.createOpportunity = async (req, res) => {
  try {
    const { title, company, type, location, mode, stipend, description, skills, eligibility, duration, deadline, applyUrl, isInternal } = req.body;
    const userId = req.user.id;

    if (!title || !company || !type || !location || !mode || !description || !skills || !eligibility || !duration || !deadline) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const opportunity = new Opportunity({
      title,
      company,
      type,
      location,
      mode,
      stipend,
      description,
      skills: Array.isArray(skills) ? skills : [skills],
      eligibility,
      duration,
      deadline: new Date(deadline),
      applyUrl: isInternal ? null : applyUrl,
      isInternal: isInternal !== false,
      createdBy: userId,
    });

    const saved = await opportunity.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
};

// READ ALL - Public access
exports.getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find().sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
};

// READ ONE - Public access
exports.getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json(opportunity);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
};

// UPDATE - Admin only
exports.updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, company, type, location, mode, stipend, description, skills, eligibility, duration, deadline, applyUrl, isInternal } = req.body;

    const updateData = {
      title,
      company,
      type,
      location,
      mode,
      stipend,
      description,
      skills: Array.isArray(skills) ? skills : [skills],
      eligibility,
      duration,
      deadline: new Date(deadline),
      applyUrl: isInternal ? null : applyUrl,
      isInternal: isInternal !== false,
    };

    const opportunity = await Opportunity.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json(opportunity);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
};

// DELETE - Admin only
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await Opportunity.findByIdAndDelete(id);

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json({ success: true, message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ error: 'Failed to delete opportunity' });
  }
};
