# Happy Pill

This is a submission for the [DEV April Fools Challenge](https://dev.to/challenges/aprilfools-2026)

## Features

- **YouTube Integration:** Plays or pauses a YouTube video depending on your smile state.
- **Status Panel:** Displays the current state of the camera, smile analysis, and video playback.
- **Grace Period:** Gives you a few seconds to start smiling before the smile detection affects playback.
- **Manual Smile Toggle:** If automatic smile detection is unavailable (e.g., missing or invalid Gemini API key), you can manually toggle your smile state using a dedicated button.
- **Responsive UI:** Works well on both desktop and mobile devices.

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- A modern web browser with webcam support

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/ashmeet-chhabra/happy-pill
   cd happy-pill
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up a Gemini API key for automatic smile detection:
    - Create a `.env` file and add:
       ```
       VITE_GEMINI_API_KEY=your_api_key_here
       ```
    - If you skip this step or the key is invalid, the app will automatically enable the **manual smile toggle** as a fallback, allowing you to control the smile state manually.

### Running the App

Start the development server:
```
npm run dev
```
Open your browser and navigate to the local server address provided in the terminal.

## Project Structure

- `src/components/` – UI components (Header, WebcamPreview, StatusPanel, ControlsBar, YouTubePlayerPanel)
- `src/hooks/` – Custom React hooks for camera, smile analysis, and YouTube player logic
- `src/services/` – Service modules for camera, Gemini API, and YouTube integration
- `src/types/` – TypeScript type definitions