import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { WebsiteBrandingProvider } from '@/features/cms/WebsiteBrandingProvider'

export default function App() {
  return <WebsiteBrandingProvider><RouterProvider router={router} /></WebsiteBrandingProvider>
}
