# thiswebsiteisnot.online 🌐

An infinite website generator powered by AI - every URL path generates a completely unique, AI-created website on the spot!

## 🎯 Concept

Visit `thiswebsiteisnot.online/anything` and watch as GPT-OSS AI generates a completely unique website based on your URL path. Every refresh creates new content - no two visits are ever the same!

## 🚀 Features

- **Infinite Content**: Every URL path generates a unique website
- **AI-Powered**: Uses OpenRouter's GPT-OSS 120B model for content generation
- **Dynamic Generation**: Fresh content on every visit
- **Modern Design**: Beautiful, responsive UI with animations
- **Zero Database**: No storage needed - everything is generated live
- **Creative Freedom**: AI can create anything from simple pages to complex interactive experiences

## 🛠️ Technical Stack

- **Backend**: Node.js + Express.js
- **AI**: OpenRouter GPT-OSS 120B API
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

## 🧪 Optional: Run GPT-OSS 20B Locally

You can swap the remote OpenRouter API for a local instance of the smaller `gpt-oss-20b` model. The app will detect env vars and automatically send chat requests to your local OpenAI-compatible server.

### 1. Environment Variables

Add (or edit) the following in your `.env`:

```
MODEL_PROVIDER=local
MODEL_API_BASE=http://localhost:8000/v1   # vLLM / Transformers serve default
MODEL_NAME=openai/gpt-oss-20b            # or gpt-oss:20b for Ollama
# MODEL_API_KEY=                         # only if your local server enforces auth
```

Revert to the hosted model any time by removing those or setting:

```
MODEL_PROVIDER=openrouter
MODEL_NAME=openai/gpt-oss-120b
```

### 2. Run with vLLM (Recommended for performance)

Install (example using Python + uv as per model card):

```
uv pip install --pre vllm==0.10.1+gptoss \
   --extra-index-url https://wheels.vllm.ai/gpt-oss/ \
   --extra-index-url https://download.pytorch.org/whl/nightly/cu128 \
   --index-strategy unsafe-best-match

vllm serve openai/gpt-oss-20b
```

This exposes an OpenAI-compatible endpoint at `http://localhost:8000/v1`.

### 3. Run with Transformers Serve

```
pip install -U transformers kernels torch
transformers serve --model openai/gpt-oss-20b
```

### 4. Run with Ollama (Consumer Hardware)

```
ollama pull gpt-oss:20b
ollama run gpt-oss:20b
```

Enable (if needed) the OpenAI-compatible endpoint in Ollama and set:
```
MODEL_API_BASE=http://localhost:11434/v1
MODEL_NAME=gpt-oss:20b
```

### 5. Quick Local Test

After starting your local model and setting env vars:

```
npm run local:example
```

This runs `local-gpt-oss-20b.js` which performs a small test chat request.

### 6. Using Local Model in the App

Start the server normally:
```
npm run dev
```
All dynamic generations will use your local model instead of OpenRouter.

### Notes
- Local mode uses `MODEL_NAME` if provided, otherwise defaults to `openai/gpt-oss-20b`.
- If `MODEL_PROVIDER` is anything other than `local`, OpenRouter is used.
- Rate limit messaging is only shown for OpenRouter responses.
- Local endpoints must implement the `/v1/chat/completions` OpenAI schema.

### Troubleshooting
| Symptom | Fix |
| ------- | --- |
| ECONNREFUSED | Check that the local server is running and `MODEL_API_BASE` matches its URL |
| 404 Not Found | Ensure base URL ends with `/v1` if required |
| Empty output | Inspect local server logs; verify it supports chat completions |
| Slow responses | Reduce `max_tokens` or run with better GPU |

Enjoy hacking locally with full control! 🚀

Made with ❤️ by [Kuber Mehta](https://kuber.studio)

## 📄 License

Apache 2.0 - Check the License file for more details.


