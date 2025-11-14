const express = require('express');
const ChatMessage = require('../models/chat');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Get chat history for a listing between two users
router.get('/history/:listingId/:otherUserId', auth, async (req, res) => {
  try {
    const { listingId, otherUserId } = req.params;
    const userId = req.user.id;

    const messages = await ChatMessage.find({
      listingId,
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
    .populate('sender', 'firstName lastName')
    .populate('receiver', 'firstName lastName')
    .sort({ sentAt: -1 })
    .limit(50);

    res.json({
      success: true,
      data: messages.reverse() // Reverse to get chronological order
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
});

// Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get unique conversation partners with latest message
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        }
      },
      {
        $sort: { sentAt: -1 }
      },
      {
        $group: {
          _id: {
            listingId: '$listingId',
            otherUser: {
              $cond: {
                if: { $eq: ['$sender', userId] },
                then: '$receiver',
                else: '$sender'
              }
            }
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.otherUser',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $lookup: {
          from: 'marketlistings',
          localField: '_id.listingId',
          foreignField: '_id',
          as: 'listing'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $unwind: '$listing'
      },
      {
        $project: {
          _id: 0,
          listingId: '$_id.listingId',
          otherUser: {
            _id: '$otherUser._id',
            firstName: '$otherUser.firstName',
            lastName: '$otherUser.lastName',
            userType: '$otherUser.userType'
          },
          listing: {
            _id: '$listing._id',
            'product.name': '$listing.product.name',
            'location.county': '$listing.location.county'
          },
          lastMessage: {
            message: '$lastMessage.message',
            sentAt: '$lastMessage.sentAt',
            sender: '$lastMessage.sender'
          },
          unreadCount: {
            $size: {
              $filter: {
                input: { $ifNull: [ [], [] ] },
                cond: { $and: [
                  { $eq: ['$$this.receiver', userId] },
                  { $eq: ['$$this.read', false] },
                  { $eq: ['$$this.sender', '$otherUser._id'] }
                ]}
              }
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.sentAt': -1 }
      }
    ]);

    res.json({
      success: true,
      data: conversations
    });

  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// Mark messages as read
router.patch('/mark-read/:listingId/:otherUserId', auth, async (req, res) => {
  try {
    const { listingId, otherUserId } = req.params;
    const userId = req.user.id;

    await ChatMessage.updateMany(
      {
        listingId,
        sender: otherUserId,
        receiver: userId,
        read: false
      },
      {
        read: true
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
});

module.exports = router;