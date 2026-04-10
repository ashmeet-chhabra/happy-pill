const YOUTUBE_IFRAME_API_SRC = 'https://www.youtube.com/iframe_api';
const START_TIME_SECONDS = 7;

let apiReady = false;

interface YouTubePlayerState {
  UNSTARTED: number;
  ENDED: number;
  PLAYING: number;
  PAUSED: number;
}

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  destroy: () => void;
}

interface YouTubeAPI {
  Player: new (
    element: HTMLElement,
    config: {
      height: string;
      width: string;
      videoId: string;
      playerVars: Record<string, number>;
      events: {
        onReady: () => void;
        onStateChange: (event: { data: number }) => void;
      };
    },
  ) => YouTubePlayer;
  PlayerState: YouTubePlayerState;
}

declare global {
  interface Window {
    YT: YouTubeAPI;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface CreateYouTubePlayerOptions {
  element: HTMLElement;
  videoId: string;
  onReady: () => void;
  onStateChange: (state: number) => void;
}

async function loadYouTubeApi(): Promise<void> {
  if (apiReady || window.YT?.Player) {
    return;
  }

  // Check if script already exists
  const existingScript = document.querySelector(`script[src="${YOUTUBE_IFRAME_API_SRC}"]`);
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = YOUTUBE_IFRAME_API_SRC;
    script.async = true;
    document.head.appendChild(script);
  }

  // Wait for YouTube API to be ready
  return new Promise<void>((resolve) => {
    const checkReady = () => {
      if (window.YT?.Player) {
        apiReady = true;
        resolve();
      } else {
        setTimeout(checkReady, 50);
      }
    };

    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      resolve();
    };

    checkReady();
  });
}

export async function createYouTubePlayer(
  options: CreateYouTubePlayerOptions,
): Promise<{ player: YouTubePlayer; playerState: YouTubePlayerState }> {
  await loadYouTubeApi();

  const player = new window.YT.Player(options.element, {
    height: '100%',
    width: '100%',
    videoId: options.videoId,
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      start: START_TIME_SECONDS,
    },
    events: {
      onReady: options.onReady,
      onStateChange: (event) => {
        options.onStateChange(event.data);
      },
    },
  });

  return { player, playerState: window.YT.PlayerState };
}

export function seekPlayerToStart(player: YouTubePlayer): void {
  const currentTime = player.getCurrentTime();
  if (currentTime < START_TIME_SECONDS - 0.2) {
    player.seekTo(START_TIME_SECONDS, true);
  }
}

export function pausePlayerAtStart(player: YouTubePlayer): void {
  player.seekTo(START_TIME_SECONDS, true);
  player.pauseVideo();
}

export { START_TIME_SECONDS };
