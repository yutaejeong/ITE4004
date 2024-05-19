export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteString = atob(base64.split(",")[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }
  return new Blob([arrayBuffer], { type: mimeType });
};

export const playAudio = (base64: string): Promise<void> => {
  const audio = new Audio(base64);
  audio.onended = () => {
    URL.revokeObjectURL(audio.src);
  };
  audio.onerror = (error) => {
    console.error("cannot load audio: ", error);
  };
  return audio.play().catch((error) => {
    console.error("cannot play audio: ", error);
  });
};
