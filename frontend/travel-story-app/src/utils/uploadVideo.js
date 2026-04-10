import axiosInstance from "./axiosInstance";

const uploadVideo = async (videoFile) => {
  const formData = new FormData();

  // Append video file to form data
  formData.append('video', videoFile);

  try {
    const response = await axiosInstance.post(
      '/video-upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data; // Return response data
  } catch (error) {
    console.error('Error uploading the video:', error);
    throw error; // Rethrow error for handling
  }
};

export default uploadVideo;
