import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './Productcard.module.css'

const FALLBACK_IMG =
	'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'

function formatPrice(price) {
	return new Intl.NumberFormat('uz-UZ').format(price) + " so'm"
}

export default function ProductCard({ product, index = 0 }) {
	const discount = product.old_price
		? Math.round(
				((product.old_price - product.price) / product.old_price) * 100,
			)
		: null

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.5,
				delay: index * 0.05,
				ease: [0.4, 0, 0.2, 1],
			}}
		>
			<Link
				to={`/products/${product.id}`}
				className={`product-card ${styles.card}`}
			>
				{/* ── Image ── */}
				<div className={styles.imageWrapper}>
					<img
						src={product.image_url || FALLBACK_IMG}
						alt={product.name}
						className={`product-card-image ${styles.image}`}
						onError={e => {
							e.target.src = FALLBACK_IMG
						}}
					/>

					{/* Badges */}
					<div className={styles.badges}>
						{discount && (
							<span className={`badge ${styles.badgeDiscount}`}>
								-{discount}%
							</span>
						)}
						{product.featured && (
							<span className={`badge badge-accent ${styles.badgeFeatured}`}>
								✦ Featured
							</span>
						)}
					</div>

					{/* Out of stock overlay */}
					{product.stock === 0 && (
						<div className={styles.outOfStockOverlay}>
							<span className={styles.outOfStockLabel}>Tugagan</span>
						</div>
					)}
				</div>

				{/* ── Body ── */}
				<div className='product-card-body'>
					{product.category_name && (
						<span className={styles.category}>
							{product.category_icon} {product.category_name}
						</span>
					)}

					<h3 className={styles.name}>{product.name}</h3>

					<div className={styles.priceRow}>
						<span className={styles.price}>{formatPrice(product.price)}</span>
						{product.old_price && (
							<span className={styles.oldPrice}>
								{formatPrice(product.old_price)}
							</span>
						)}
					</div>

					{product.stock > 0 && product.stock < 10 && (
						<div className={styles.lowStock}>
							<span className={`badge badge-warning ${styles.lowStockBadge}`}>
								Faqat {product.stock} ta qoldi
							</span>
						</div>
					)}
				</div>
			</Link>
		</motion.div>
	)
}
