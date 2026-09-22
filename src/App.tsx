import { RouterProvider } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { router } from './routes'

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <RouterProvider router={router} />
      </WorkspaceProvider>
    </AuthProvider>
  )
}
