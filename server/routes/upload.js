import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { extractText } from '../services/extractor.js';
import { generateStudyMaterial } from '../services/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.pptx'];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_TYPES.includes(file.mimetype) || ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type. Please upload a PDF, DOCX, or PPTX file.`));
    }
  },
});

/**
 * POST /api/upload
 * Accepts a file upload, extracts text, generates AI study material.
 * Returns { notes, quiz, fileName } on success.
 */
router.post('/upload', (req, res) => {
  upload.single('file')(req, res, async (multerErr) => {
    // Handle multer errors
    if (multerErr) {
      if (multerErr.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'File is too large. Maximum size is 10MB.',
        });
      }
      return res.status(400).json({
        error: multerErr.message || 'File upload failed.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file was uploaded. Please select a file to upload.',
      });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    try {
      // Step 1: Extract text from the file
      console.log(`📄 Extracting text from: ${originalName}`);
      const extractedText = await extractText(filePath, originalName);
      console.log(`✅ Extracted ${extractedText.length} characters`);

      // Step 2: Generate study material using AI
      console.log(`🤖 Generating study material...`);
      const { notes, quiz } = await generateStudyMaterial(extractedText);
      console.log(`✅ Generated notes and ${quiz.length} quiz questions`);

      // Return the results
      res.json({
        notes,
        quiz,
        fileName: originalName,
      });
    } catch (err) {
      console.error(`❌ Error processing ${originalName}:`, err.message);
      res.status(500).json({
        error: err.message || 'An unexpected error occurred while processing your file.',
      });
    } finally {
      // Clean up uploaded file
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // Ignore cleanup errors
      }
    }
  });
});

export default router;
