import { image } from '/aSanityImage'
import { Image, ImageCropped, ImageCover } from '@kaliber/sanity-image'
import styles from './App.css'

export default function App({ config }) {
  return (
    <main>
      <h1><code>@kaliber/sanity-image</code></h1>

      <AppSection title='Regular image'>
        <Image sanityConfig={config.sanity} {...{ image }} />
      </AppSection>  

      <AppSection title='Cropped image (16/9)'>
        <ImageCropped sanityConfig={config.sanity} aspectRatio={16/9} {...{ image }} />
      </AppSection>  

      <AppSection title='Cropped image (1/1)'>
        <ImageCropped sanityConfig={config.sanity} aspectRatio={1/1} {...{ image }} layoutClassName={styles.imageCropped1To1} />
      </AppSection>  

      <AppSection title='Cropped image (1/2)'>
        <ImageCropped sanityConfig={config.sanity} aspectRatio={1/2} {...{ image }} layoutClassName={styles.imageCropped1To2} />
      </AppSection>  

      <AppSection title='Image with object-fit'>
        <ImageCover sanityConfig={config.sanity} aspectRatio={16/9} {...{ image }} layoutClassName={styles.imageCover} />
      </AppSection>  
    </main>
  )
}

function AppSection({ title, children }) {
  return (
    <section className={styles.componentSection}>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  )
}