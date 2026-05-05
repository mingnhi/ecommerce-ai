import './App.css'
import { RouterProvider } from 'react-router-dom'
import { AppProvider } from './app/providers'
import { router } from './app/router'

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export default App
