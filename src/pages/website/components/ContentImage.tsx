import { useState } from 'react'
import carePhoto from '@/assets/elder-care.webp'
import { contentImages } from './contentImages'
import './ContentMotion.css'

export function ContentImage({ name, className = '', src, alt }: { name: string; className?: string; src?: string | null; alt?: string }) {
  const image = contentImages[name]
  const [failed, setFailed] = useState(false)
  return <div className={'content-photo ' + className}>
    <img src={!failed && (src || image?.src) ? src || image?.src : carePhoto}
      alt={!failed && src ? alt || name : !failed && image?.src ? image.alt : 'A caregiver spending time with an older person'}
      loading="lazy" decoding="async" width={800} height={600}
      onError={() => setFailed(true)} />
  </div>
}
