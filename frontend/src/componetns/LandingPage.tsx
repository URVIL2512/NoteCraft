import React from 'react';
import { 
  FileText, 
  Sparkles, 
  Lock, 
  Search, 
  Pin, 
  Tags,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const features = [
    {
      icon: FileText,
      title: 'Rich Text Editor',
      description: 'Custom-built editor with formatting tools, font sizing, and text alignment options.',
      color: 'text-blue-600'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Features',
      description: 'Smart summarization, tag suggestions, grammar checking, and auto-glossary generation.',
      color: 'text-purple-600'
    },
    {
      icon: Lock,
      title: 'Secure Encryption',
      description: 'Password-protect your sensitive notes with client-side encryption technology.',
      color: 'text-red-600'
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find notes instantly by searching through titles, content, and tags.',
      color: 'text-green-600'
    },
    {
      icon: Pin,
      title: 'Organization Tools',
      description: 'Pin important notes, add tags, and keep your workspace organized.',
      color: 'text-orange-600'
    },
    {
      icon: Zap,
      title: 'Auto-Save',
      description: 'Never lose your work with automatic saving and localStorage persistence.',
      color: 'text-indigo-600'
    }
  ];

  const benefits = [
    'No external dependencies for rich text editing',
    'Complete privacy with local storage',
    'Mobile-responsive design',
    'Professional-grade interface',
    'Advanced AI integration ready',
    'Secure note encryption'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg mb-4">
              <FileText className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Note<span className="text-blue-600">Craft</span>
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            A powerful, AI-enhanced note-taking application with custom rich text editing, 
            secure encryption, and intelligent features to boost your productivity.
          </p>
          
          <button
            onClick={onStart}
            className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto"
          >
            Start Taking Notes
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
            >
              <div className={`${feature.color} mb-4`}>
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-12 mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose NoteCraft?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="bg-blue-600 text-white p-3 rounded-xl inline-block mb-3">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Secure</h4>
                  <p className="text-sm text-gray-600">Client-side encryption</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-600 text-white p-3 rounded-xl inline-block mb-3">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Smart</h4>
                  <p className="text-sm text-gray-600">AI-powered features</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-600 text-white p-3 rounded-xl inline-block mb-3">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Fast</h4>
                  <p className="text-sm text-gray-600">Instant auto-save</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-orange-600 text-white p-3 rounded-xl inline-block mb-3">
                    <Tags className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Organized</h4>
                  <p className="text-sm text-gray-600">Smart tagging</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        <footer className="mt-20 border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">NoteCraft</h2>
                  <p className="text-xs text-gray-500">Intelligent Note Taking</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-500 mb-1">
                  © 2025 NoteCraft. All rights reserved.
                </p>
                <p className="text-xs text-gray-400">
                  Empowering productivity through intelligent note-taking.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;