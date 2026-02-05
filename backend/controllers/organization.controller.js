import bcrypt from 'bcryptjs';
import Organization from '../models/organization.model.js';
import Employee from '../models/employee.model.js';
import Incident from '../models/incident.model.js';

// @desc    Get organization profile
// @route   GET /api/organization/profile
// @access  Private (Organization only)
export const getProfile = async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.id).select('-password');
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Get counts
    const employeeCount = await Employee.countDocuments({ 
      organizationId: req.user.id,
      status: 'active'
    });

    const incidentCount = await Incident.countDocuments({ 
      organizationId: req.user.id
    });

    res.json({
      ...organization.toObject(),
      employeeCount,
      incidentCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update organization profile
// @route   PUT /api/organization/profile
// @access  Private (Organization only)
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const organization = await Organization.findById(req.user.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if email is already taken by another organization
    if (email !== organization.email) {
      const emailExists = await Organization.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    organization.name = name || organization.name;
    organization.email = email || organization.email;

    await organization.save();

    res.json({
      _id: organization._id,
      name: organization.name,
      email: organization.email,
      plan: organization.plan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/organization/change-password
// @access  Private (Organization only)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const organization = await Organization.findById(req.user.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, organization.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    organization.password = await bcrypt.hash(newPassword, salt);

    await organization.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};