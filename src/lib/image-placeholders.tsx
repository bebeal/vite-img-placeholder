  import { toBase64 } from './utils';

  export type PlaceholderValue = string;

  // Shimmer effect SVG
  const shimmer = (w: number, h: number) => `
  <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
      <linearGradient id="g">
        <stop stop-color="#333" offset="20%" />
        <stop stop-color="#222" offset="50%" />
        <stop stop-color="#333" offset="70%" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="#333" />
    <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
  </svg>`;
  export const getShimmerPlaceholder = (w: number = 700, h: number = 475): PlaceholderValue => `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;

// SVG blur effect
export const getBlurPlaceholder = ({
  widthInt,
  heightInt,
  blurDataURL,
}: {
  widthInt: number;
  heightInt: number;
  blurDataURL: string;
}): PlaceholderValue => {
  const std = 20;

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${widthInt} ${heightInt}'>
    <filter id='b' color-interpolation-filters='sRGB'>
      <feGaussianBlur stdDeviation='${std}'/>
      <feColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/>
      <feFlood x='0' y='0' width='100%' height='100%'/>
      <feComposite operator='out' in='s'/>
      <feComposite in2='SourceGraphic'/>
      <feGaussianBlur stdDeviation='${std}'/>
    </filter>
    <image width='100%' height='100%' x='0' y='0' preserveAspectRatio='none' style='filter: url(#b);' href='${blurDataURL}'/>
  </svg>`;

  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}

  // RGB placeholder adapted from https://stackoverflow.com/a/33919020/266535
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const triplet = (e1: number, e2: number, e3: number) => keyStr.charAt(e1 >> 2) + keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) + keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) + keyStr.charAt(e3 & 63);
  export const getRgbPlaceholder = (r: number, g: number, b: number): PlaceholderValue => `data:image/gif;base64,R0lGODlhAQABAPAA${triplet(0, r, g) + triplet(b, 255, 255)}/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;
