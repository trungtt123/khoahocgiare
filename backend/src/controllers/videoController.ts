import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const ABYSS_API_KEY = process.env.ABYSS_API_KEY || '';

// Extract video ID from Abyss.to URL or embed code
function extractAbyssVideoId(input: string): string | null {
  // Format: https://abyss.to/e/{videoId}
  // Format: https://abyss.to/v/{videoId}
  const match = input.match(/abyss\.to\/(?:e|v)\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export async function uploadVideo(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { videoUrl, title } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ 
        error: 'videoUrl is required. Please provide Abyss.to video link' 
      });
    }

    // Extract video ID from Abyss.to URL if possible, otherwise use URL as fallback
    const extractedId = extractAbyssVideoId(videoUrl) || videoUrl;

    // Create video record with Abyss.to URL
    const video = await prisma.video.create({
      data: {
        userId,
        abyssVideoId: extractedId,
        embedCode: videoUrl, // Store the full URL for iframe
        title: title || `Video ${Date.now()}`,
      },
    });

    res.status(201).json({
      message: 'Video added successfully',
      video,
    });
  } catch (error: any) {
    console.error('Upload video error:', error);
    res.status(500).json({ 
      error: 'Failed to add video',
      details: error.message 
    });
  }
}

export async function getVideos(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    // Get current user to check role
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Admin sees all videos, regular users see all videos too
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        abyssVideoId: true,
        embedCode: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            username: true
          }
        }
      },
    });

    res.json({ videos });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getVideo(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const videoId = parseInt(req.params.id, 10);

    // Get current user to check role
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // All users can view any video
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ video });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateVideo(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const videoId = parseInt(req.params.id, 10);
    const { videoUrl, title } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ 
        error: 'videoUrl is required. Please provide Abyss.to video link' 
      });
    }

    // Get current user to check role
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find video to update
    const existingVideo = await prisma.video.findFirst({
      where: { id: videoId },
    });

    if (!existingVideo) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if user can update this video (admin or video owner)
    const canUpdate = currentUser.role === 'admin' || existingVideo.userId === userId;

    if (!canUpdate) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Extract video ID from Abyss.to URL if possible, otherwise use URL as fallback
    const extractedId = extractAbyssVideoId(videoUrl) || videoUrl;

    // Update video
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        abyssVideoId: extractedId,
        embedCode: videoUrl,
        title: title || existingVideo.title,
      },
    });

    res.json({
      message: 'Video updated successfully',
      video: updatedVideo
    });
  } catch (error: any) {
    console.error('Update video error:', error);
    res.status(500).json({ 
      error: 'Failed to update video',
      details: error.message 
    });
  }
}

export async function deleteVideo(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const videoId = parseInt(req.params.id, 10);

    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        userId,
      },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Note: Abyss.to doesn't provide delete API in free tier
    // You might need to handle this differently
    // For now, we'll just delete from our database
    await prisma.video.delete({
      where: { id: videoId },
    });

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
