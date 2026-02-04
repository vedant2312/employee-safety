import bcrypt from 'bcryptjs';
import Organization from '../models/organization.model.js';
import Employee from '../models/employee.model.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register organization
// @route   POST /api/auth/organization/register
// @access  Public
export const registerOrganization = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Check if organization exists
    const orgExists = await Organization.findOne({ email });
    if (orgExists) {
      return res.status(400).json({ message: 'Organization already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create organization
    const organization = await Organization.create({
      name,
      email,
      password: hashedPassword
    });

    if (organization) {
      res.status(201).json({
        _id: organization._id,
        name: organization.name,
        email: organization.email,
        plan: organization.plan,
        token: generateToken(organization._id, 'organization')
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login organization
// @route   POST /api/auth/organization/login
// @access  Public
export const loginOrganization = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Find organization
    const organization = await Organization.findOne({ email });
    if (!organization) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, organization.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: organization._id,
      name: organization.name,
      email: organization.email,
      plan: organization.plan,
      token: generateToken(organization._id, 'organization')
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login employee
// @route   POST /api/auth/employee/login
// @access  Public
export const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Find employee
    const employee = await Employee.findOne({ email, status: 'active' });
    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: employee._id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      role: employee.role,
      organizationId: employee.organizationId,
      token: generateToken(employee._id, 'employee')
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};