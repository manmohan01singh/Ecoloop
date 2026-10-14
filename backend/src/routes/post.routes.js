import { Router } from 'express';
import {
  getPosts,
  getPost,
  createPost,
  votePost,
  addComment,
  deletePost,
  toggleBookmark,
  getMyBookmarks,
} from '../controllers/post.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = Router();
router.get('/', optionalAuthenticate, getPosts);
router.get('/bookmarks/mine', authenticate, getMyBookmarks);
router.get('/:id', optionalAuthenticate, getPost);
router.post('/', authenticate, createPost);
router.post('/:id/vote', authenticate, votePost);
router.post('/:id/bookmark', authenticate, toggleBookmark);
router.post('/:id/comments', authenticate, addComment);
router.delete('/:id', authenticate, deletePost);
export default router;
