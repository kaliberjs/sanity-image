import { useElementSize } from '@kaliber/use-element-size'
import imageUrlBuilder from '@sanity/image-url'

const SIZES = [320, 480, 720, 1024, 1440, 1920, 2760, 3600]

export function Image({ sanityConfig, image, layoutClassName = undefined, imgProps = {} }) {
  const { ref: sizeRef, size: { width = 0 } } = useElementSize()
  const { src, srcSet } = useSrcSet({ config: sanityConfig, image })

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

export function ImageFixedAspectRatio({ sanityConfig, image, aspectRatio, layoutClassName = undefined, imgProps = {} }) {
  const { ref: sizeRef, size: { width = 0 } } = useElementSize()
  const { src, srcSet } = useSrcSet({ config: sanityConfig, image, aspectRatio })

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

export function ImageCover({ sanityConfig, image, layoutClassName = undefined, imgProps = {} }) {
  const { ref: sizeRef, size: { width = 0, height = 0 } } = useElementSize()
  const { src, srcSet } = useSrcSet({ config: sanityConfig, image })

  const dimensions = image.asset.metadata.dimensions
  const actualWidth = (width && height) 
    ? Math.max(height / dimensions.height * dimensions.width, width)
    : 0

  return (
    <img
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
      const thumb = {
        src: (
          image.asset.metadata.lqip ??
          builder.image(image).width(20).quality(0).blur(20).auto('format').url()
        ),
        width: 1
      }

      const sources = aspectRatio
        ? SIZES.map(x => ({ src: builder.image(image).width(x).height(Math.round(x / aspectRatio)).quality(75).auto('format').url(), width: x }))
        : SIZES.map(x => ({ src: builder.image(image).width(x).quality(75).auto('format').url(), width: x }))

      const src = sources.slice(-1)[0].src
      const srcSet = [thumb, ...sources].map(x => `${x.src} ${x.width}w`).join(',')


      return { src, srcSet }
    },
    [image, aspectRatio, builder]
  )
}
