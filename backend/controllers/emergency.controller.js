import Employee from '../models/employee.model.js';
import Incident from '../models/incident.model.js';
// import sendSMS from '../utils/sendSMS.js';
import sendNotification from '../utils/sendNotification.js';


// @desc    Get employee data by QR token (public - no auth)
// @route   GET /api/emergency/:qrToken
// @access  Public
export const getEmployeeByQRToken = async (req, res) => {
  try {
    const { qrToken } = req.params;

    const employee = await Employee.findOne({ 
      qrToken, 
      status: 'active' 
    })
      .select('-password -qrToken') // Don't expose sensitive data
      .populate('organizationId', 'name');

    if (!employee) {
      return res.status(404).json({ 
        message: 'Employee not found or QR code is invalid' 
      });
    }

    // Return only essential emergency information
    res.json({
      employee: {
        name: employee.name,
        employeeId: employee.employeeId,
        department: employee.department,
        role: employee.role,
        profilePhoto: employee.profilePhoto,
        organization: employee.organizationId.name,
        medicalInfo: employee.medicalInfo,
        emergencyContacts: employee.emergencyContacts
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Trigger SOS alert
// @route   POST /api/emergency/:qrToken/sos
// @access  Public
export const triggerSOS = async (req, res) => {
  try {
    const { qrToken } = req.params;
    const { location, scannedBy } = req.body;

    const employee = await Employee.findOne({ 
      qrToken, 
      status: 'active' 
    }).populate('organizationId', 'name email');

    if (!employee) {
      return res.status(404).json({ 
        message: 'Employee not found or QR code is invalid' 
      });
    }

    // Create incident record
    const incident = await Incident.create({
      employeeId: employee._id,
      organizationId: employee.organizationId._id,
      location: location || {},
      scannedBy: scannedBy || {},
      sosStatus: 'sent'
    });

    // Send SMS to emergency contacts
    const smsResults = [];
    
    if (employee.emergencyContacts && employee.emergencyContacts.length > 0) {
      for (const contact of employee.emergencyContacts) {
        if (contact.phone) {
          // Build location info
          let locationInfo = '';
          if (location?.latitude && location?.longitude) {
            const googleMapsLink = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
            locationInfo = `\n📍 Location: ${googleMapsLink}`;
            
            // Add address if available
            if (location.address) {
              locationInfo += `\n🏢 Address: ${location.address}`;
            }
          } else if (location?.address) {
            locationInfo = `\n🏢 Address: ${location.address}`;
          } else {
            locationInfo = '\n📍 Location: Not available';
          }

          // Build scanned by info
          let scannedByInfo = '';
          if (scannedBy?.name) {
            scannedByInfo = `\n👤 Alert triggered by: ${scannedBy.name}`;
            if (scannedBy.phone) {
              scannedByInfo += ` (${scannedBy.phone})`;
            }
          }

          // Medical info
          const bloodGroup = employee.medicalInfo?.critical?.bloodGroup || 'Unknown';
          const allergies = employee.medicalInfo?.critical?.allergies?.length > 0 
            ? `\n⚠️ Allergies: ${employee.medicalInfo.critical.allergies.join(', ')}`
            : '';
          const conditions = employee.medicalInfo?.critical?.chronicConditions?.length > 0
            ? `\n⚠️ Conditions: ${employee.medicalInfo.critical.chronicConditions.join(', ')}`
            : '';

          // Create emergency message
          const message = `🚨 EMERGENCY ALERT 🚨

${employee.name} (ID: ${employee.employeeId})
${employee.organizationId.name}

NEEDS IMMEDIATE HELP!

🩸 Blood Group: ${bloodGroup}${allergies}${conditions}${locationInfo}${scannedByInfo}

⏰ Time: ${new Date().toLocaleString()}

Please respond immediately!`;

          const result = await sendNotification(contact.phone, message);
          smsResults.push({
            contact: contact.name,
            phone: contact.phone,
            ...result
          });
        }
      }
    }

    // Update incident with SMS results
    incident.sosStatus = smsResults.some(r => r.success) ? 'sent' : 'failed';
    await incident.save();

    // Log for debugging
    console.log('SOS TRIGGERED FOR:', employee.name);
    console.log('Location:', location);
    console.log('Emergency Contacts:', employee.emergencyContacts);
    console.log('SMS Results:', smsResults);
    console.log('Incident ID:', incident._id);

    res.json({
      message: 'SOS alert sent successfully',
      incident: {
        _id: incident._id,
        scannedAt: incident.scannedAt,
        sosStatus: incident.sosStatus
      },
      alertsSent: smsResults.filter(r => r.success).length,
      totalContacts: employee.emergencyContacts.length,
      smsResults: smsResults
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Failed to send SOS alert', 
      error: error.message 
    });
  }
};

// @desc    Get incident history for employee
// @route   GET /api/emergency/incidents/:employeeId
// @access  Private (Organization only)
export const getIncidentHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Verify organization owns this employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.organizationId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const incidents = await Incident.find({ employeeId })
      .sort({ scannedAt: -1 })
      .limit(50); // Last 50 incidents

    res.json({
      count: incidents.length,
      incidents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all incidents for organization
// @route   GET /api/emergency/incidents
// @access  Private (Organization only)
export const getAllIncidents = async (req, res) => {
  try {
    const organizationId = req.user.id;

    const incidents = await Incident.find({ organizationId })
      .populate('employeeId', 'name employeeId department')
      .sort({ scannedAt: -1 })
      .limit(100); // Last 100 incidents

    res.json({
      count: incidents.length,
      incidents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};