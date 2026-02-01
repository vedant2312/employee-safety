import Organization from '../models/organization.model.js';
import Employee from '../models/employee.model.js';
import Incident from '../models/incident.model.js';
import bcrypt from 'bcryptjs';

// @desc    Get organization profile
// @route   GET /api/organization/profile
// @access  Private (Organization only)
export const getOrganizationProfile = async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.id).select('-password');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Fetch live counts so the settings page can display them
    const totalEmployees = await Employee.countDocuments({
      organizationId: organization._id,
      status: 'active'
    });

    const totalIncidents = await Incident.countDocuments({
      organizationId: organization._id
    });

    res.json({
      organization,
      stats: { totalEmployees, totalIncidents }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update organization settings
// @route   PUT /api/organization/settings
// @access  Private (Organization only)
export const updateOrganizationSettings = async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const { name, settings } = req.body;

    if (name) organization.name = name;

    if (settings) {
      // FIX: Use simple property assignment or Object.assign to avoid 
      // spreading Mongoose Document internals
      organization.settings.sosCascade = 
        settings.sosCascade !== undefined ? settings.sosCascade : organization.settings.sosCascade;
        
      organization.settings.requirePhotoUpdate = 
        settings.requirePhotoUpdate !== undefined ? settings.requirePhotoUpdate : organization.settings.requirePhotoUpdate;
    }

    await organization.save();

    const updated = organization.toObject();
    delete updated.password;

    res.json({
      message: 'Settings updated successfully',
      organization: updated
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update organization password
// @route   PUT /api/organization/password
// @access  Private (Organization only)
export const updateOrganizationPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const organization = await Organization.findById(req.user.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, organization.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    organization.password = await bcrypt.hash(newPassword, salt);

    await organization.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete organization and all related data
// @route   DELETE /api/organization/account
// @access  Private (Organization only)
export const deleteOrganizationAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Please provide your password to confirm' });
    }

    const organization = await Organization.findById(req.user.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Verify password before deleting
    const isMatch = await bcrypt.compare(password, organization.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    // Delete all related data
    await Incident.deleteMany({ organizationId: organization._id });
    await Employee.deleteMany({ organizationId: organization._id });
    await Organization.findByIdAndDelete(organization._id);

    res.json({ message: 'Organization account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};