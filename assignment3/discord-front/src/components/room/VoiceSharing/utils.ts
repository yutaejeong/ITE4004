export const playAudio = (src: string): Promise<void> => {
  const audio = new Audio(src);
  audio.onerror = (error) => {
    console.error("cannot load audio: ", error);
  };
  return audio.play().catch((error) => {
    console.error("cannot play audio: ", error);
  });
};
