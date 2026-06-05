/**
 * Optimizes Unsplash URLs by dynamically setting width, quality, and format parameters.
 * If the URL is not from Unsplash, it is returned unchanged.
 * 
 * @param {string} url - The original image URL
 * @param {number} width - The target width in pixels
 * @returns {string} - The optimized image URL
 */
export const optimizeUnsplashUrl = (url, width = 400) => {
  if (!url) return url;
  
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', '75'); // Web-optimized compression
      urlObj.searchParams.set('auto', 'format'); // Serves webp/avif if supported
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }
  
  return url;
};
