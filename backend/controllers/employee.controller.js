import bcrypt from 'bcryptjs';
import Employee from '../models/employee.model.js';
import Organization from '../models/organization.model.js';
import generateQRToken from '../utils/generateQRToken.js';
import QRCode from 'qrcode';

// @desc    Create employee (by organization)
// @route   POST /api/employees
// @access  Private (Organization only)
export const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      password,
      department,
      role,
      emergencyContacts
    } = req.body;

    // Validation
    if (!employeeId || !name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Get organization ID from authenticated user
    const organizationId = req.user.id;

    // Check if organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if employee with same email exists
    const employeeExists = await Employee.findOne({ email });
    if (employeeExists) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    // Check if employeeId is unique within organization
    const empIdExists = await Employee.findOne({ organizationId, employeeId });
    if (empIdExists) {
      return res.status(400).json({ message: 'Employee ID already exists in your organization' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate QR token
    const qrToken = generateQRToken(employeeId, organizationId);

    // Create employee
    const employee = await Employee.create({
      organizationId,
      employeeId,
      name,
      email,
      password: hashedPassword,
      department,
      role,
      emergencyContacts: emergencyContacts || [],
      qrToken,
      qrGeneratedAt: new Date()
    });

    // Remove password from response
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    res.status(201).json({
      message: 'Employee created successfully',
      employee: employeeResponse
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all employees (by organization)
// @route   GET /api/employees
// @access  Private (Organization only)
export const getEmployees = async (req, res) => {
  try {
    const organizationId = req.user.id;

    const employees = await Employee.find({ organizationId })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      count: employees.length,
      employees
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private (Organization only)
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.organizationId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Organization or Employee themselves)
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check authorization
    const isOrganization = req.user.role === 'organization' &&
                          employee.organizationId.toString() === req.user.id;
    const isOwnProfile = req.user.role === 'employee' &&
                        employee._id.toString() === req.user.id;

    if (!isOrganization && !isOwnProfile) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      name,
      department,
      role,
      status,
      medicalInfo,
      emergencyContacts,
      profilePhoto
    } = req.body;

    if (name) employee.name = name;
    if (department) employee.department = department;
    if (role) employee.role = role;
    if (profilePhoto) employee.profilePhoto = profilePhoto;

    // Only organization can change status
    if (status && isOrganization) {
      employee.status = status;
    }

    // ─── medicalInfo update ──────────────────────────────────────
    // Each sub-key (critical / important / context) falls back first
    // to what the request sent, then to what is already in the DB,
    // and finally to an empty object {}.  The empty-object fallback
    // is critical: Mongoose cannot cast `undefined` to an Object
    // subdocument and will throw a ValidationError if it receives one.
    // ─────────────────────────────────────────────────────────────
    if (medicalInfo) {
      employee.medicalInfo = {
        critical:  medicalInfo.critical  || employee.medicalInfo?.critical  || {},
        important: medicalInfo.important || employee.medicalInfo?.important || {},
        context:   medicalInfo.context   || employee.medicalInfo?.context   || {}
      };
    }

    if (emergencyContacts) {
      employee.emergencyContacts = emergencyContacts;
    }

    employee.lastUpdated = new Date();

    await employee.save();

    const updatedEmployee = employee.toObject();
    delete updatedEmployee.password;

    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete employee (soft delete)
// @route   DELETE /api/employees/:id
// @access  Private (Organization only)
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.organizationId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    employee.status = 'inactive';
    employee.lastUpdated = new Date();
    await employee.save();

    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get employee profile (for logged-in employee)
// @route   GET /api/employees/profile/me
// @access  Private (Employee only)
export const getMyProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id)
      .select('-password')
      .populate('organizationId', 'name email');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update own profile (for logged-in employee)
// @route   PUT /api/employees/profile/me
// @access  Private (Employee only)
export const updateMyProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const {
      profilePhoto,
      medicalInfo,
      emergencyContacts
    } = req.body;

    if (profilePhoto) employee.profilePhoto = profilePhoto;

    // Same safe fallback pattern as updateEmployee above
    if (medicalInfo) {
      employee.medicalInfo = {
        critical:  medicalInfo.critical  || employee.medicalInfo?.critical  || {},
        important: medicalInfo.important || employee.medicalInfo?.important || {},
        context:   medicalInfo.context   || employee.medicalInfo?.context   || {}
      };
    }

    if (emergencyContacts) {
      employee.emergencyContacts = emergencyContacts;
    }

    employee.lastUpdated = new Date();
    await employee.save();

    const updatedEmployee = employee.toObject();
    delete updatedEmployee.password;

    res.json({
      message: 'Profile updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate QR code for employee
// @route   GET /api/employees/:id/qr
// @access  Private (Organization only)
export const generateQRCode = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.organizationId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/emergency/${employee.qrToken}`;

    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      qrToken: employee.qrToken,
      qrUrl,
      qrCodeImage: qrCodeDataUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Regenerate QR token for employee
// @route   POST /api/employees/:id/regenerate-qr
// @access  Private (Organization only)
export const regenerateQRToken = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.organizationId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    employee.qrToken = generateQRToken(employee.employeeId, employee.organizationId);
    employee.qrGeneratedAt = new Date();
    await employee.save();

    res.json({
      message: 'QR token regenerated successfully',
      qrToken: employee.qrToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};