# thiswebsiteisnot.online 🌐

An infinite website generator powered by AI - every URL path generates a completely unique, AI-created website on the spot!

## 🎯 Concept

Visit `thiswebsiteisnot.online/anything` and watch as GPT-OSS AI generates a completely unique website based on your URL path. Every refresh creates new content - no two visits are ever the same!

## 🚀 Features

- **Infinite Content**: Every URL path generates a unique website
- **AI-Powered**: Uses OpenRouter's GPT-OSS 20B model for content generation
- **Dynamic Generation**: Fresh content on every visit
- **Modern Design**: Beautiful, responsive UI with animations
- **Zero Database**: No storage needed - everything is generated live
- **Creative Freedom**: AI can create anything from simple pages to complex interactive experiences

## 🛠️ Technical Stack

- **Backend**: Node.js + Express.js
- **AI**: OpenRouter GPT-OSS 20B API
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Deployment**: Ready for any Node.js hosting platform

## 📦 Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   # Copy the example environment file and add your API key
   cp env.example .env
   # Edit .env file with your actual OpenRouter API key
   ```
4. Start the server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## 🔧 Configuration

Create a `.env` file in the root directory with the following variables:

```env
OPENROUTER_API_KEY=your-openrouter-api-key-here
SITE_URL=https://yoursite.com
SITE_NAME=Your Site Name
PORT=3000
NODE_ENV=development
```

**Important**: Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

## 🌟 How It Works

1. User visits `thiswebsiteisnot.online/[anything]`
2. Express server catches the URL path with a wildcard route
3. The path is sent to GPT-OSS AI with a creative prompt
4. AI generates complete HTML with styling and interactivity
5. Server returns the generated HTML to the user
6. Every refresh generates completely new content!

## 🎨 Example URLs

Try these paths for inspiration:
- `/cosmic-coffee-shop`
- `/time-traveling-library`
- `/underwater-restaurant`
- `/robot-therapy-center`
- `/gravity-free-gym`
- `/emoji-translator`

## 🚀 Deployment

This app is ready to deploy on platforms like:
- Heroku
- Railway
- Render
- DigitalOcean App Platform
- Any Node.js hosting service

Remember to set your `OPENROUTER_API_KEY` environment variable in production!

## 👨‍💻 Creator

Made with ❤️ by [Kuber Mehta](https://kuber.studio)

## 📄 License

MIT License - feel free to fork and create your own infinite website generator!
