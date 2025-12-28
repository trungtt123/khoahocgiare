import { Response } from 'express';
import prisma from '../utils/prisma';
import { hashDeviceInfo, validateDeviceInfo, DeviceInfo } from '../utils/device';
import { AuthRequest } from '../middleware/auth';


export async function checkDevice(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { deviceInfo, fingerprint: clientFingerprint } = req.body;
    const headerFingerprint = req.headers['x-device-fingerprint'] as string;

    if (!validateDeviceInfo(deviceInfo)) {
      return res.status(400).json({ error: 'Invalid device info' });
    }

    // Get user info with maxDevices and role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { maxDevices: true, role: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For admin users, don't check fingerprint or device limit
    if (user.role === 'admin') {
      // Use client fingerprint if provided, otherwise hash device info
      const fingerprint = clientFingerprint || hashDeviceInfo(deviceInfo);
      
      // Check if device exists
      const existingDevice = await prisma.device.findFirst({
        where: {
          userId: userId,
          fingerprint,
        },
      });

      if (existingDevice) {
        // Update last active
        await prisma.device.update({
          where: { id: existingDevice.id },
          data: { lastActive: new Date() },
        });

        return res.json({
          allowed: true,
          device: {
            id: existingDevice.id,
            fingerprint: existingDevice.fingerprint,
            lastActive: existingDevice.lastActive,
            maxDevices: 999,
            isAdmin: true,
          },
        });
      }

      // Create new device for admin
      const newDevice = await prisma.device.create({
        data: {
          userId: userId,
          fingerprint,
          deviceInfo: JSON.stringify(deviceInfo),
          lastActive: new Date(),
        },
      });

      return res.json({
        allowed: true,
        device: {
          id: newDevice.id,
          fingerprint: newDevice.fingerprint,
          lastActive: newDevice.lastActive,
          maxDevices: 999,
          isAdmin: true,
        },
      });
    }

    // For regular users, use fingerprint from header (generated every request)
    const fingerprint = headerFingerprint || clientFingerprint || hashDeviceInfo(deviceInfo);

    // Check if device exists
    const existingDevice = await prisma.device.findFirst({
      where: {
        userId: userId,
        fingerprint,
      },
    });

    if (existingDevice) {
      // Update last active
      await prisma.device.update({
        where: { id: existingDevice.id },
        data: { lastActive: new Date() },
      });

      return res.json({
        allowed: true,
        device: {
          id: existingDevice.id,
          fingerprint: existingDevice.fingerprint,
          lastActive: existingDevice.lastActive,
          maxDevices: user.maxDevices || 3,
          isAdmin: false,
        },
      });
    }

    // Check device count for regular users
    const deviceCount = await prisma.device.count({
      where: {
        userId: userId,
        lastActive: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    if (deviceCount >= (user.maxDevices || 3)) {
      // Device limit reached - reject login
      return res.status(403).json({ 
        error: `Device limit reached (${user.maxDevices}). Cannot login on new device.` 
      });
    }

    // Create new device
    const newDevice = await prisma.device.create({
      data: {
        userId: userId,
        fingerprint,
        deviceInfo: JSON.stringify(deviceInfo),
        lastActive: new Date(),
      },
    });

    res.json({
      allowed: true,
      device: {
        id: newDevice.id,
        fingerprint: newDevice.fingerprint,
        lastActive: newDevice.lastActive,
        maxDevices: user.maxDevices || 3,
        isAdmin: false,
      },
    });
  } catch (error) {
    console.error('Check device error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getDevices(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const devices = await prisma.device.findMany({
      where: { userId: userId },
      orderBy: { lastActive: 'desc' },
      select: {
        id: true,
        fingerprint: true,
        deviceInfo: true,
        lastActive: true,
        createdAt: true,
      },
    });

    res.json({
      devices: devices.map((device) => {
        let parsedDeviceInfo;
        try {
          parsedDeviceInfo = typeof device.deviceInfo === 'string' 
            ? JSON.parse(device.deviceInfo) 
            : device.deviceInfo;
        } catch {
          parsedDeviceInfo = { userAgent: String(device.deviceInfo) };
        }
        return {
          ...device,
          deviceInfo: parsedDeviceInfo,
        };
      }),
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteDevice(req: AuthRequest, res: Response) {
  try {
    const currentUserId = req.user!.userId;
    const deviceId = parseInt(req.params.id, 10);

    console.log('deleteDevice called:', { deviceId, currentUserId });

    // Get device to verify ownership
    const device = await prisma.device.findFirst({
      where: { id: deviceId },
      include: {
        user: {
          select: { role: true }
        }
      }
    });

    console.log('Found device:', device);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Check if requester is admin or device owner
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true }
    });

    console.log('Current user:', currentUser);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Allow deletion if admin or device owner
    const canDelete = currentUser.role === 'admin' || device.userId === currentUserId;

    if (!canDelete) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.device.delete({
      where: { id: deviceId },
    });

    console.log('Device deleted successfully');
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getDevicesByUser(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const targetUserId = parseInt(userId, 10);

    console.log('getDevicesByUser called:', { 
      requestedUserId: userId, 
      targetUserId, 
      currentUser: req.user?.userId,
      userRole: req.user?.role 
    });

    // Check if requester is admin or the user themselves
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { role: true },
    });

    console.log('Found current user:', currentUser);

    if (!currentUser || (currentUser.role !== 'admin' && req.user!.userId !== targetUserId)) {
      console.log('Access denied - not admin and not self');
      return res.status(403).json({ error: 'Access denied' });
    }

    const devices = await prisma.device.findMany({
      where: { userId: targetUserId },
      orderBy: { lastActive: 'desc' },
      select: {
        id: true,
        fingerprint: true,
        deviceInfo: true,
        lastActive: true,
        createdAt: true,
      },
    });

    console.log('Found devices:', devices.length);

    res.json({
      devices: devices.map((device) => {
        let parsedDeviceInfo;
        try {
          parsedDeviceInfo = JSON.parse(device.deviceInfo);
        } catch {
          parsedDeviceInfo = { userAgent: device.deviceInfo };
        }
        return {
          ...device,
          deviceInfo: parsedDeviceInfo,
        };
      }),
    });
  } catch (error) {
    console.error('Get devices by user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
