# NoteCraft - AI-Powered Note Taking

A modern, intelligent note-taking application with AI features powered by Google Gemini.

## ✨ Features

- **📝 Rich Text Editor**: Clean, distraction-free writing experience
- **🤖 AI-Powered Features**:
  - **Summary**: Generate concise summaries of your notes
  - **Tags**: Auto-suggest relevant tags
  - **Grammar Check**: Fix grammar and spelling errors
  - **Auto Glossary**: Extract key terms with definitions
- **🔗 Shareable Notes**: Create public links to share your notes
- **🔒 Encryption**: Secure your sensitive notes with password protection
- **📱 Responsive**: Works perfectly on desktop and mobile
- **💾 Local Storage**: Your notes are saved locally in your browser

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- Google AI Studio API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd PlayPower
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Set up Google AI API**
   - Get your API key from [Google AI Studio](https://aistudio.google.com/)
   - Set environment variable:
     ```bash
     set GOOGLE_API_KEY=your_api_key_here
     ```

4. **Start the application**
   ```bash
   # Windows
   start-project.bat
   
   # Or manually:
   # Terminal 1: Backend
   cd backend && python app.py
   
   # Terminal 2: Frontend  
   cd frontend && npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5173

## 🛠️ Development

### Project Structure
```
PlayPower/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── componetns/    # React components
│   │   ├── services/      # AI service functions
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── package.json
├── backend/           # Python Flask API
│   ├── app.py         # Main Flask application
│   └── requirements.txt
├── package.json       # Root package.json
├── Procfile          # Heroku deployment
└── requirements.txt  # Python dependencies
```

### Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run build` - Build frontend for production
- `npm start` - Start backend only

## 🌐 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   vercel --prod
   ```

4. **Set environment variables**
   In Vercel dashboard, add:
   ```
   GOOGLE_API_KEY = your_api_key_here
   ```

For detailed deployment instructions, see [VERCEL-DEPLOY.md](VERCEL-DEPLOY.md)

## 🔧 Configuration

### Environment Variables
- `GOOGLE_API_KEY` - Your Google AI Studio API key
- `PORT` - Server port (default: 5173)

### API Endpoints
- `POST /api/ai/summary` - Generate note summary
- `POST /api/ai/tags` - Suggest tags
- `POST /api/ai/grammar` - Check grammar
- `POST /api/ai/glossary` - Generate glossary
- `POST /api/notes/share` - Create shareable link
- `GET /shared/<id>` - View shared note

## 📱 Usage

1. **Create Notes**: Click "New Note" to start writing
2. **AI Features**: Use the AI sidebar for summaries, tags, grammar check, and glossary
3. **Share Notes**: Click "Share" to create a public link
4. **Encrypt Notes**: Use the lock icon to password-protect sensitive notes
5. **Search**: Use the search bar to find notes quickly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Google API key is correct
3. Ensure both frontend and backend are running
4. Check the terminal logs for backend errors

---

**Made with ❤️ using React, TypeScript, Python, and Google Gemini AI**
