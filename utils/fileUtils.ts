/**
 * Converts a File object to a Base64 string suitable for the Gemini API.
 * (Removes the data URL prefix)
 */
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      } else {
        reject(new Error("Failed to read file as string"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};