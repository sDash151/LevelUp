/**
 * Cloudinary upload utility for LevelUp.
 * Requires env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * Gracefully falls back if credentials are not configured.
 */

let cloudinaryClient = null;

async function getClient() {
  if (cloudinaryClient) return cloudinaryClient;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('Cloudinary credentials not configured. Photo uploads will use placeholder URLs.');
    return null;
  }

  try {
    const cloudinary = await import('cloudinary');
    cloudinary.v2.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    cloudinaryClient = cloudinary.v2;
    return cloudinaryClient;
  } catch (error) {
    console.error('Failed to initialize Cloudinary:', error.message);
    return null;
  }
}

/**
 * Upload a base64 image to Cloudinary.
 * @param {string} base64String - Base64 encoded image (with or without data URI prefix)
 * @param {string} folder - Cloudinary folder (default: 'levelup/fitness')
 * @returns {Promise<{publicId: string, secureUrl: string}>}
 */
export async function uploadImage(base64String, folder = 'levelup/fitness') {
  const client = await getClient();

  if (!client) {
    // Fallback: generate a placeholder
    const id = `placeholder_${Date.now()}`;
    return {
      publicId: id,
      secureUrl: `https://placehold.co/400x600/1a1a2e/e8b94a?text=Progress+Photo`,
    };
  }

  const dataUri = base64String.startsWith('data:') ? base64String : `data:image/jpeg;base64,${base64String}`;

  const result = await client.uploader.upload(dataUri, {
    folder,
    transformation: [
      { width: 800, height: 1200, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
  };
}

/**
 * Delete an image from Cloudinary.
 * @param {string} publicId - Cloudinary public ID
 */
export async function deleteImage(publicId) {
  const client = await getClient();
  if (!client || publicId.startsWith('placeholder_')) return;
  await client.uploader.destroy(publicId);
}
