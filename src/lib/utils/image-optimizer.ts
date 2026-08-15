/**
 * Premium Image Optimization Utility
 * Automatically converts any image File to high-quality WebP format directly in the browser.
 * Reduces bandwidth requirements and improves loading speed across the EmberQuest platform.
 */
export async function convertToWebP(file: File, quality: number = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('WebP conversion failed'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
