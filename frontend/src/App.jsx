import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import AboutPage from './pages/AboutPage/AboutPage'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import AdminLoginPage from './pages/AdminLogin/AdminLoginPage'
import ContactPage from './pages/ContactPage/ContactPage'
import HomePage from './pages/HomePage/HomePage'
import ProductDetailPage from './pages/ProductInfo/ProductDetailPage'
import ProductsPage from './pages/ProductsPage/ProductsPage'
import TMAApp from './tma/TMAApp'

const queryClient = new QueryClient({
	defaultOptions: { queries: { staleTime: 60000, retry: 1 } },
})

// Telegram Mini App wrapper — SDK ni yuklaydi
function TMAWrapper() {
	useEffect(() => {
		const script = document.createElement('script')
		script.src = 'https://telegram.org/js/telegram-web-app.js'
		script.async = true
		script.onload = () => {
			if (window.Telegram?.WebApp) {
				window.Telegram.WebApp.ready()
				window.Telegram.WebApp.expand()
			}
		}
		document.head.appendChild(script)
		document.body.classList.add('tma-mode')
		return () => document.body.classList.remove('tma-mode')
	}, [])
	return <TMAApp />
}

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<BrowserRouter>
					<Routes>
						{/* ── Telegram Mini App ── */}
						<Route path='/tma' element={<TMAWrapper />} />
						<Route path='/tma/*' element={<TMAWrapper />} />

						{/* ── Web sayt ── */}
						<Route path='/' element={<HomePage />} />
						<Route path='/products' element={<ProductsPage />} />
						<Route path='/products/:id' element={<ProductDetailPage />} />
						<Route path='/admin/login' element={<AdminLoginPage />} />
						<Route path='/about' element={<AboutPage />} />
						<Route path='/contact' element={<ContactPage />} />
						<Route
							path='/admin/*'
							element={
								<ProtectedRoute>
									<AdminDashboard />
								</ProtectedRoute>
							}
						/>
					</Routes>
					<Toaster
						position='top-right'
						toastOptions={{
							style: {
								background: '#1a1a2e',
								color: '#e2e8f0',
								border: '1px solid rgba(99,102,241,0.3)',
								borderRadius: '12px',
							},
						}}
					/>
				</BrowserRouter>
			</AuthProvider>
		</QueryClientProvider>
	)
}
