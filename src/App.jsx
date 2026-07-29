import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar.jsx'
import ScrollManager from './components/ScrollManager.jsx'
import PageTransition from './motion/PageTransition.jsx'

import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Protocol from './pages/Protocol.jsx'
import Markets from './pages/Markets.jsx'
import Competitive from './pages/Competitive.jsx'
import Invest from './pages/Invest.jsx'
import Consultation from './pages/Consultation.jsx'
import ConsultingProducts from './pages/ConsultingProducts.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'

const PAGES = [
  { path: '/', el: <Home /> },
  { path: '/about', el: <About /> },
  { path: '/protocol', el: <Protocol /> },
  { path: '/markets', el: <Markets /> },
  { path: '/competitive', el: <Competitive /> },
  { path: '/invest', el: <Invest /> },
  { path: '/consultation', el: <Consultation /> },
  { path: '/consultation/products', el: <ConsultingProducts /> },
  { path: '/privacy', el: <Privacy /> },
  { path: '/terms', el: <Terms /> },
]

// Old static URLs (about.html, …) redirect to their clean route so
// bookmarks and external links keep working.
const HTML_REDIRECTS = PAGES.map(({ path }) => ({
  from: path === '/' ? '/index.html' : `${path}.html`,
  to: path,
}))

export default function App() {
  const location = useLocation()

  return (
    <>
      <ScrollManager />
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {PAGES.map(({ path, el }) => (
            <Route key={path} path={path} element={<PageTransition>{el}</PageTransition>} />
          ))}
          {HTML_REDIRECTS.map(({ from, to }) => (
            // Object `to` keeps the incoming search/hash, so legacy anchor
            // bookmarks like /markets.html#market-retail still hit the section.
            <Route
              key={from}
              path={from}
              element={<Navigate to={{ pathname: to, search: location.search, hash: location.hash }} replace />}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
