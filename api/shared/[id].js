module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { id } = req.query;
    
    // In a real app, you'd fetch from database
    // For now, return a placeholder
    res.json({
      id,
      title: 'Shared Note',
      content: 'This is a shared note',
      tags: ['shared'],
      sharedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({ error: 'Shared note not found' });
  }
};
