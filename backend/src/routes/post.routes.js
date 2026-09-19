import { Router } from 'express';
import { getPosts, getPost, createPost, votePost, addComment, deletePost } from '../controllers/post.controller.js';
import { authenticate } from '../middleware/auth.js';

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) return authenticate(req, res, next);
  next();
};

const router = Router();
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPost);
router.post('/', authenticate, createPost);
router.post('/:id/vote', authenticate, votePost);
router.post('/:id/comments', authenticate, addComment);
router.delete('/:id', authenticate, deletePost);
export default router;
