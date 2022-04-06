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

      <AppSection title='Inline image'>
        <div className={styles.layout}>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Assumenda, quod?
          <Image sanityConfig={config.sanity} {...{ image }} layoutClassName={styles.imageSmall} imgProps={{ className: styles.imageInline }} />
          Laboriosam molestias eveniet recusandae nostrum aperiam maxime aliquid maiores vero eos amet dolorem eius eligendi excepturi, voluptatem sint illum distinctio?
        </div>
      </AppSection>  
      
      <AppSection title='Image with sizes attribute'>
        <ImageCropped sanityConfig={config.sanity} aspectRatio={2 / 1} sizes='(min-width: 760px) 720px, calc(100vw - 40px)' {...{ image }} />
      </AppSection>  

      <AppSection title='Cropped image (16/9)'>
        <ImageCropped sanityConfig={config.sanity} aspectRatio={16 / 9} {...{ image }} />
      </AppSection>  

      <AppSection title='Cropped image (1/1)'>
        <div className={styles.layout}>
          <ImageCropped sanityConfig={config.sanity} aspectRatio={1 / 1} {...{ image }} layoutClassName={styles.imageCropped1To1} />
        </div>
      </AppSection>  

      <AppSection title='Cropped image (1/2)'>
        <div className={styles.layout}>
          <ImageCropped sanityConfig={config.sanity} aspectRatio={1 / 2} {...{ image }} layoutClassName={styles.imageCropped1To2} />
        </div>
      </AppSection>  

      <AppSection title='Image with object-fit'>
        <div className={styles.layout}>
          <ImageCover sanityConfig={config.sanity} aspectRatio={16 / 9} {...{ image }} layoutClassName={styles.imageCover} />
        </div>
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