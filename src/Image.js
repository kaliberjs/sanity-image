import { useElementSize } from '@kaliber/use-element-size'
import imageUrlBuilder from '@sanity/image-url'

const SIZES = [320, 480, 720, 1024, 1440, 1920, 2760, 3600]

export function Image({ image, layoutClassName = undefined, imgProps = {} }) {
  const { ref: sizeRef, size: { width = 0 } } = useElementSize()
  const { src, srcSet } = useSrcSet({ image })

  return (
    <img
      {...imgProps}
      ref={sizeRef}
      className={layoutClassName}
      sizes={Math.max(1, width) + 'px'}
      alt={image.alt}
      width={image.asset.metadata.dimensions.width}
      height={image.asset.metadata.dimensions.height}
      {...{ src, srcSet }}
    />
  )
}

export function ImageFixedAspectRatio({ image, aspectRatio, layoutClassName = undefined, imgProps = {} }) {
  const { ref: sizeRef, size: { width = 0 } } = useElementSize()
  const { src, srcSet } = useSrcSet({ image, aspectRatio })

  return (
    <img
      {...imgProps}
      ref={sizeRef}
      className={layoutClassName}
      sizes={Math.max(1, width) + 'px'}
      alt={image.alt}
      width={100}
      height={100 / aspectRatio}
      {...{ src, srcSet }}
    />
  )
}

export function ImageCover({ image, layoutClassName = undefined, imgProps = {} }) {
  const { ref: sizeRef, size: { width = 0, height = 0 } } = useElementSize()
  const { src, srcSet } = useSrcSet({ image, aspectRatio })

  const dimensions = image.asset.metadata.dimensions
  const actualWidth = (width && height) 
    ? Math.max(height / dimensions.height * dimensions.width, width)
    : 0

  return (
    <animated.img
      {...imgProps}
      ref={sizeRef}
      className={layoutClassName}
      sizes={Math.max(1, actualWidth) + 'px'}
      alt={image.alt}
      width={dimensions.width}
      height={dimensions.height}
      style={{
        objectFit: 'cover',
        ...image.hotspot && { objectPosition: `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%` }
      }}
      {...{ src, srcSet }}
    />
  )
}

function useSrcSet({ config, image, aspectRatio = undefined }) {
  const builder = imageUrlBuilder(config)

  return React.useMemo(
    () => {
      const thumb = 
        image.asset.metadata.lqip ??
        builder.image(image).width(20).quality(0).blur(20).auto('format').url()

      const srcSet = aspectRatio
        ? SIZES.map(x => `${builder.image(image).width(x).height(Math.round(x / aspectRatio)).quality(75).auto('format').url()} ${x}w`).join(', ')
        : SIZES.map(x => `${builder.image(image).width(x).quality(75).auto('format').url()} ${x}w`).join(', ')

      const [src] = srcSet.slice(-1)

      return { thumb, src, srcSet }
    },
    [image, aspectRatio, builder]
  )
}
