const { Router } = require('express');
const router = Router();
const multer = require('multer');
const Upload = require('../models/Upload');
const { auth, adminOnly } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files (png, jpg, jpeg, gif, webp, svg, ico) are allowed'));
  },
});

router.post('/', auth, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const doc = await Upload.create({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      data: req.file.buffer,
    });
    const url = `/api/uploads/${doc._id}`;
    res.json({ url, id: doc._id });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await Upload.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'File not found' });
    res.set('Content-Type', doc.contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(doc.data);
  } catch (err) {
    res.status(404).json({ message: 'File not found' });
  }
});

module.exports = router;
