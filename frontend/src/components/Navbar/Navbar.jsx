import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

const NAV_LINKS = [
	{ to: '/', label: 'Bosh sahifa' },
	{ to: '/products', label: 'Mahsulotlar' },
	{ to: '/contact', label: "Bog'lanish" },
]

export default function Navbar() {
	const [scrolled, setScrolled] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)
	const location = useLocation()

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20)
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => window.removeEventListener('scroll', onScroll)
	}, [])

	// Close mobile menu on route change
	useEffect(() => setMenuOpen(false), [location])

	return (
		<motion.nav
			initial={{ y: -80, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
			className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}
			aria-label='Main navigation'
		>
			{/* Brand */}
			<Link to='/' className={styles.brandLink}>
				<motion.div whileHover={{ scale: 1.02 }} className={styles.brand}>
					<div className={styles.brandIcon}>✦</div>
					<span className={styles.brandName}>Mini-Market</span>
				</motion.div>
			</Link>

			{/* Desktop Nav */}
			<div className={styles.desktopNav}>
				{NAV_LINKS.map(link => (
					<Link key={link.to} to={link.to} className={styles.navLinkWrapper}>
						<motion.div
							whileHover={{ scale: 1.02 }}
							className={`${styles.navLink} ${location.pathname === link.to ? styles.navLinkActive : ''}`}
						>
							{link.label}
						</motion.div>
					</Link>
				))}

				<Link
					to='/admin/login'
					className={`btn btn-primary ${styles.adminBtn}`}
				>
					Admin panel →
				</Link>
			</div>

			{/* Mobile Hamburger */}
			<button
				onClick={() => setMenuOpen(o => !o)}
				className={`btn btn-ghost ${styles.hamburger}`}
				aria-label={menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
				aria-expanded={menuOpen}
			>
				{menuOpen ? '✕' : '☰'}
			</button>

			{/* Mobile Menu */}
			<AnimatePresence>
				{menuOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className={styles.mobileMenu}
					>
						{NAV_LINKS.map(link => (
							<Link
								key={link.to}
								to={link.to}
								className={`${styles.mobileLink} ${location.pathname === link.to ? styles.mobileLinkActive : ''}`}
							>
								{link.label}
							</Link>
						))}
						<Link
							to='/admin/login'
							className={`btn btn-primary ${styles.mobileAdminBtn}`}
						>
							Admin panel →
						</Link>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.nav>
	)
}
