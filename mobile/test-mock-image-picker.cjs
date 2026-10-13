const MediaTypeOptions = {
  Images: 'images',
  Videos: 'videos',
  All: 'all',
};

const PermissionStatus = {
  GRANTED: 'granted',
  UNDETERMINED: 'undetermined',
  DENIED: 'denied',
};

module.exports = {
  MediaTypeOptions,
  PermissionStatus,
  requestCameraPermissionsAsync: async () => ({ status: 'granted', granted: true, canAskAgain: true, expires: 'never' }),
  requestMediaLibraryPermissionsAsync: async () => ({ status: 'granted', granted: true, canAskAgain: true, expires: 'never' }),
  getCameraPermissionsAsync: async () => ({ status: 'granted', granted: true, canAskAgain: true, expires: 'never' }),
  getMediaLibraryPermissionsAsync: async () => ({ status: 'granted', granted: true, canAskAgain: true, expires: 'never' }),
  launchCameraAsync: async () => ({ canceled: false, assets: [{ uri: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab', width: 800, height: 600 }] }),
  launchImageLibraryAsync: async () => ({ canceled: false, assets: [{ uri: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab', width: 800, height: 600 }] }),
};
