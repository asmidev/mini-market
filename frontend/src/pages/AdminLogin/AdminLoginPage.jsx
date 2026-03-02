import { motion } from 'framer-motion'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Adminloginpage.module.css'

export default function AdminLoginPage() {
	const { login, isAuthenticated } = useAuth()
	const navigate = useNavigate()
	const [form, setForm] = useState({ username: '', password: '' })
	const [loading, setLoading] = useState(false)

	if (isAuthenticated) return <Navigate to='/admin' replace />

	const patch = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

	const handleSubmit = async e => {
		e.preventDefault()
		if (!form.username || !form.password)
			return toast.error("Barcha maydonlarni to'ldiring")
		setLoading(true)
		try {
			await login(form.username, form.password)
			toast.success('Xush kelibsiz!')
			navigate('/admin')
		} catch (err) {
			toast.error(err.response?.data?.error || "Login yoki parol noto'g'ri")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className={styles.page}>
			<div className={styles.bgGlow} aria-hidden />

			<motion.div
				initial={{ opacity: 0, y: 30, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.5 }}
				className={styles.wrapper}
			>
				<div className={`glass ${styles.card}`}>
					{/* Logo */}
					<div className={styles.logoSection}>
						<div className={styles.logoIcon}>⚙️</div>
						<h1 className={styles.title}>Admin Panel</h1>
						<p className={styles.subtitle}>Boshqaruv paneli</p>
					</div>
					{/* Form */}
					<form onSubmit={handleSubmit} className={styles.form}>
						<div className={styles.field}>
							<label className={styles.label}>Login</label>
							<input
								type='text'
								placeholder='admin'
								value={form.username}
								onChange={patch('username')}
								autoComplete='username'
							/>
						</div>

						<div className={styles.field}>
							<label className={styles.label}>Parol</label>
							<input
								type='password'
								placeholder='••••••••'
								value={form.password}
								onChange={patch('password')}
								autoComplete='current-password'
							/>
						</div>

						<motion.button
							type='submit'
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.97 }}
							className={`btn btn-primary ${styles.submitBtn}`}
							disabled={loading}
						>
							{loading ? (
								<span className={styles.loadingState}>
									<span className='spinner' />
									Kirish...
								</span>
							) : (
								'Kirish →'
							)}
						</motion.button>
						<Link to={'/'} className={styles.mainPage}>
							Bosh Sahifa →
						</Link>
					</form>
				</div>
			</motion.div>
		</div>
	)
}
