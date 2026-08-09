import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

/**
 * Compresses an image file using browser Canvas.
 */
export async function compressImage(file: File, maxWidthOrHeight = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If file is not an image, return original file as Blob
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          } else {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Uploads a compressed Blob/File to Firebase Storage and returns the download URL.
 */
export function uploadImageToStorage(
  blobOrFile: Blob | File,
  folder = 'reports',
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, blobOrFile, { contentType: 'image/jpeg' });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
