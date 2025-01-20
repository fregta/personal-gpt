# Personal GPT Chat Interface

A sleek, modern chat interface powered by OpenAI's GPT-4 API. Features include dark mode support, image uploads, and markdown rendering.

## Features

- 🔒 Secure API key handling
- 🌓 Dark/Light mode toggle
- 📸 Image upload support (GPT-4 Vision)
- ✨ Markdown rendering with code highlighting
- 💬 Real-time chat interface
- 📚 Chat history with titles
- 🔄 Multiple chat sessions
- 🎯 Model selection (GPT-4o/GPT-4o mini)

## Prerequisites

- Node.js (v18 or higher)
- npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

OR

- Docker desktop installed


### Docker guide

1. Create an env.docker file containing you api key:
```bash
VITE_OPENAI_API_KEY=your_api_key_here
```

2. Run `docker-compose up` command in the project root

3. 

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
VITE_OPENAI_API_KEY=your_api_key_here
```

Alternatively, you can enter your API key directly in the application's UI when you launch it.

## Development

Run the development server:
```bash
npm run dev

```

The application will be available at `http://localhost:5173`

## Building for Production

Build the application:
```bash
npm run build
# or
yarn build
```

Preview the production build:
```bash
npm run preview
# or
yarn preview
```

## Security Note

Your OpenAI API key is stored locally in your browser and is never sent to any external servers besides OpenAI's API endpoints.

## Usage

1. When you first launch the application, you'll be prompted to enter your OpenAI API key if no key was provided in .env file
2. Once authenticated, you can start chatting with the AI
3. Use the image upload button or paste images directly to include them in your messages (GPT-4 Vision)
4. Toggle between dark and light mode using the sun/moon icon
5. Switch between GPT-4o and GPT-4o mini models using the dropdown
6. Create new chats with the plus icon
7. View and manage chat history in the sidebar
8. Clear all chat history with the trash icon 
