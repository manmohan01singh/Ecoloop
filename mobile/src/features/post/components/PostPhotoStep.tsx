import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { PostPhotoItem } from '../types/post.types';
import { useDeviceVisionHook } from '../hooks/useDeviceVisionHook';

export interface PostPhotoStepProps {
  photos: PostPhotoItem[];
  onPhotosChange: (photos: PostPhotoItem[]) => void;
  onNext: () => void;
}

const SAMPLE_DEVICE_PHOTOS = [
  'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
];

export const PostPhotoStep: React.FC<PostPhotoStepProps> = ({
  photos,
  onPhotosChange,
  onNext,
}) => {
  const theme = useAppTheme();
  const { statusMessage } = useDeviceVisionHook();
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Take photo with native camera
  const handleTakePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setPermissionDenied(true);
        Alert.alert(
          'Camera Access Required',
          'EcoLoop needs camera access to photograph your device for condition assessment. Please grant permissions in your device settings or choose photos from your library.',
          [{ text: 'OK' }]
        );
        return;
      }

      setPermissionDenied(false);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhoto: PostPhotoItem = {
          id: `photo-${Date.now()}`,
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
          isPrimary: photos.length === 0,
        };
        onPhotosChange([...photos, newPhoto]);
      }
    } catch {
      Alert.alert('Camera Error', 'Could not access device camera. You can select photos from your gallery instead.');
    }
  };

  // Select photo from library
  const handleChooseFromLibrary = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setPermissionDenied(true);
        Alert.alert(
          'Photo Library Access Required',
          'EcoLoop needs access to your photos to upload hardware condition shots.',
          [{ text: 'OK' }]
        );
        return;
      }

      setPermissionDenied(false);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhoto: PostPhotoItem = {
          id: `photo-${Date.now()}`,
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
          isPrimary: photos.length === 0,
        };
        onPhotosChange([...photos, newPhoto]);
      }
    } catch {
      Alert.alert('Library Error', 'Could not open media library.');
    }
  };

  // Add sample photos (for simulators/environments where camera/gallery is unavailable)
  const handleAddSamplePhotos = () => {
    const sampleItems: PostPhotoItem[] = SAMPLE_DEVICE_PHOTOS.map((uri, idx) => ({
      id: `sample-photo-${idx}-${Date.now()}`,
      uri,
      isPrimary: idx === 0,
    }));
    onPhotosChange(sampleItems);
  };

  const handleRemovePhoto = (id: string) => {
    const filtered = photos.filter((p) => p.id !== id);
    if (filtered.length > 0 && !filtered.some((p) => p.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    onPhotosChange(filtered);
  };

  const handleSetPrimary = (id: string) => {
    const updated = photos.map((p) => ({
      ...p,
      isPrimary: p.id === id,
    }));
    onPhotosChange(updated);
  };

  const handleReplacePhoto = async (id: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const updated = photos.map((p) => {
          if (p.id === id) {
            return {
              ...p,
              uri: result.assets[0].uri,
              width: result.assets[0].width,
              height: result.assets[0].height,
            };
          }
          return p;
        });
        onPhotosChange(updated);
      }
    } catch {
      Alert.alert('Replacement Error', 'Could not replace the selected photo.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Editorial Guidance */}
        <View style={styles.headerTextGroup}>
          <AppText variant="title3" weight="700">
            Photograph your hardware
          </AppText>
          <AppText variant="subheadline" color="secondary" style={styles.subtitle}>
            Capture clear photos of the screen, chassis, and any visible ports or wear. High-clarity photos help accurate circular matching.
          </AppText>
        </View>

        {/* Permission Denied Notice */}
        {permissionDenied ? (
          <View
            style={[
              styles.warningBanner,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(255, 159, 10, 0.15)'
                  : '#FFF6E6',
                borderColor: theme.colors.warning,
                borderWidth: theme.hairlineWidth,
                borderRadius: theme.radii.md,
              },
            ]}
          >
            <AppIcon
              name="warning-outline"
              size={18}
              color={theme.colors.warning}
              style={{ marginRight: 8, marginTop: 1 }}
            />
            <View style={{ flex: 1 }}>
              <AppText variant="subheadline" weight="600" customColor={theme.colors.warning}>
                Camera Permission Needed
              </AppText>
              <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
                Please allow camera or photo library access in your system settings, or load a sample device photo below.
              </AppText>
            </View>
          </View>
        ) : null}

        {/* Capture Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Take Photo with Camera"
            activeOpacity={0.75}
            onPress={handleTakePhoto}
            style={[
              styles.captureCard,
              {
                backgroundColor: theme.colors.secondaryBackground,
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
                borderRadius: theme.radii.lg,
                ...theme.shadows.card,
              },
            ]}
          >
            <View
              style={[
                styles.captureIconCircle,
                { backgroundColor: theme.colors.tintLight },
              ]}
            >
              <AppIcon name="camera" size={24} color={theme.colors.tint} />
            </View>
            <AppText variant="subheadline" weight="600" align="center">
              Take Photo
            </AppText>
            <AppText variant="caption2" color="tertiary" align="center" style={{ marginTop: 2 }}>
              Native Camera
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Choose from Photo Library"
            activeOpacity={0.75}
            onPress={handleChooseFromLibrary}
            style={[
              styles.captureCard,
              {
                backgroundColor: theme.colors.secondaryBackground,
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
                borderRadius: theme.radii.lg,
                ...theme.shadows.card,
              },
            ]}
          >
            <View
              style={[
                styles.captureIconCircle,
                { backgroundColor: theme.colors.fill },
              ]}
            >
              <AppIcon name="images-outline" size={24} color={theme.colors.labelPrimary} />
            </View>
            <AppText variant="subheadline" weight="600" align="center">
              Photo Library
            </AppText>
            <AppText variant="caption2" color="tertiary" align="center" style={{ marginTop: 2 }}>
              Select Existing
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Fallback Simulator Sample Loader */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Use sample device images"
          activeOpacity={0.7}
          onPress={handleAddSamplePhotos}
          style={styles.sampleLoaderButton}
        >
          <AppIcon name="phone-portrait-outline" size={14} color={theme.colors.tint} style={{ marginRight: 6 }} />
          <AppText variant="footnote" weight="600" customColor={theme.colors.tint}>
            Load Sample Hardware Images (Simulator)
          </AppText>
        </TouchableOpacity>

        {/* Photos Preview Grid */}
        <View style={styles.photosSection}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="headline" weight="600">
              Selected Photos ({photos.length})
            </AppText>
            {photos.length === 0 ? (
              <AppText variant="caption1" customColor={theme.colors.destructive}>
                At least 1 photo required *
              </AppText>
            ) : null}
          </View>

          {photos.length === 0 ? (
            <View
              style={[
                styles.emptyPhotoBox,
                {
                  backgroundColor: theme.colors.fillSecondary,
                  borderColor: theme.colors.separator,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderRadius: theme.radii.md,
                },
              ]}
            >
              <AppIcon name="camera-outline" size={32} color={theme.colors.labelTertiary} />
              <AppText variant="subheadline" color="tertiary" style={{ marginTop: 8 }}>
                No photos selected yet
              </AppText>
              <AppText variant="caption2" color="secondary" style={{ marginTop: 2 }}>
                Tap "Take Photo" or "Photo Library" above
              </AppText>
            </View>
          ) : (
            <View style={styles.photosGrid}>
              {photos.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.photoThumbnailWrapper,
                    {
                      borderColor: item.isPrimary
                        ? theme.colors.tint
                        : theme.colors.separator,
                      borderWidth: item.isPrimary ? 2 : theme.hairlineWidth,
                      borderRadius: theme.radii.md,
                    },
                  ]}
                >
                  <Image source={{ uri: item.uri }} style={styles.photoThumbnail} />

                  {/* Primary Badge */}
                  {item.isPrimary ? (
                    <View
                      style={[
                        styles.primaryBadge,
                        { backgroundColor: theme.colors.tint },
                      ]}
                    >
                      <AppText variant="caption2" weight="700" customColor="#FFFFFF">
                        COVER
                      </AppText>
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleSetPrimary(item.id)}
                      style={[
                        styles.makePrimaryBadge,
                        { backgroundColor: 'rgba(0,0,0,0.65)' },
                      ]}
                    >
                      <AppText variant="caption2" weight="600" customColor="#FFFFFF">
                        Set Cover
                      </AppText>
                    </TouchableOpacity>
                  )}

                  {/* Replace Button */}
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Replace photo ${index + 1}`}
                    activeOpacity={0.75}
                    onPress={() => handleReplacePhoto(item.id)}
                    style={styles.replacePhotoButton}
                  >
                    <AppIcon name="repeat" size={13} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Delete Button */}
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Remove photo ${index + 1}`}
                    activeOpacity={0.75}
                    onPress={() => handleRemovePhoto(item.id)}
                    style={styles.deletePhotoButton}
                  >
                    <AppIcon name="trash" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* AI Vision Architecture Notice */}
        <View
          style={[
            styles.visionNoticeCard,
            {
              backgroundColor: theme.colors.fillSecondary,
              borderRadius: theme.radii.md,
            },
          ]}
        >
          <AppIcon
            name="hardware-chip-outline"
            size={18}
            color={theme.colors.tint}
            style={{ marginRight: 8, marginTop: 2 }}
          />
          <View style={{ flex: 1 }}>
            <AppText variant="footnote" weight="600">
              Future AI Vision Interface Ready
            </AppText>
            <AppText variant="caption2" color="secondary" style={{ marginTop: 2, lineHeight: 16 }}>
              {statusMessage}
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* Footer Next Button */}
      <View style={styles.footer}>
        <AppButton
          label="Next: Device Information"
          variant="filled"
          size="large"
          fullWidth
          disabled={photos.length === 0}
          onPress={onNext}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scroll: {
    paddingBottom: 20,
  },
  headerTextGroup: {
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 4,
    lineHeight: 20,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  captureCard: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sampleLoaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  photosSection: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  emptyPhotoBox: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoThumbnailWrapper: {
    width: '48%',
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  primaryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  makePrimaryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 59, 48, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replacePhotoButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visionNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 16,
  },
  footer: {
    paddingVertical: 12,
  },
});
