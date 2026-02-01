import bcrypt from 'bcryptjs';
import Organization from '../models/organization.model.js';
import Employee from '../models/employee.model.js';
import generateToken from '../utils/generateToken.js';

export const registerOrganization = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const orgExists = await Organization.findOne({ email });
        if (orgExists) {
            return res.status(400).json({ message: 'Organization already exists' });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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
        res.status(500).json({ message: 'Server error' });
    }
};


export const loginOrganization = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const organization = await Organization.findOne({ email });
        if(!organization) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, organization.password);
        if(!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
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
        res.status(500).json({ message: 'Server error' });
    }
};

export const loginEmployee = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // FIX: Changed status: true to status: 'active' to match schema Enum
        const employee = await Employee.findOne({ email, status: 'active' });
        
        if(!employee) {
            // Returns 401 if user not found OR if status is 'inactive'/'suspended'
            return res.status(401).json({ message: 'Invalid credentials or inactive account' });
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if(!isMatch) {
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
        res.status(500).json({ message: 'Server error' });
    }
};