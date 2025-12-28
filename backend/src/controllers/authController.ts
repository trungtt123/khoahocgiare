import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

export async function register(req: Request, res: Response) {
  try {
    const { username, password, role = 'user' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: passwordHash,
        role,
        maxDevices: req.body.maxDevices || 3,
      },
      select: {
        id: true,
        username: true,
        role: true,
        maxDevices: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.status(201).json({
      message: 'User created successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        maxDevices: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createUser(req: AuthRequest, res: Response) {
  try {
    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { username, password, role = 'user' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: passwordHash,
        role,
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUserRole(req: AuthRequest, res: Response) {
  try {
    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Note: Admin can change other admin's roles, but not their own
    if (parseInt(userId) === req.user!.userId) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      message: 'User role updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(userId) === req.user!.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id: parseInt(userId) },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUserMaxDevices(req: AuthRequest, res: Response) {
  try {
    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const { maxDevices } = req.body;

    // Validate maxDevices
    if (!maxDevices || maxDevices < 1 || maxDevices > 10) {
      return res.status(400).json({ error: 'Max devices must be between 1 and 10' });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { maxDevices },
      select: {
        id: true,
        username: true,
        role: true,
        maxDevices: true,
        createdAt: true,
      },
    });

    res.json({
      message: 'User max devices updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update user max devices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
