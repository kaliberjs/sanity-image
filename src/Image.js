import { useElementSize } from '@kaliber/use-element-size'
import imageUrlBuilder from '@sanity/image-url'

const exampleAssetRef = 'image-3b90af5f4677efbc62374dcfda799040b699b4c5-4928x3280-jpg'
const SIZES = [320, 480, 720, 1024, 1440, 1920, 2400, 3000, 3600]

export function Image({
  sanityConfig,
  image,
  sizes = undefined,
  layoutClassName = undefined,
  imgProps = {}
}) {
  return (
    <ImageBase
      {...{ sanityConfig, image, sizes, layoutClassName, imgProps }}
      adjustImage={adjustImageWidth()}
      deriveSizes={deriveSizes()}
    />
  )
}

export function ImageCropped({
  sanityConfig,
  image,
  aspectRatio,
  sizes = undefined,
  layoutClassName = undefined,
  imgProps = {}
}) {
  return (
    <ImageBase
      {...imgProps}
      {...{ sanityConfig, image, sizes, layoutClassName, imgProps }}
      adjustImage={adjustImageWidthAndCrop(aspectRatio)}
      deriveSizes={deriveSizesCropped(aspectRatio)}
    />
  )
}

export function ImageCover({
  sanityConfig,
  image,
  aspectRatio,
  sizes = undefined,
  layoutClassName = undefined,
  imgProps = {}
}) {
  return (
    <ImageBase
      {...{ sanityConfig, image, sizes, layoutClassName, imgProps }}
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
  sizes = undefined,
  style = {},
  imgProps = {},
  layoutClassName = undefined
}) {
  const className = [imgProps.className, layoutClassName].filter(Boolean).join(' ')
  const { ref: sizeRef, size: displaySize } = useElementSize()
  const { src, srcSet } = useSrcSet({ config: sanityConfig, image, adjustImage })
  const { width, height, size } = useDerivedSizes({
    deriveSizes,
    displaySize,
    naturalSize: parseDimensionsFromAssetRef(image.asset._ref ?? image.asset._id)
  })

  return (
    <img
      {...imgProps}
      ref={sizeRef}
      sizes={sizes || `${size}px`}
      {...{ className, src, srcSet, width, height, style }}
    />
  )
}

function useSrcSet({ config, image, adjustImage }) {
  const builder = imageUrlBuilder(config)
  const adjustImageRef = React.useRef(null)
  adjustImageRef.current = adjustImage

  return React.useMemo(
    () => {
      const dimensions = parseDimensionsFromAssetRef(image.asset._ref ?? image.asset._id)
      const [maxSize] = SIZES.slice(-1)
      const sizes = SIZES.slice(0, -1)
        .filter(w => w < dimensions.width)
        .concat(Math.min(dimensions.width, maxSize))

      const thumb = {
        src: adjustImageRef.current(builder.image(image).quality(0).blur(20).auto('format'), 20).url(),
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

function parseDimensionsFromAssetRef(ref) {
  const [, id, dimensionString, format] = ref.split('-')

  if (!id || !dimensionString || !format) throw malformedAssetRefError(ref)

  const [imgWidthStr, imgHeightStr] = dimensionString.split('x')
  const width = +imgWidthStr
  const height = +imgHeightStr

  if (!(isFinite(width) && isFinite(height))) throw malformedAssetRefError(ref)

  return { width, height }
}

function malformedAssetRefError(ref) {
  return new Error(`Malformed asset _ref ${ref}. Expected an id like ${exampleAssetRef}.`)
}
