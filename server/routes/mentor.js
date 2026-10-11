import { Router } from 'express';
import { mentorService } from '../services/mentorService.js';
export const mentorRouter = Router();
mentorRouter.post('/chat', async (req, res, next) => {
  try {
    const { text, profile = {}, history = [], progressTasks = [] } = req.body || {};
    if (typeof text !== 'string' || !text.trim() || text.length > 3000) return res.status(400).json({ error: 'Enter a message under 3,000 characters.' });
    if (!Array.isArray(history) || history.length > 30) return res.status(400).json({ error: 'This chat history is too long. Start a new conversation.' });
    if (!Array.isArray(progressTasks) || progressTasks.length > 80) return res.status(400).json({ error: 'Roadmap context is invalid or too large.' });
    res.json(await mentorService({ text: text.trim(), profile, history, progressTasks }));
  } catch (error) { next(error); }
});
