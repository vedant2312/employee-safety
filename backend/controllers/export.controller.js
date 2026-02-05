import { Parser } from 'json2csv';
import Employee from '../models/employee.model.js';
import Incident from '../models/incident.model.js';

// @desc    Export employees to CSV
// @route   GET /api/export/employees
// @access  Private (Organization only)
export const exportEmployees = async (req, res) => {
  try {
    const organizationId = req.user.id;

    const employees = await Employee.find({ organizationId })
      .select('-password -qrToken')
      .lean();

    // Format data for CSV
    const csvData = employees.map(emp => ({
      'Employee ID': emp.employeeId,
      'Name': emp.name,
      'Email': emp.email,
      'Department': emp.department || 'N/A',
      'Role': emp.role || 'N/A',
      'Status': emp.status,
      'Blood Group': emp.medicalInfo?.critical?.bloodGroup || 'N/A',
      'Allergies': emp.medicalInfo?.critical?.allergies?.join(', ') || 'None',
      'Chronic Conditions': emp.medicalInfo?.critical?.chronicConditions?.join(', ') || 'None',
      'Emergency Contact 1': emp.emergencyContacts?.[0]?.name || 'N/A',
      'Emergency Phone 1': emp.emergencyContacts?.[0]?.phone || 'N/A',
      'Created At': new Date(emp.createdAt).toLocaleDateString()
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment('employees.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Export incidents to CSV
// @route   GET /api/export/incidents
// @access  Private (Organization only)
export const exportIncidents = async (req, res) => {
  try {
    const organizationId = req.user.id;

    const incidents = await Incident.find({ organizationId })
      .populate('employeeId', 'name employeeId department')
      .lean();

    const csvData = incidents.map(inc => ({
      'Incident ID': inc._id,
      'Employee Name': inc.employeeId?.name || 'Unknown',
      'Employee ID': inc.employeeId?.employeeId || 'Unknown',
      'Department': inc.employeeId?.department || 'N/A',
      'Date & Time': new Date(inc.scannedAt).toLocaleString(),
      'Location': inc.location?.address || `${inc.location?.latitude || 'N/A'}, ${inc.location?.longitude || 'N/A'}`,
      'Scanned By': inc.scannedBy?.name || 'Unknown',
      'SOS Status': inc.sosStatus,
      'Notes': inc.notes || 'None'
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment('incidents.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};