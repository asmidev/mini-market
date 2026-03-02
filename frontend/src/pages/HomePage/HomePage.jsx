import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Footer from '../../components/Footer/Footer'
import Navbar from '../../components/Navbar/Navbar'
import styles from './HomePage.module.css'
import EcommercePhone from './iphone'

const FLOAT_VARIANTS = {
	animate: {
		y: [0, -20, 0],
		transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
	},
}

const FADE_UP = (delay = 0) => ({
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.5, delay },
})

const FADE_UP_VIEWPORT = {
	initial: { opacity: 0, y: 20 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true },
	transition: { duration: 0.5 },
}

const STATS = [
	{ value: '2 400+', label: 'Foydalanuvchi' },
	{ value: '18 000+', label: 'Mahsulot' },
	{ value: '99.9%', label: 'Ishonchlilik' },
]

export default function HomePage() {
	const { data: featuredData } = useQuery({
		queryKey: ['products', 'featured'],
		queryFn: () =>
			axios.get('/api/products?featured=true&limit=8').then(r => r.data),
	})

	const { data: categoriesData } = useQuery({
		queryKey: ['categories'],
		queryFn: () => axios.get('/api/categories').then(r => r.data),
	})

	const products = featuredData?.products ?? []
	const categories = categoriesData ?? []

	return (
		<div className={styles.page}>
			<Navbar />

			{/* ───── Hero ───── */}
			<section className={styles.hero}>
				<div className={styles.heroOrbLeft} aria-hidden />
				<div className={styles.heroOrbRight} aria-hidden />

				<motion.div
					variants={FLOAT_VARIANTS}
					animate='animate'
					className={styles.floatingSquare}
					aria-hidden
				/>
				<motion.div
					variants={FLOAT_VARIANTS}
					animate='animate'
					className={styles.floatingCircle}
					style={{ transition: { delay: 2 } }}
					aria-hidden
				/>

				{/* ── Left: text ── */}
				<div className={styles.heroContent}>
					<motion.div {...FADE_UP(0)}>
						<span className={styles.heroBadge}>
							✦ Kichik biznes uchun platforma
						</span>
					</motion.div>

					<motion.h1 className={styles.heroTitle} {...FADE_UP(0.1)}>
						Mahsulotlaringizni dunyoga taqdim eting
					</motion.h1>

					<motion.p className={styles.heroSubtitle} {...FADE_UP(0.2)}>
						Biznesingizni onlayn olib boring. Mahsulotlaringizni bir joyda
						boshqaring va mijozlaringizga ko'rsating.
					</motion.p>

					<motion.div className={styles.heroCta} {...FADE_UP(0.3)}>
						<Link to='/products' className={`btn btn-primary ${styles.ctaBtn}`}>
							Mahsulotlarni ko'rish →
						</Link>
						<Link
							to='/products?category=all'
							className={`btn btn-outline ${styles.ctaBtn}`}
						>
							Kategoriyalar
						</Link>
					</motion.div>

					<motion.div className={styles.heroStats} {...FADE_UP(0.45)}>
						{STATS.map(s => (
							<div key={s.label} className={styles.heroStat}>
								<span className={styles.heroStatValue}>{s.value}</span>
								<span className={styles.heroStatLabel}>{s.label}</span>
							</div>
						))}
					</motion.div>
				</div>

				{/* ── Right: phone ── */}
				<motion.div
					className={styles.heroPhone}
					initial={{ opacity: 0, x: 40 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
				>
					<EcommercePhone />
				</motion.div>
			</section>

			{/* ───── Footer ───── */}
			<footer>
				<Footer />
			</footer>
		</div>
	)
}
