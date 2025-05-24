import { createCanvas, loadImage } from 'canvas';
import { Plugin } from 'vite';
import { getBlurPlaceholder, getRgbPlaceholder, getShimmerPlaceholder } from './image-placeholders';

export const placeholderStyles = ['blur', 'shimmer', 'rgb'] as const;
export type PlaceholderStyle = typeof placeholderStyles[number];

// DOM manipulation code - only runs in browser
const createDOMContentLoadedHandler = (): (() => void) => {
  return () => {
    const processImg = (img: HTMLImageElement): void => {
      const src = img.getAttribute('src');
      if (src) {
        // Skip already processed images
        const parent = img.parentNode as HTMLElement;
        if (parent && parent.classList.contains('image-with-placeholder')) {
          return;
        }

        // Set placeholder attribute
        const match = src.match(/placeholder=([^&]+)/) || src.match(/p=([^&]+)/);
        const placeholderType = match ? match[1] : 'blur';
        img.setAttribute('data-placeholder', placeholderType);

        // Get background image from computed style
        const computedStyle = window.getComputedStyle(img);
        const bgImage = computedStyle.backgroundImage;

        if (bgImage && bgImage !== 'none') {
          const originalStyles: Record<string, string> = {};
          for (let i = 0; i < computedStyle.length; i++) {
            const prop = computedStyle[i];
            originalStyles[prop] = computedStyle.getPropertyValue(prop);
          }
          const nextSibling = img.nextSibling;
          const parentNode = img.parentNode;

          // create identical wrapper
          const wrapper = document.createElement('div');
          wrapper.className = 'image-with-placeholder';
          const placeholder = document.createElement('div');
          placeholder.className = 'image-placeholder';
          placeholder.style.backgroundImage = bgImage;

          // Insert wrapper and elements
          if (parentNode) {
            // Proper insertion to maintain DOM position
            parentNode.removeChild(img);

            // Structure: wrapper > placeholder + img
            wrapper.appendChild(placeholder);
            wrapper.appendChild(img);

            if (nextSibling) {
              parentNode.insertBefore(wrapper, nextSibling);
            } else {
              parentNode.appendChild(wrapper);
            }
          }

          img.style.backgroundImage = 'none';

          // Hide image initially until fully loaded
          img.style.visibility = 'hidden';

          // Handle image loading - ensure clean transition
          if (!img.complete) {
            const newImg = new Image();
            newImg.onload = () => {
              // Clean transition - only reveal when fully loaded
              img.classList.add('loaded');
              img.style.visibility = 'visible';
              placeholder.style.display = 'none';
            };
            newImg.src = img.src;
            if (newImg.complete) {
              img.classList.add('loaded');
              img.style.visibility = 'visible';
              placeholder.style.display = 'none';
            }
          } else {
            img.classList.add('loaded');
            img.style.visibility = 'visible';
            placeholder.style.display = 'none';
          }
        }
      }
    };

    // Process all images
    document.querySelectorAll('img').forEach(img => {
      processImg(img as HTMLImageElement);
    });

    // Watch for new images
    new MutationObserver(mutations => {
      mutations.forEach(record => {
        record.addedNodes.forEach(node => {
          if (node.nodeName === 'IMG') {
            processImg(node as HTMLImageElement);
          }
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            element.querySelectorAll('img').forEach((img) => {
              processImg(img as HTMLImageElement);
            });
          }
        });
      });
    }).observe(document.body, {childList: true, subtree: true});
  };
};

export const imagePlaceholder = (options: { style: PlaceholderStyle } = { style: 'shimmer' }): Plugin => {
  const placeholders = new Map<string, { file: string, data: string, type: PlaceholderStyle }>();

  return {
    name: 'vite-image-placeholder',

    async transform(_code, id) {
      if (!id.match(/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/)) {
        return null;
      }

      try {
        const [imagePath, query] = id.split('?');
        const filename = imagePath.split('/').pop() || imagePath;

        let placeholderType = options.style;
        if (query) {
          const params = new URLSearchParams(query);
          // Check for short param 'p' first, then fall back to 'placeholder'
          if (params.has('p')) {
            const paramValue = params.get('p');
            if (paramValue && placeholderStyles.includes(paramValue as PlaceholderStyle)) {
              placeholderType = paramValue as PlaceholderStyle;
            }
          } else if (params.has('placeholder')) {
            const paramValue = params.get('placeholder');
            if (paramValue && placeholderStyles.includes(paramValue as PlaceholderStyle)) {
              placeholderType = paramValue as PlaceholderStyle;
            }
          }
        }

        try {
          const img = await loadImage(imagePath);
          const widthInt = img.width;
          const heightInt = img.height;
          let placeholderData: string;

          switch(placeholderType) {
            case 'shimmer': {
              placeholderData = getShimmerPlaceholder(widthInt, heightInt);
              break;
            }
            case 'rgb': {
              const canvas = createCanvas(1, 1);
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, 1, 1);
              const {data} = ctx.getImageData(0, 0, 1, 1);
              placeholderData = getRgbPlaceholder(data[0], data[1], data[2]);
              break;
            }
            case 'blur':
            default: {
              const blurCanvas = createCanvas(32, Math.round((32 / widthInt) * heightInt));
              const blurCtx = blurCanvas.getContext('2d');
              blurCtx.drawImage(img, 0, 0, blurCanvas.width, blurCanvas.height);
              const thumbnailDataURL = blurCanvas.toDataURL('image/png');
              placeholderData = getBlurPlaceholder({
                widthInt,
                heightInt,
                blurDataURL: thumbnailDataURL
              });
            }
          }

          const compositeKey = `${filename}-${placeholderType}`;
          placeholders.set(compositeKey, { file: filename, data: placeholderData, type: placeholderType });
        } catch (error) {
          // Silently fail in SSR, don't try to generate fallbacks
          console.error(`Error processing image ${imagePath}:`, error);
        }

        return _code;
      } catch (error) {
        console.error(`Error processing image ${id}:`, error);
        return null;
      }
    },

    transformIndexHtml() {
      let css = '';
      placeholders.forEach((info) => {
        const { file, data, type } = info;
        css += `
          img[src*="${file}"][data-placeholder="${type}"] {
            background-image: url(${data});
            background-size: cover;
            background-position: center;
          }
        `;
      });

      css += `
        .image-with-placeholder {
          display: inline-block;
          position: relative;
          width: auto;
          height: auto;
          margin: 0;
          padding: 0;
        }

        .image-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
          background-size: 100% 100%;
          background-position: center;
          border-radius: 10px;
        }

        .image-with-placeholder img {
          position: relative;
          z-index: 2;
          display: block;
          width: 100%;
          height: 100%;
          visibility: hidden;
        }

        .image-with-placeholder img.loaded {
          visibility: visible;
          transition: visibility 0s;
        }
      `;

      const handlerFunction = createDOMContentLoadedHandler();
      const scriptContent = `document.addEventListener('DOMContentLoaded', ${handlerFunction.toString()});`;

      return [
        {
          tag: 'style',
          injectTo: 'head-prepend',
          children: css
        },
        {
          tag: 'script',
          injectTo: 'head',
          children: scriptContent
        }
      ];
    }
  };
};
