import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import "./components/header/header.css"
import "./components/footer/footer.css"
import { BrowserRouter } from 'react-router-dom'

import { alternateSiteTitle, siteTitle } from './helpers/constants'

// function to change title when focusing on tab
const setTitle = (title) => document.title = title
window.onblur = () => setTitle(alternateSiteTitle);
window.onfocus = () => setTitle(siteTitle);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
