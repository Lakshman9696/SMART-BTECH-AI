import { Router } from 'express';
import { handleMentorChat } from './mentorHandler.js';
export const mentorRouter = Router();
mentorRouter.post('/chat', async (req, res, next) => {
  try {
    const result = await handleMentorChat(req.body || {});
    res.status(result.status).json(result.body);
  } catch (error) { next(error); }
});
