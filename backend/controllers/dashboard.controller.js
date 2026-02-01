import Employee from '../models/employee.model.js';
import Incident from '../models/incident.model.js';
import mongoose from 'mongoose';

// @desc    Get organization dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Organization only)
export const getDashboardStats = async (req, res) => {
  try {
    const organizationId = req.user.id;

    // Total employees
    const totalEmployees = await Employee.countDocuments({ 
      organizationId, 
      status: 'active' 
    });

    // Employees with updated medical info (within last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const employeesWithUpdatedInfo = await Employee.countDocuments({
      organizationId,
      status: 'active',
      lastUpdated: { $gte: sixMonthsAgo }
    });

    // Total incidents (all time)
    const totalIncidents = await Incident.countDocuments({ organizationId });

    // Recent incidents (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentIncidents = await Incident.countDocuments({
      organizationId,
      scannedAt: { $gte: thirtyDaysAgo }
    });

    // Employees without medical info
    const employeesWithoutMedicalInfo = await Employee.countDocuments({
      organizationId,
      status: 'active',
      'medicalInfo.critical.bloodGroup': ''
    });

    // Department-wise breakdown - FIXED VERSION
    const departmentBreakdown = await Employee.aggregate([
      { 
        $match: { 
          organizationId: new mongoose.Types.ObjectId(organizationId),
          status: 'active' 
        } 
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalEmployees,
      activeEmployees: totalEmployees,
      employeesWithUpdatedInfo,
      employeesWithoutMedicalInfo,
      complianceRate: totalEmployees > 0 
        ? Math.round((employeesWithUpdatedInfo / totalEmployees) * 100) 
        : 0,
      totalIncidents,
      recentIncidents,
      departmentBreakdown
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get recent incidents with employee details
// @route   GET /api/dashboard/recent-incidents
// @access  Private (Organization only)
export const getRecentIncidents = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const incidents = await Incident.find({ organizationId })
      .populate('employeeId', 'name employeeId department profilePhoto')
      .sort({ scannedAt: -1 })
      .limit(limit);

    res.json({
      count: incidents.length,
      incidents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};