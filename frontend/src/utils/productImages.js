/** Primary image_url plus any additional gallery images (deduped). */
export function getProductImages(product) {
    if (!product) return [];

    const all = [product.image_url, ...(product.images || [])].filter(Boolean);
    return [...new Set(all)];
}
