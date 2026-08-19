import Image from "next/image";
import { cloudUrl } from "@/lib/cloudimage";

interface CloudImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    sizes?: string;
    className?: string;
    priority?: boolean;
}

/**
 * Next <Image> that serves Cloudinary-hosted product images directly from the
 * CDN with f_auto/q_auto/responsive-width transforms, bypassing Next's image
 * optimizer. Any non-Cloudinary src (local, base64, external) passes through
 * unchanged with default behavior.
 */
export function CloudImage({ src, alt, width, height, fill, sizes, className, priority }: CloudImageProps) {
    const isCloud = src.includes('/image/upload/');
    // width is used as a Cloudinary transform hint; it must not be passed to
    // next/image together with fill (Next throws if both are set).
    const optimized = isCloud ? cloudUrl(src, width) : src;
    return (
        <Image
            src={optimized}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            sizes={sizes}
            className={className}
            priority={priority}
            unoptimized={isCloud} // fetch from Cloudinary directly — no Next proxy/optimizer
        />
    );
}