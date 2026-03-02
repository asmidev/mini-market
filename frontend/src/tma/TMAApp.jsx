import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './TMAApp.module.css'
import TMABottomNav from './TMABottomNav'
import './tma.css'
import { useTelegram } from './useTelegram'

const API = process.env.REACT_APP_API_URL || ''
const FALLBACK_IMG =
	'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'

function formatPrice(p) {
	return new Intl.NumberFormat('uz-UZ').format(p) + " so'm"
}

const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	transition: { delay },
})

function getImages(product) {
	// Array bo'lsa va ichida URL lar bor bo'lsa
	if (Array.isArray(product.images) && product.images.length > 0) {
		const valid = product.images.filter(
			url => url && typeof url === 'string' && url.startsWith('http'),
		)
		if (valid.length > 0) return valid
	}

	// String holida kelsa
	if (typeof product.images === 'string' && product.images.length > 2) {
		try {
			const parsed = JSON.parse(product.images)
			if (Array.isArray(parsed) && parsed.length > 0) return parsed
		} catch {
			const cleaned = product.images.replace(/^{|}$/g, '')
			const arr = cleaned
				.split(',')
				.map(s => s.replace(/^"|"$/g, '').trim())
				.filter(Boolean)
			if (arr.length > 0) return arr
		}
	}

	if (product.image_url) return [product.image_url]
	return [FALLBACK_IMG]
}

function ImageGallery({ images, discount }) {
	const [active, setActive] = useState(0)
	const touchStart = useRef(null)

	const handleTouchStart = e => {
		touchStart.current = e.touches[0].clientX
	}
	const handleTouchEnd = e => {
		if (touchStart.current === null) return
		const diff = touchStart.current - e.changedTouches[0].clientX
		if (diff > 40 && active < images.length - 1) setActive(a => a + 1)
		if (diff < -40 && active > 0) setActive(a => a - 1)
		touchStart.current = null
	}

	return (
		<div className={styles.gallery}>
			<div
				className={styles.galleryMain}
				onTouchStart={handleTouchStart}
				onTouchEnd={handleTouchEnd}
			>
				<AnimatePresence mode='wait'>
					<motion.img
						key={active}
						src={images[active]}
						alt={`rasm ${active + 1}`}
						className={styles.galleryMainImg}
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -30 }}
						transition={{ duration: 0.2 }}
						onError={e => {
							e.target.src = FALLBACK_IMG
						}}
					/>
				</AnimatePresence>
				{discount && (
					<div className={styles.sheetDiscountBadge}>-{discount}%</div>
				)}
				{images.length > 1 && (
					<div className={styles.galleryDots}>
						{images.map((_, i) => (
							<button
								key={i}
								className={`${styles.galleryDot} ${i === active ? styles.galleryDotActive : ''}`}
								onClick={() => setActive(i)}
							/>
						))}
					</div>
				)}
				{images.length > 1 && active > 0 && (
					<button
						className={`${styles.galleryArrow} ${styles.galleryArrowLeft}`}
						onClick={() => setActive(a => a - 1)}
					>
						‹
					</button>
				)}
				{images.length > 1 && active < images.length - 1 && (
					<button
						className={`${styles.galleryArrow} ${styles.galleryArrowRight}`}
						onClick={() => setActive(a => a + 1)}
					>
						›
					</button>
				)}
			</div>
			{images.length > 1 && (
				<div className={styles.galleryThumbs}>
					{images.map((img, i) => (
						<motion.div
							key={i}
							whileTap={{ scale: 0.93 }}
							onClick={() => setActive(i)}
							className={`${styles.galleryThumb} ${i === active ? styles.galleryThumbActive : ''}`}
						>
							<img
								src={img}
								alt={`thumb ${i + 1}`}
								className={styles.galleryThumbImg}
								onError={e => {
									e.target.src = FALLBACK_IMG
								}}
							/>
						</motion.div>
					))}
				</div>
			)}
		</div>
	)
}

function TMAProductCard({ product, onPress }) {
	console.log('product.images:', product.images, typeof product.images)
	const { haptic } = useTelegram()
	const discount = product.old_price
		? Math.round(
				((product.old_price - product.price) / product.old_price) * 100,
			)
		: null
	const images = getImages(product)

	return (
		<motion.div
			whileTap={{ scale: 0.96 }}
			onClick={() => {
				haptic.light()
				onPress(product)
			}}
			className={styles.productCard}
		>
			<div className={styles.productImageWrapper}>
				<img
					src={images[0]}
					alt={product.name}
					className={styles.productImage}
					onError={e => {
						e.target.src = FALLBACK_IMG
					}}
				/>
				{discount && <div className={styles.badgeDiscount}>-{discount}%</div>}
				{product.featured && <div className={styles.badgeFeatured}>⭐</div>}
				{images.length > 1 && (
					<div className={styles.badgeImageCount}>📷 {images.length}</div>
				)}
				{product.stock === 0 && (
					<div className={styles.outOfStock}>
						<span className={styles.outOfStockLabel}>Tugagan</span>
					</div>
				)}
			</div>
			<div className={styles.productBody}>
				{product.category_name && (
					<div className={styles.productCategory}>
						{product.category_icon} {product.category_name}
					</div>
				)}
				<div className={styles.productName}>{product.name}</div>
				<div className={styles.productPrice}>{formatPrice(product.price)}</div>
				{product.old_price && (
					<div className={styles.productOldPrice}>
						{formatPrice(product.old_price)}
					</div>
				)}
			</div>
		</motion.div>
	)
}

function OrderForm({ product, onBack, onSuccess }) {
	const { user } = useTelegram()
	const [name, setName] = useState(user?.first_name || '')
	const [phone, setPhone] = useState('')
	const [message, setMessage] = useState('')
	const [quantity, setQuantity] = useState(1)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const total = Number(product.price) * quantity

	const handleSubmit = async () => {
		if (!name.trim()) return setError('Ismingizni kiriting')
		if (!phone.trim()) return setError('Telefon raqamingizni kiriting')
		setError('')
		setLoading(true)
		try {
			await axios.post(`${API}/api/telegram/order`, {
				name: name.trim(),
				phone: phone.trim(),
				message: message.trim(),
				quantity,
				product: { name: product.name, price: product.price },
				tgUser: user,
			})
			onSuccess()
		} catch {
			setError("Xatolik yuz berdi. Qayta urinib ko'ring.")
		}
		setLoading(false)
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			style={{ padding: '20px' }}
		>
			{/* Mahsulot mini card */}
			<div
				style={{
					background: 'var(--bg-card)',
					border: '1px solid var(--border)',
					borderRadius: 14,
					padding: '14px 16px',
					marginBottom: 24,
					display: 'flex',
					gap: 12,
					alignItems: 'center',
				}}
			>
				<img
					src={getImages(product)[0]}
					alt={product.name}
					style={{
						width: 52,
						height: 52,
						borderRadius: 10,
						objectFit: 'cover',
						flexShrink: 0,
					}}
					onError={e => {
						e.target.src = FALLBACK_IMG
					}}
				/>
				<div style={{ flex: 1, minWidth: 0 }}>
					<div
						style={{
							fontWeight: 600,
							fontSize: 14,
							marginBottom: 2,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{product.name}
					</div>
					<div
						style={{
							fontSize: 15,
							fontWeight: 700,
							fontFamily: 'Syne',
							color: 'var(--accent-2)',
						}}
					>
						{formatPrice(product.price)}
					</div>
				</div>
			</div>

			{/* Miqdor */}
			<div style={{ marginBottom: 20 }}>
				<label
					style={{
						fontSize: 12,
						color: 'var(--text-muted)',
						textTransform: 'uppercase',
						letterSpacing: '0.08em',
						display: 'block',
						marginBottom: 10,
					}}
				>
					Miqdor
				</label>
				<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
					<motion.button
						whileTap={{ scale: 0.9 }}
						onClick={() => setQuantity(q => Math.max(1, q - 1))}
						style={{
							width: 40,
							height: 40,
							borderRadius: 10,
							background: 'var(--bg-card)',
							border: '1px solid var(--border)',
							color: 'var(--text-primary)',
							fontSize: 20,
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						−
					</motion.button>
					<span
						style={{
							fontFamily: 'Syne',
							fontWeight: 700,
							fontSize: 20,
							minWidth: 30,
							textAlign: 'center',
						}}
					>
						{quantity}
					</span>
					<motion.button
						whileTap={{ scale: 0.9 }}
						onClick={() => setQuantity(q => q + 1)}
						style={{
							width: 40,
							height: 40,
							borderRadius: 10,
							background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
							border: 'none',
							color: 'white',
							fontSize: 20,
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						+
					</motion.button>
					<span
						style={{
							marginLeft: 'auto',
							fontFamily: 'Syne',
							fontWeight: 700,
							fontSize: 16,
							color: 'var(--accent-2)',
						}}
					>
						Jami: {formatPrice(total)}
					</span>
				</div>
			</div>

			{/* Ism */}
			<div style={{ marginBottom: 14 }}>
				<label
					style={{
						fontSize: 12,
						color: 'var(--text-muted)',
						textTransform: 'uppercase',
						letterSpacing: '0.08em',
						display: 'block',
						marginBottom: 8,
					}}
				>
					Ismingiz *
				</label>
				<input
					type='text'
					placeholder='Ism Familiya'
					value={name}
					onChange={e => setName(e.target.value)}
					style={{
						width: '100%',
						borderRadius: 12,
						padding: '12px 16px',
						background: 'var(--bg-card)',
						border: '1px solid var(--border)',
						color: 'var(--text-primary)',
						fontSize: 15,
					}}
				/>
			</div>

			{/* Telefon */}
			<div style={{ marginBottom: 14 }}>
				<label
					style={{
						fontSize: 12,
						color: 'var(--text-muted)',
						textTransform: 'uppercase',
						letterSpacing: '0.08em',
						display: 'block',
						marginBottom: 8,
					}}
				>
					Telefon raqam *
				</label>
				<input
					type='tel'
					placeholder='+998 90 123 45 67'
					value={phone}
					onChange={e => setPhone(e.target.value)}
					style={{
						width: '100%',
						borderRadius: 12,
						padding: '12px 16px',
						background: 'var(--bg-card)',
						border: '1px solid var(--border)',
						color: 'var(--text-primary)',
						fontSize: 15,
					}}
				/>
			</div>

			{/* Izoh */}
			<div style={{ marginBottom: 20 }}>
				<label
					style={{
						fontSize: 12,
						color: 'var(--text-muted)',
						textTransform: 'uppercase',
						letterSpacing: '0.08em',
						display: 'block',
						marginBottom: 8,
					}}
				>
					Izoh (ixtiyoriy)
				</label>
				<textarea
					placeholder="Qo'shimcha ma'lumot..."
					value={message}
					onChange={e => setMessage(e.target.value)}
					rows={3}
					style={{
						width: '100%',
						borderRadius: 12,
						padding: '12px 16px',
						background: 'var(--bg-card)',
						border: '1px solid var(--border)',
						color: 'var(--text-primary)',
						fontSize: 15,
						resize: 'none',
						fontFamily: 'DM Sans',
					}}
				/>
			</div>

			{/* Xato */}
			{error && (
				<div
					style={{
						background: 'rgba(239,68,68,0.1)',
						border: '1px solid rgba(239,68,68,0.3)',
						borderRadius: 10,
						padding: '10px 14px',
						marginBottom: 16,
						color: 'var(--danger)',
						fontSize: 13,
					}}
				>
					⚠️ {error}
				</div>
			)}

			{/* Submit */}
			<motion.button
				whileTap={{ scale: 0.97 }}
				onClick={handleSubmit}
				disabled={loading}
				style={{
					width: '100%',
					padding: '15px',
					background: loading
						? 'rgba(99,102,241,0.5)'
						: 'linear-gradient(135deg, #6366f1, #a78bfa)',
					border: 'none',
					borderRadius: 14,
					color: 'white',
					fontSize: 16,
					fontWeight: 600,
					cursor: loading ? 'not-allowed' : 'pointer',
					fontFamily: 'Syne',
				}}
			>
				{loading ? '⏳ Yuborilmoqda...' : '🛒 Buyurtma berish'}
			</motion.button>
		</motion.div>
	)
}

function OrderSuccess({ orderNum, onClose }) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			style={{ padding: '60px 20px', textAlign: 'center' }}
		>
			<div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
			<h2
				style={{
					fontFamily: 'Syne',
					fontWeight: 800,
					fontSize: 24,
					marginBottom: 12,
				}}
			>
				Buyurtma qabul qilindi!
			</h2>
			<p
				style={{
					color: 'var(--text-secondary)',
					fontSize: 15,
					marginBottom: 8,
				}}
			>
				Buyurtma raqami: <strong>#{orderNum}</strong>
			</p>
			<p
				style={{
					color: 'var(--text-secondary)',
					fontSize: 14,
					marginBottom: 32,
				}}
			>
				Tez orada operator siz bilan bog'lanadi 📞
			</p>
			<motion.button
				whileTap={{ scale: 0.97 }}
				onClick={onClose}
				style={{
					padding: '14px 32px',
					background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
					border: 'none',
					borderRadius: 14,
					color: 'white',
					fontSize: 15,
					fontWeight: 600,
					cursor: 'pointer',
					fontFamily: 'Syne',
				}}
			>
				Yopish
			</motion.button>
		</motion.div>
	)
}

function ProductSheet({ product, onClose }) {
	const { hideMainButton, haptic } = useTelegram()
	const images = getImages(product)
	const [view, setView] = useState('detail') // 'detail' | 'form' | 'success'
	const [orderNum, setOrderNum] = useState('')
	const discount = product.old_price
		? Math.round(
				((product.old_price - product.price) / product.old_price) * 100,
			)
		: null

	useEffect(() => {
		return () => hideMainButton()
	}, [])

	const handleSuccess = num => {
		setOrderNum(num)
		setView('success')
		haptic.success()
	}

	const headerTitle =
		view === 'form'
			? 'Buyurtma berish'
			: view === 'success'
				? 'Muvaffaqiyat'
				: 'Mahsulot'
	const handleBack = () => {
		if (view === 'form') return setView('detail')
		onClose()
	}

	return (
		<motion.div
			initial={{ y: '100%' }}
			animate={{ y: 0 }}
			exit={{ y: '100%' }}
			transition={{ type: 'spring', stiffness: 300, damping: 35 }}
			className={styles.sheet}
		>
			{/* Header */}
			<div className={styles.sheetHeader}>
				<motion.button
					whileTap={{ scale: 0.9 }}
					onClick={() => {
						haptic.light()
						handleBack()
					}}
					className={styles.sheetBack}
				>
					←
				</motion.button>
				<span className={styles.sheetTitle}>{headerTitle}</span>
				{view === 'detail' && images.length > 1 && (
					<span className={styles.sheetImageCounter}>
						📷 {images.length} ta rasm
					</span>
				)}
			</div>

			{/* Views */}
			<AnimatePresence mode='wait'>
				{view === 'detail' && (
					<motion.div
						key='detail'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<ImageGallery images={images} discount={discount} />
						<div className={styles.sheetContent}>
							{product.category_name && (
								<span className={styles.sheetCategory}>
									{product.category_icon} {product.category_name}
								</span>
							)}
							<h1 className={styles.sheetName}>{product.name}</h1>
							<div className={styles.priceBlock}>
								<div>
									<div className={styles.priceLabel}>NARXI</div>
									<div className={styles.sheetPrice}>
										{formatPrice(product.price)}
									</div>
									{product.old_price && (
										<div className={styles.sheetOldPrice}>
											{formatPrice(product.old_price)}
										</div>
									)}
								</div>
								<StockPill stock={product.stock} />
							</div>
							{product.description && (
								<div className={styles.descBlock}>
									<h3 className={styles.descTitle}>Tavsif</h3>
									<p className={styles.descText}>{product.description}</p>
								</div>
							)}
							{product.tags?.length > 0 && (
								<div className={styles.tags}>
									{product.tags.map(tag => (
										<span key={tag} className={styles.tag}>
											{tag}
										</span>
									))}
								</div>
							)}
							{/* Buyurtma tugmasi */}
							{product.stock > 0 && (
								<motion.button
									whileTap={{ scale: 0.97 }}
									onClick={() => {
										haptic.medium()
										setView('form')
									}}
									style={{
										width: '100%',
										padding: '15px',
										marginTop: 24,
										background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
										border: 'none',
										borderRadius: 14,
										color: 'white',
										fontSize: 16,
										fontWeight: 600,
										cursor: 'pointer',
										fontFamily: 'Syne',
										boxShadow: '0 0 20px rgba(99,102,241,0.3)',
									}}
								>
									🛒 Buyurtma berish
								</motion.button>
							)}
						</div>
					</motion.div>
				)}

				{view === 'form' && (
					<motion.div
						key='form'
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -30 }}
					>
						<OrderForm
							product={product}
							onBack={() => setView('detail')}
							onSuccess={num => handleSuccess(num)}
						/>
					</motion.div>
				)}

				{view === 'success' && (
					<motion.div
						key='success'
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0 }}
					>
						<OrderSuccess orderNum={orderNum} onClose={onClose} />
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	)
}

function StockPill({ stock }) {
	if (stock === 0)
		return (
			<span className={`${styles.stockPill} ${styles.stockOut}`}>
				❌ Tugagan
			</span>
		)
	if (stock < 10)
		return (
			<span className={`${styles.stockPill} ${styles.stockLow}`}>
				⚠️ {stock} ta qoldi
			</span>
		)
	return (
		<span className={`${styles.stockPill} ${styles.stockOk}`}>✅ Mavjud</span>
	)
}

function HomeTab({ onProductPress, onTabChange }) {
	const { user } = useTelegram()
	const { data: featuredData } = useQuery({
		queryKey: ['tma-featured'],
		queryFn: () =>
			axios.get(`${API}/api/products?featured=true&limit=6`).then(r => r.data),
	})
	const { data: categories } = useQuery({
		queryKey: ['tma-categories'],
		queryFn: () => axios.get(`${API}/api/categories`).then(r => r.data),
	})
	const featured = featuredData?.products ?? []

	return (
		<div>
			<div className='tma-user-greeting'>
				<div>
					<div className={styles.greetingMeta}>Xush kelibsiz 👋</div>
					<div className={styles.greetingName}>
						{user ? user.first_name : "Do'konimizga"}
					</div>
				</div>
				<div className={styles.greetingIcon}>🛍️</div>
			</div>
			<motion.div
				whileTap={{ scale: 0.98 }}
				onClick={() => onTabChange('search')}
				className={styles.searchBar}
				role='button'
			>
				<span className={styles.searchBarIcon}>🔍</span>Mahsulot qidirish...
			</motion.div>
			{categories?.length > 0 && (
				<div className={styles.categoriesSection}>
					<div className={styles.sectionTitle}>Kategoriyalar</div>
					<div className={styles.categoriesScroll}>
						{categories.map((cat, i) => (
							<motion.div
								key={cat.id}
								{...fadeUp(i * 0.04)}
								whileTap={{ scale: 0.93 }}
								onClick={() => onTabChange('products', { category: cat.slug })}
								className={styles.categoryChip}
							>
								<span className={styles.categoryChipIcon}>{cat.icon}</span>
								<span className={styles.categoryChipName}>{cat.name}</span>
							</motion.div>
						))}
					</div>
				</div>
			)}
			<div className={styles.sectionRow}>
				<span className={styles.sectionTitle}>⭐ Tanlangan</span>
				<motion.button
					whileTap={{ scale: 0.95 }}
					onClick={() => onTabChange('products')}
					className={styles.seeAllBtn}
				>
					Barchasi →
				</motion.button>
			</div>
			{featured.length === 0 ? (
				<div className={styles.centered}>
					<div className='spinner' style={{ margin: '0 auto' }} />
				</div>
			) : (
				<div className='tma-products-grid'>
					{featured.map((p, i) => (
						<motion.div key={p.id} {...fadeUp(i * 0.06)}>
							<TMAProductCard product={p} onPress={onProductPress} />
						</motion.div>
					))}
				</div>
			)}
		</div>
	)
}

function ProductsTab({ initialCategory, onProductPress }) {
	const [activeCategory, setActiveCategory] = useState(initialCategory || 'all')
	const [page, setPage] = useState(1)
	const { haptic } = useTelegram()
	const { data: categories } = useQuery({
		queryKey: ['tma-categories'],
		queryFn: () => axios.get(`${API}/api/categories`).then(r => r.data),
	})
	const { data, isLoading } = useQuery({
		queryKey: ['tma-products', activeCategory, page],
		queryFn: () => {
			const p = new URLSearchParams({ page, limit: 10 })
			if (activeCategory !== 'all') p.set('category', activeCategory)
			return axios.get(`${API}/api/products?${p}`).then(r => r.data)
		},
		keepPreviousData: true,
	})
	const products = data?.products ?? []
	const totalPages = data?.totalPages ?? 1

	return (
		<div>
			<div className='tma-categories'>
				<button
					className={`tma-category-pill ${activeCategory === 'all' ? 'active' : ''}`}
					onClick={() => {
						haptic.selection()
						setActiveCategory('all')
						setPage(1)
					}}
				>
					🌟 Barchasi
				</button>
				{(categories ?? []).map(cat => (
					<button
						key={cat.id}
						className={`tma-category-pill ${activeCategory === cat.slug ? 'active' : ''}`}
						onClick={() => {
							haptic.selection()
							setActiveCategory(cat.slug)
							setPage(1)
						}}
					>
						{cat.icon} {cat.name}
					</button>
				))}
			</div>
			{isLoading ? (
				<div className='tma-products-grid'>
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className={`shimmer ${styles.skeletonCard}`} />
					))}
				</div>
			) : products.length === 0 ? (
				<div className={styles.emptyState}>
					<div className={styles.emptyIcon}>🔍</div>
					<p className={styles.emptyText}>Mahsulot topilmadi</p>
				</div>
			) : (
				<>
					<div className={styles.resultCount}>{data?.total} ta mahsulot</div>
					<div className='tma-products-grid'>
						{products.map((p, i) => (
							<motion.div key={p.id} {...fadeUp(i * 0.04)}>
								<TMAProductCard product={p} onPress={onProductPress} />
							</motion.div>
						))}
					</div>
					{totalPages > 1 && (
						<div className={styles.pagination}>
							<motion.button
								whileTap={{ scale: 0.95 }}
								disabled={page === 1}
								onClick={() => setPage(p => p - 1)}
								className={`${styles.pageBtn} ${page === 1 ? styles.pageBtnDisabled : ''}`}
							>
								← Oldingi
							</motion.button>
							<span className={styles.pageInfo}>
								{page} / {totalPages}
							</span>
							<motion.button
								whileTap={{ scale: 0.95 }}
								disabled={page === totalPages}
								onClick={() => setPage(p => p + 1)}
								className={`${styles.pageBtn} ${page === totalPages ? styles.pageBtnDisabled : ''}`}
							>
								Keyingi →
							</motion.button>
						</div>
					)}
				</>
			)}
		</div>
	)
}

function SearchTab({ onProductPress }) {
	const [query, setQuery] = useState('')
	const [debouncedQuery, setDebouncedQuery] = useState('')
	const inputRef = useRef()
	useEffect(() => {
		inputRef.current?.focus()
	}, [])
	useEffect(() => {
		const t = setTimeout(() => setDebouncedQuery(query), 400)
		return () => clearTimeout(t)
	}, [query])
	const { data, isLoading } = useQuery({
		queryKey: ['tma-search', debouncedQuery],
		queryFn: () =>
			axios
				.get(`${API}/api/products?search=${debouncedQuery}&limit=20`)
				.then(r => r.data),
		enabled: debouncedQuery.length > 1,
	})
	const products = data?.products ?? []

	return (
		<div>
			<div className={`tma-search ${styles.searchInputWrapper}`}>
				<span className='tma-search-icon'>🔍</span>
				<input
					ref={inputRef}
					type='text'
					placeholder='Mahsulot nomi yoki tavsif...'
					value={query}
					onChange={e => setQuery(e.target.value)}
					className={styles.searchInputField}
				/>
			</div>
			{query.length < 2 ? (
				<div className={styles.emptyState}>
					<div className={styles.emptyIcon}>🔍</div>
					<p className={styles.emptyText}>
						Qidirish uchun kamida 2 ta harf kiriting
					</p>
				</div>
			) : isLoading ? (
				<div className='tma-products-grid'>
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className={`shimmer ${styles.skeletonCard}`} />
					))}
				</div>
			) : products.length === 0 ? (
				<div className={styles.emptyState}>
					<div className={styles.emptyIcon}>😕</div>
					<p className={styles.emptyText}>
						"<strong>{debouncedQuery}</strong>" bo'yicha natija topilmadi
					</p>
				</div>
			) : (
				<>
					<div className={styles.resultCount}>{data.total} ta natija</div>
					<div className='tma-products-grid'>
						{products.map((p, i) => (
							<motion.div key={p.id} {...fadeUp(i * 0.04)}>
								<TMAProductCard product={p} onPress={onProductPress} />
							</motion.div>
						))}
					</div>
				</>
			)}
		</div>
	)
}

const CONTACT_ITEMS = [
	{ icon: '📞', label: 'Telefon', value: '+998 90 123 45 67' },
	{ icon: '📧', label: 'Email', value: 'info@biznes.uz' },
	{ icon: '🕐', label: 'Ish vaqti', value: '09:00 – 18:00' },
	{ icon: '📍', label: 'Manzil', value: "Toshkent, O'zbekiston" },
]

function ProfileTab() {
	const { user, close } = useTelegram()
	return (
		<div className={styles.profilePadding}>
			<div className={styles.userCard}>
				<div className={styles.userAvatar}>
					{user ? user.first_name?.[0]?.toUpperCase() || '👤' : '👤'}
				</div>
				<div>
					{user ? (
						<>
							<div className={styles.userName}>
								{user.first_name} {user.last_name || ''}
							</div>
							{user.username && (
								<div className={styles.userHandle}>@{user.username}</div>
							)}
							<div className={styles.verifiedBadge}>✅ Tasdiqlangan</div>
						</>
					) : (
						<div>
							<div className={styles.userName}>Mehmon</div>
							<div className={styles.userHandle}>Telegram orqali kirasiz</div>
						</div>
					)}
				</div>
			</div>
			{CONTACT_ITEMS.map(item => (
				<motion.div
					key={item.label}
					whileTap={{ scale: 0.98 }}
					className={styles.contactItem}
				>
					<span className={styles.contactIcon}>{item.icon}</span>
					<div>
						<div className={styles.contactLabel}>{item.label}</div>
						<div className={styles.contactValue}>{item.value}</div>
					</div>
				</motion.div>
			))}
			<motion.button
				whileTap={{ scale: 0.97 }}
				onClick={close}
				className={styles.closeAppBtn}
			>
				Ilovani yopish
			</motion.button>
		</div>
	)
}

const TAB_TITLES = {
	home: "🛍️ Biznes Do'kon",
	products: '📦 Mahsulotlar',
	search: '🔍 Qidiruv',
	profile: '👤 Profil',
}

export default function TMAApp() {
	const [activeTab, setActiveTab] = useState('home')
	const [selectedProduct, setSelectedProduct] = useState(null)
	const [tabOptions, setTabOptions] = useState({})
	const { user } = useTelegram()

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const productId = params.get('product')
		const category = params.get('category')
		if (productId)
			axios
				.get(`${API}/api/products/${productId}`)
				.then(r => setSelectedProduct(r.data))
				.catch(() => {})
		if (category) {
			setActiveTab('products')
			setTabOptions({ category })
		}
	}, [])

	const handleTabChange = useCallback((tab, opts = {}) => {
		setTabOptions(opts)
		setActiveTab(tab)
	}, [])

	const tabContent = {
		home: (
			<HomeTab
				onProductPress={setSelectedProduct}
				onTabChange={handleTabChange}
			/>
		),
		products: (
			<ProductsTab
				initialCategory={tabOptions.category}
				onProductPress={setSelectedProduct}
			/>
		),
		search: <SearchTab onProductPress={setSelectedProduct} />,
		profile: <ProfileTab />,
	}

	return (
		<div className={styles.app}>
			<div className='tma-header'>
				<div className={styles.headerLogo}>✦</div>
				<span className={styles.headerTitle}>{TAB_TITLES[activeTab]}</span>
				{user && (
					<div className={styles.headerAvatar}>
						{user.first_name?.[0]?.toUpperCase() || '👤'}
					</div>
				)}
			</div>
			<div className='tma-page-content'>
				<AnimatePresence mode='wait'>
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.2 }}
					>
						{tabContent[activeTab]}
					</motion.div>
				</AnimatePresence>
			</div>
			<TMABottomNav activeTab={activeTab} onTabChange={handleTabChange} />
			<AnimatePresence>
				{selectedProduct && (
					<ProductSheet
						product={selectedProduct}
						onClose={() => setSelectedProduct(null)}
					/>
				)}
			</AnimatePresence>
		</div>
	)
}
