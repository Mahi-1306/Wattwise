import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css';


import App from './App.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
{/* <AuthProvider>
     <App/>
</AuthProvider> */}
{/* <AdminDashboard/> */}
   <App/>  
  </StrictMode>,
)
