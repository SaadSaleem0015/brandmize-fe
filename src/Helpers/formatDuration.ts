export function formatDuration(seconds: number): string {
    if (seconds === 0 || !seconds) return "00:00";
  
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = secs.toString().padStart(2, "0");
  
    return `${formattedMinutes}:${formattedSeconds}`;
}
