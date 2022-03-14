import { useElementSize } from '@kaliber/use-element-size'
import imageUrlBuilder from '@sanity/image-url'

const SIZES = [320, 480, 720, 1024, 1440, 1920, 2400, 3000, 3600]

export function Image({
  sanityConfig,
  image,
  layoutClassName = undefined, 
  imgProps = {} 
}) {
  return (
    <ImageBase  
      {...{ sanityConfig, image, layoutClassName, imgProps }}
      adjustImage={adjustImageWidth()}
      deriveSizes={deriveSizes()}
    />
  )
}

export function ImageCropped({
  sanityConfig,
  image,
  aspectRatio,
  layoutClassName = undefined, 
  imgProps = {} 
}) {
  return (
    <ImageBase  
      {...imgProps}
      {...{ sanityConfig, image, layoutClassName, imgProps }}
      adjustImage={adjustImageWidthAndCrop(aspectRatio)}
      deriveSizes={deriveSizesCropped(aspectRatio)}
    />
  )
}

export function ImageCover({
  sanityConfig,
  image,
  aspectRatio,
  layoutClassName = undefined, 
  imgProps = {} 
}) {
  return (
    <ImageBase  
      {...{ sanityConfig, image, layoutClassName, imgProps }}
      adjustImage={adjustImageWidthAndCrop(aspectRatio)}
      deriveSizes={deriveSizesCover(aspectRatio)}
      style={{
        objectFit: 'cover',
        ...image.hotspot && { 
          // Because our cropped image size may not match the actual display size, 
          // it's useful to set the object-position the hotspot x and y values
          objectPosition: `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%` 
        }
      }}
    />
  )
}

function ImageBase({
  sanityConfig,
  image,
  adjustImage,
  deriveSizes,
  style = {}, 
  imgProps = {}, 
  layoutClassName = undefined 
}) {
  if (image?.asset && !image.asset.metadata) {
    throw new Error('Image asset doesn\'t have associated metadata. Did you forget to dereference the asset field (`image{..., asset->}`)?')
  }

  const { ref: sizeRef, size: displaySize } = useElementSize()
  const { src, srcSet } = useSrcSet({ config: sanityConfig, image, adjustImage })
  const { width, height, size } = useDerivedSizes({
    deriveSizes,
    displaySize,
    naturalSize: image.asset.metadata.dimensions ?? { width: 0, height: 0 }
  })

  return (
    <img 
      {...imgProps}
      ref={sizeRef}
      className={layoutClassName}
      sizes={size + 'px'}
      {...{ src, srcSet, width, height, style }}
    />
  )
}

function useSrcSet({ config, image, adjustImage }) {
  const builder = imageUrlBuilder(config)
  const adjustImageRef = React.useRef(null)
  adjustImageRef.current = adjustImage

  return React.useMemo(
    () => {
      if (!image.asset) {
        if (process.env.NODE_ENV !== 'production') console.warn('Image doesn\'t have associated asset object. This will render an <img /> tag with an empty src attribute.')
        return { src: '', srcSet: '' }
      }

      const [maxSize] = SIZES.slice(-1)
      const sizes = SIZES.slice(0, -1)
        .filter(w => w < image.asset.metadata.dimensions.width)
        .concat(Math.min(image.asset.metadata.dimensions.width, maxSize))

      const thumb = {
        src: (
          image.asset.metadata.lqip ??
          builder.image(image).width(20).quality(0).blur(20).auto('format').url()
        ),
        width: 1
      }

      const baseImage = builder.image(image).quality(80).auto('format')
      const sources = sizes.map(width => ({ src: adjustImageRef.current(baseImage, width).url(), width }))

      const src = sources.slice(-1)[0].src
      const srcSet = [thumb, ...sources].map(x => `${x.src} ${x.width}w`).join(',')


      return { src, srcSet }
    },
    [image, builder]
  )
}

function useDerivedSizes({ deriveSizes, naturalSize, displaySize }) {
  const deriveSizesRef = React.useRef(null)
  deriveSizesRef.current = deriveSizes

  return React.useMemo(
    () => deriveSizesRef.current({ naturalSize, displaySize }), 
    [naturalSize.width, naturalSize.height, displaySize.width, displaySize.height]
  )
}

function adjustImageWidth() {
  return (image, width) => image.width(width)
}

function adjustImageWidthAndCrop(aspectRatio) {
  return (image, width) => image.width(width).height(Math.round(width / aspectRatio)) 
}

function deriveSizes() {
  return ({ naturalSize, displaySize }) => ({
    width: naturalSize.width,
    height: naturalSize.height,
    size: Math.max(1, displaySize.width)
  })
}

function deriveSizesCropped(aspectRatio) {
  return ({ naturalSize, displaySize }) => ({
    width: naturalSize.width,
    height: naturalSize.width / aspectRatio,
    size: Math.max(1, displaySize.width)
  })
}

// deriveSizesCover can return a sizes value larger than the actual display 
// width in case the image is scaled up by object-fit
function deriveSizesCover(aspectRatio) {
  return ({ naturalSize, displaySize }) => {
    const size = (displaySize.width && displaySize.height) 
      ? Math.max(displaySize.height * aspectRatio, displaySize.width)
      : 0

    return {
      width: naturalSize.width,
      height: naturalSize.width / aspectRatio,
      size: Math.max(1, size)
    }
  }
}
