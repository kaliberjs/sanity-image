import { useElementSize } from '@kaliber/use-element-size'
import { createImageUrlBuilder } from '@sanity/image-url'
/** @import { SanityImageObject, SanityAsset, ImageUrlBuilder } from '@sanity/image-url' */
/** @import { CSSProperties } from 'react' */

/** @typedef {Parameters<typeof createImageUrlBuilder>[0]} SanityConfig */
/** @typedef {(sizes: { naturalSize: Area, displaySize: Area }) => (Area & { size: number })} DeriveSizes */
/** @typedef {{ width: number, height: number }} Area */

const exampleAssetRef = 'image-3b90af5f4677efbc62374dcfda799040b699b4c5-4928x3280-jpg'
const SIZES = [320, 480, 720, 1024, 1440, 1920, 2400, 3000, 3600]

/**
 * @arg {{
 *   sanityConfig: SanityConfig,
 *   image: SanityImageObject,
 *   sizes?: string,
 *   layoutClassName?: string,
 *   imgProps?: React.ImgHTMLAttributes<HTMLImageElement>,
 * }} props
 */
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
      adjustImage={useAdjustImageWidth()}
      deriveSizes={useDeriveSizes()}
    />
  )
}

/**
 * @arg {{
 *   sanityConfig: SanityConfig,
 *   image: SanityImageObject,
 *   aspectRatio: number,
 *   sizes?: string,
 *   layoutClassName?: string,
 *   imgProps?: React.ImgHTMLAttributes<HTMLImageElement>,
 * }} props
 */
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
      adjustImage={useAdjustImageWidthAndCrop(aspectRatio)}
      deriveSizes={useDeriveSizesCropped(aspectRatio)}
    />
  )
}

/**
 * @arg {{
 *   sanityConfig: SanityConfig,
 *   image: SanityImageObject,
 *   aspectRatio: number,
 *   sizes?: string,
 *   layoutClassName?: string,
 *   imgProps?: React.ImgHTMLAttributes<HTMLImageElement>,
 * }} props
 */
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
      adjustImage={useAdjustImageWidthAndCrop(aspectRatio)}
      deriveSizes={useDeriveSizesCover(aspectRatio)}
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

/**
 * @arg {{
 *   sanityConfig: SanityConfig,
 *   image: SanityImageObject,
 *   adjustImage(baseImage: ImageUrlBuilder, width: number): ImageUrlBuilder,
 *   deriveSizes: DeriveSizes,
 *   sizes?: string,
 *   style?: CSSProperties,
 *   imgProps?: React.ImgHTMLAttributes<HTMLImageElement>,
 *   layoutClassName?: string,
 * }} props
 */
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
  const dimensions = parseDimensionsFromAssetRef(image.asset._ref ?? /** @type {SanityAsset} */ (image.asset)._id)
  const { ref: sizeRef, size: displaySize } = useElementSize()
  const { src, srcSet, thumb } = useSrcSet({
    config: sanityConfig,
    image,
    adjustImage,
    width: dimensions.width
  })
  const { width, height, size } = useDerivedSizes({
    deriveSizes,
    displaySize,
    naturalSize: dimensions
  })

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      {...imgProps}
      ref={sizeRef}
      sizes={sizes || `${size}px`}
      srcSet={(sizes || size > 1) ? srcSet : thumb}
      {...{ className, src, width, height, style }}
    />
  )
}

/**
 * @arg {{
 *   config: SanityConfig,
 *   image: SanityImageObject,
 *   adjustImage(baseImage: ImageUrlBuilder, width: number): ImageUrlBuilder,
 *   width: number,
 * }} props
 */
function useSrcSet({ config, image, adjustImage, width }) {
  const builder = React.useMemo(() => createImageUrlBuilder(config), [config])

  return React.useMemo(
    () => {
      const [maxSize] = SIZES.slice(-1)
      const sizes = SIZES.slice(0, -1)
        .filter(w => w < width)
        .concat(Math.min(width, maxSize))

      const thumb = {
        src: adjustImage(builder.image(image).quality(0).blur(20).auto('format'), 20).url(),
        width: 1
      }

      const baseImage = builder.image(image).quality(80).auto('format')
      const sources = sizes.map(width => ({ src: adjustImage(baseImage, width).url(), width }))

      const src = sources.slice(-1)[0].src
      const srcSet = [thumb, ...sources].map(x => `${x.src} ${x.width}w`).join(',')


      return { src, srcSet, thumb: `${thumb.src} 1w` }
    },
    [image, width, builder, adjustImage]
  )
}

/**
 * @arg {{
 *   deriveSizes: DeriveSizes,
 *   naturalSize: Area,
 *   displaySize: Area,
 * }} props
 */
function useDerivedSizes({ deriveSizes, naturalSize, displaySize }) {
  return React.useMemo(
    () => deriveSizes({
      naturalSize: { width: naturalSize.width, height: naturalSize.height },
      displaySize: { width: displaySize.width, height: displaySize.height }
    }),
    [naturalSize.width, naturalSize.height, displaySize.width, displaySize.height, deriveSizes]
  )
}

function useAdjustImageWidth() {
  return React.useCallback(
    /**
     * @arg {ImageUrlBuilder} image
     * @arg {number} width
     */
    (image, width) => image.width(width),
    []
  )
}

/** @arg {number} aspectRatio */
function useAdjustImageWidthAndCrop(aspectRatio) {
  return React.useCallback(
    /**
     * @arg {ImageUrlBuilder} image
     * @arg {number} width
     */
    (image, width) => image.width(width).height(Math.round(width / aspectRatio)),
    [aspectRatio]
  )
}

function useDeriveSizes() {
  return React.useCallback(
    /** @arg {{ naturalSize: Area, displaySize: Area }} props */
    ({ naturalSize, displaySize }) => ({
      width: naturalSize.width,
      height: naturalSize.height,
      size: Math.max(1, displaySize.width)
    }),
    []
  )
}

/** @arg {number} aspectRatio */
function useDeriveSizesCropped(aspectRatio) {
  return React.useCallback(
    /** @arg {{ naturalSize: Area, displaySize: Area }} props */
    ({ naturalSize, displaySize }) => ({
      width: naturalSize.width,
      height: naturalSize.width / aspectRatio,
      size: Math.max(1, displaySize.width)
    }),
    [aspectRatio]
  )
}

/**
 * deriveSizesCover can return a sizes value larger than the actual display
 * width in case the image is scaled up by object-fit
 *
 * @arg {number} aspectRatio
 */
function useDeriveSizesCover(aspectRatio) {
  return React.useCallback(
    /** @arg {{ naturalSize: Area, displaySize: Area }} props */
    ({ naturalSize, displaySize }) => {
      const size = (displaySize.width && displaySize.height)
        ? Math.max(displaySize.height * aspectRatio, displaySize.width)
        : 0

      return {
        width: naturalSize.width,
        height: naturalSize.width / aspectRatio,
        size: Math.max(1, size)
      }
    },
    [aspectRatio]
  )
}

/** @arg {string} ref */
function parseDimensionsFromAssetRef(ref) {
  const [, id, dimensionString, format] = ref.split('-')

  if (!id || !dimensionString || !format) throw malformedAssetRefError(ref)

  const [imgWidthStr, imgHeightStr] = dimensionString.split('x')
  const width = +imgWidthStr
  const height = +imgHeightStr

  if (!(isFinite(width) && isFinite(height))) throw malformedAssetRefError(ref)

  return { width, height }
}

/** @arg {string} ref */
function malformedAssetRefError(ref) {
  return new Error(`Malformed asset _ref ${ref}. Expected an id like ${exampleAssetRef}.`)
}
