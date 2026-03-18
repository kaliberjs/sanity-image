# `@kaliber/sanity-image`
An image component for Sanity, which manages resizing, cropping, srcSet and sizes (the attribute) for you.

## Motivation
Sanity provides a lot of options when it comes to image optimization and this component tries to be the one size fits all solution, making sure you don't have to think about these. It also manages `srcSet` and `sizes` for you by looking at the actual displayed size of the image. This fits much better within a component driven model, where you never know in advance where your component is going to be used (and which `sizes` value you should therefore use).

Even though the components work without a `sizes` prop, they *do* accept one. This allows the image to be displayed immediately, without your javascript bundle being parsed. Useful for images that are displayed above the fold, to reduce your LCP time. Think: hero images. 

## Installation

```
yarn add @kaliber/use-element-size @kaliber/sanity-image @sanity/image-url
```

Add the following to your `includeInServerCompilation` array in your kaliber build config:

```js
kaliber: {
  includeInServerCompilation: [
    /^@kaliber\/sanity-image/,
    /^@kaliber\/use-element-size/,
    /^@kaliber\/use-observed-ref/,
  ]
}
```

## Usage
### Data requirements
The components are meant to be used with the Sanity `image` type.

### Components
This library exports three components, `Image`, `ImageCropped` and `ImageCover`, each with slightly different usecases.

- Use `Image` when you want to use an image as is, no cropping, no `object-fit: cover`.
- Use `ImageCropped` when you want to use a cropped image. The crop is determined by the `aspectRatio` you provide (this respects the hotspot, when configured in Sanity).
- Use `ImageCover` when you need an image that covers a size defined in CSS, but this size doesn't have a fixed aspect ratio. This component compensates for upscaling due to using `object-fit: cover`.

All images accept a `sizes` prop. If this is given, any calculated size is ignored.

#### `Image`
```jsx
import { Image } from '@kaliber/sanity-image'

function Component({ image }) {
  const { sanity } = useConfig()

  return (
    <Image
      sanityConfig={sanity.client}
      imgProps={{ alt: 'Alt text' }}
      {...{ image }} 
    />
  )
}
```

#### `ImageCropped`
Don't use this component if your `aspectRatio` is dynamic, since it will regenerate the images when an unknown `aspectRatio` is used. In this case, use `ImageCover` instead.
```jsx
import { ImageCropped } from '@kaliber/sanity-image'

function Component({ image }) {
  const { sanity } = useConfig()

  return (
    <ImageCropped
      sanityConfig={sanity.client}
      aspectRatio={16/9}
      imgProps={{ loading: 'lazy' }} 
      {...{ image }} 
    />
  )
}
```

#### `ImageCover`
Try to use an `aspectRatio` that's close to the dynamic aspect ratio of your image. This way, you will download the smallest image needed.

```jsx
import { ImageCover } from '@kaliber/sanity-image'

function Component({ image }) {
  const { sanity } = useConfig()

  return (
    <ImageCover
      sanityConfig={sanity.client}
      aspectRatio={16/9}
      imgProps={{ loading: 'lazy' }} 
      {...{ image }} 
    />
  )
}
```

### LQIP (Low-Quality Image Placeholder)
All components accept an optional `lqip` prop. When provided, the base64 data URI is rendered as an inline CSS background on the `<img>` element. This means the placeholder is visible **immediately** on first paint — no network request needed.

When the real image loads, it naturally covers the placeholder.

Query the LQIP data URI from Sanity using GROQ:
```groq
*[_type == "page"] {
  image {
    ...,
    asset-> { metadata { lqip } }
  }
}
```

Usage:
```jsx
import { Image } from '@kaliber/sanity-image'

function Component({ image }) {
  const { sanity } = useConfig()

  return (
    <Image
      sanityConfig={sanity.client}
      lqip={image.asset.metadata.lqip}
      imgProps={{ alt: 'Alt text' }}
      {...{ image }}
    />
  )
}
```

---

![](https://media.giphy.com/media/3orif0QmO69dQkpbl6/giphy.gif)

## Disclaimer
This library is intended for internal use, we provide __no__ support, use at your own risk. It does not import React, but expects it to be provided, which [@kaliber/build](https://kaliberjs.github.io/build/) can handle for you.

This library is not transpiled.
