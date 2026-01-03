// lib/image-helpers.ts

/**
 * Get image URL from Appwrite Storage
 * @param fileId - Appwrite file ID stored in database
 * @returns Full image URL
 */
export function getImageUrl(fileId: string | null): string {
    if (!fileId) return '/placeholder-event.png'; // fallback image

    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
}

/**
 * Get optimized image URL with width/height
 */
export function getOptimizedImageUrl(
    fileId: string | null,
    width?: number,
    height?: number
): string {
    if (!fileId) return '/placeholder-event.png';

    const baseUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/preview?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('output', 'webp'); // Convert to WebP for better performance

    return `${baseUrl}&${params.toString()}`;
}