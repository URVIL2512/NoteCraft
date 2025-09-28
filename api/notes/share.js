module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { noteId, title, content, tags } = req.body;
    
    // Generate a simple share ID
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const shareUrl = `https://note-craft22.vercel.app/shared/${shareId}`;
    
    // In a real app, you'd save this to a database
    // For now, we'll just return the share URL
    res.json({
      shareId,
      shareUrl,
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shareable link' });
  }
};
