// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: 'your-cloud-name', // Replace with your Cloudinary cloud name
  uploadPreset: 'your-upload-preset', // Replace with your upload preset
};

export const uploadToCloudinary = async (file: File, resourceType: 'image' | 'video' = 'image') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('resource_type', resourceType);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      resourceType: data.resource_type,
      format: data.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};