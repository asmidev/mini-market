import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar.jsx'

const FALLBACK =
	'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'

function formatPrice(price) {
	return new Intl.NumberFormat('uz-UZ').format(price) + " so'm"
}

function StockBadge({ stock }) {
	if (stock === 0) return <span style={badge('danger')}>❌ Mavjud emas</span>
	if (stock < 10)
		return <span style={badge('warning')}>⚠️ Faqat {stock} ta qoldi</span>
	return <span style={badge('success')}>✅ Mavjud ({stock} ta)</span>
}

function badge(type) {
	const colors = { danger: '#ef4444', warning: '#f59e0b', success: '#22c55e' }
	return {
		display: 'inline-block',
		padding: '4px 12px',
		borderRadius: 8,
		fontSize: 13,
		fontWeight: 600,
		background: colors[type] + '20',
		color: colors[type],
		border: `1px solid ${colors[type]}40`,
	}
}

/* ─── Order Form ─── */
function OrderForm({ product, onSuccess, onCancel }) {
	const [name, setName] = useState('')
	const [phone, setPhone] = useState('')
	const [message, setMessage] = useState('')
	const [quantity, setQuantity] = useState(1)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	// Xotira va rang — mahsulotda bo'lsa default qo'yamiz
	const [selectedMemory, setSelectedMemory] = useState(
		product.memory_id
			? { id: product.memory_id, name: product.memory_name }
			: null,
	)
	const [selectedColor, setSelectedColor] = useState(
		product.color_id
			? {
					id: product.color_id,
					name: product.color_name,
					hex: product.color_hex,
				}
			: null,
	)

	// Barcha xotira va ranglarni API dan olish
	const { data: memories } = useQuery({
		queryKey: ['memories'],
		queryFn: () => axios.get('/api/memories').then(r => r.data),
		enabled: !!product.memory_id, // faqat mahsulotda memory bo'lsa
	})
	const { data: colors } = useQuery({
		queryKey: ['colors'],
		queryFn: () => axios.get('/api/colors').then(r => r.data),
		enabled: !!product.color_id, // faqat mahsulotda color bo'lsa
	})

	const total = Number(product.price) * quantity

	const handleSubmit = async () => {
		if (!name.trim()) return setError('Ismingizni kiriting')
		if (!phone.trim()) return setError('Telefon raqamingizni kiriting')
		setError('')
		setLoading(true)
		try {
			const res = await axios.post('/api/telegram/order', {
				name: name.trim(),
				phone: phone.trim(),
				message: message.trim(),
				quantity,
				product: {
					name: product.name,
					price: product.price,
					memory: selectedMemory?.name || null,
					color: selectedColor?.name || null,
				},
			})
			onSuccess(res.data.orderNum)
		} catch (e) {
			setError(
				e.response?.data?.error || "Xatolik yuz berdi. Qayta urinib ko'ring.",
			)
		}
		setLoading(false)
	}

	const images =
		Array.isArray(product.images) && product.images.length > 0
			? product.images
			: product.image_url
				? [product.image_url]
				: [FALLBACK]

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			style={{
				background: 'var(--bg-card, #1a1a2e)',
				border: '1px solid var(--border, #2a2a3e)',
				borderRadius: 20,
				padding: 24,
				marginTop: 24,
			}}
		>
			<h3
				style={{
					fontFamily: 'Syne, sans-serif',
					fontWeight: 700,
					fontSize: 18,
					marginBottom: 20,
				}}
			>
				🛒 Buyurtma berish
			</h3>

			{/* Mini product card */}
			<div
				style={{
					display: 'flex',
					gap: 12,
					alignItems: 'center',
					background: 'rgba(255,255,255,0.04)',
					borderRadius: 12,
					padding: '12px 14px',
					marginBottom: 20,
				}}
			>
				<img
					src={images[0]}
					alt={product.name}
					onError={e => {
						e.target.src = FALLBACK
					}}
					style={{
						width: 50,
						height: 50,
						borderRadius: 8,
						objectFit: 'cover',
						flexShrink: 0,
					}}
				/>
				<div style={{ flex: 1, minWidth: 0 }}>
					<div
						style={{
							fontWeight: 600,
							fontSize: 14,
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
					>
						{product.name}
					</div>
					<div
						style={{
							fontWeight: 700,
							fontSize: 15,
							color: '#a78bfa',
							marginTop: 2,
						}}
					>
						{formatPrice(product.price)}
					</div>
				</div>
			</div>

			{/* ── Xotira tanlash ── */}
			{product.memory_id && memories?.length > 0 && (
				<div style={{ marginBottom: 18 }}>
					<label style={labelStyle}>💾 Xotira</label>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
						{memories.map(m => (
							<button
								key={m.id}
								type='button'
								onClick={() => setSelectedMemory(m)}
								style={{
									padding: '8px 16px',
									borderRadius: 10,
									border:
										selectedMemory?.id === m.id
											? '2px solid #6366f1'
											: '1px solid rgba(255,255,255,0.12)',
									background:
										selectedMemory?.id === m.id
											? 'rgba(99,102,241,0.15)'
											: 'rgba(255,255,255,0.04)',
									color: selectedMemory?.id === m.id ? '#a78bfa' : '#c1c1d5',
									fontSize: 13,
									fontWeight: selectedMemory?.id === m.id ? 600 : 400,
									cursor: 'pointer',
									transition: 'all 0.15s',
								}}
							>
								{m.name}
							</button>
						))}
					</div>
				</div>
			)}

			{/* ── Rang tanlash ── */}
			{product.color_id && colors?.length > 0 && (
				<div style={{ marginBottom: 18 }}>
					<label style={labelStyle}>🎨 Rang</label>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
						{colors.map(c => (
							<button
								key={c.id}
								type='button'
								onClick={() =>
									setSelectedColor({ id: c.id, name: c.name, hex: c.color })
								}
								title={c.name}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 7,
									padding: '7px 14px',
									borderRadius: 10,
									border:
										selectedColor?.id === c.id
											? '2px solid #6366f1'
											: '1px solid rgba(255,255,255,0.12)',
									background:
										selectedColor?.id === c.id
											? 'rgba(99,102,241,0.15)'
											: 'rgba(255,255,255,0.04)',
									color: selectedColor?.id === c.id ? '#a78bfa' : '#c1c1d5',
									fontSize: 13,
									fontWeight: selectedColor?.id === c.id ? 600 : 400,
									cursor: 'pointer',
									transition: 'all 0.15s',
								}}
							>
								<div
									style={{
										width: 14,
										height: 14,
										borderRadius: '50%',
										background: c.color || '#888',
										border: '1.5px solid rgba(255,255,255,0.25)',
										flexShrink: 0,
									}}
								/>
								{c.name}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Miqdor */}
			<div style={{ marginBottom: 18 }}>
				<label style={labelStyle}>Miqdor</label>
				<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
					<button
						onClick={() => setQuantity(q => Math.max(1, q - 1))}
						style={qtyBtn('#2a2a3e')}
					>
						−
					</button>
					<span
						style={{
							fontWeight: 700,
							fontSize: 20,
							minWidth: 28,
							textAlign: 'center',
						}}
					>
						{quantity}
					</span>
					<button
						onClick={() => setQuantity(q => q + 1)}
						style={qtyBtn('linear-gradient(135deg,#6366f1,#a78bfa)')}
					>
						+
					</button>
					<span
						style={{ marginLeft: 'auto', fontWeight: 700, color: '#a78bfa' }}
					>
						Jami: {formatPrice(total)}
					</span>
				</div>
			</div>

			{/* Ism */}
			<div style={{ marginBottom: 14 }}>
				<label style={labelStyle}>Ismingiz *</label>
				<input
					type='text'
					placeholder='Ism Familiya'
					value={name}
					onChange={e => setName(e.target.value)}
					style={inputStyle}
				/>
			</div>

			{/* Telefon */}
			<div style={{ marginBottom: 14 }}>
				<label style={labelStyle}>Telefon raqam *</label>
				<input
					type='tel'
					placeholder='+998 90 123 45 67'
					value={phone}
					onChange={e => setPhone(e.target.value)}
					style={inputStyle}
				/>
			</div>

			{/* Izoh */}
			<div style={{ marginBottom: 20 }}>
				<label style={labelStyle}>Izoh (ixtiyoriy)</label>
				<textarea
					placeholder="Qo'shimcha ma'lumot..."
					value={message}
					onChange={e => setMessage(e.target.value)}
					rows={3}
					style={{
						...inputStyle,
						resize: 'none',
						fontFamily: 'DM Sans, sans-serif',
					}}
				/>
			</div>

			{error && (
				<div
					style={{
						background: 'rgba(239,68,68,0.1)',
						border: '1px solid rgba(239,68,68,0.3)',
						borderRadius: 10,
						padding: '10px 14px',
						marginBottom: 16,
						color: '#ef4444',
						fontSize: 13,
					}}
				>
					⚠️ {error}
				</div>
			)}

			<div style={{ display: 'flex', gap: 10 }}>
				<motion.button
					whileTap={{ scale: 0.97 }}
					onClick={handleSubmit}
					disabled={loading}
					style={{
						flex: 1,
						padding: '14px',
						background: loading
							? 'rgba(99,102,241,0.5)'
							: 'linear-gradient(135deg,#6366f1,#a78bfa)',
						border: 'none',
						borderRadius: 12,
						color: 'white',
						fontSize: 15,
						fontWeight: 600,
						cursor: loading ? 'not-allowed' : 'pointer',
						fontFamily: 'Syne, sans-serif',
					}}
				>
					{loading ? '⏳ Yuborilmoqda...' : '✅ Tasdiqlash'}
				</motion.button>
				<motion.button
					whileTap={{ scale: 0.97 }}
					onClick={onCancel}
					style={{
						padding: '14px 20px',
						background: 'rgba(255,255,255,0.06)',
						border: '1px solid rgba(255,255,255,0.1)',
						borderRadius: 12,
						color: 'white',
						fontSize: 15,
						cursor: 'pointer',
					}}
				>
					Bekor
				</motion.button>
			</div>
		</motion.div>
	)
}

function OrderSuccess({ orderNum, onClose }) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			style={{
				background: 'var(--bg-card,#1a1a2e)',
				border: '1px solid rgba(34,197,94,0.3)',
				borderRadius: 20,
				padding: '40px 24px',
				marginTop: 24,
				textAlign: 'center',
			}}
		>
			<div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
			<h2
				style={{
					fontFamily: 'Syne, sans-serif',
					fontWeight: 800,
					fontSize: 22,
					marginBottom: 10,
				}}
			>
				Buyurtma qabul qilindi!
			</h2>
			<p style={{ color: '#a1a1b5', marginBottom: 6 }}>
				Buyurtma raqami:{' '}
				<strong style={{ color: '#a78bfa' }}>#{orderNum}</strong>
			</p>
			<p style={{ color: '#a1a1b5', fontSize: 14, marginBottom: 28 }}>
				Tez orada operator siz bilan bog'lanadi 📞
			</p>
			<motion.button
				whileTap={{ scale: 0.97 }}
				onClick={onClose}
				style={{
					padding: '13px 32px',
					background: 'linear-gradient(135deg,#6366f1,#a78bfa)',
					border: 'none',
					borderRadius: 12,
					color: 'white',
					fontSize: 15,
					fontWeight: 600,
					cursor: 'pointer',
					fontFamily: 'Syne, sans-serif',
				}}
			>
				Yopish
			</motion.button>
		</motion.div>
	)
}

const labelStyle = {
	display: 'block',
	fontSize: 11,
	color: '#6b6b8a',
	textTransform: 'uppercase',
	letterSpacing: '0.08em',
	marginBottom: 8,
}
const inputStyle = {
	width: '100%',
	borderRadius: 10,
	padding: '11px 14px',
	background: 'rgba(255,255,255,0.05)',
	border: '1px solid rgba(255,255,255,0.1)',
	color: 'white',
	fontSize: 15,
	outline: 'none',
	boxSizing: 'border-box',
}
const qtyBtn = bg => ({
	width: 38,
	height: 38,
	borderRadius: 9,
	background: bg,
	border: 'none',
	color: 'white',
	fontSize: 20,
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	flexShrink: 0,
})

/* ─── Main Page ─── */
export default function ProductDetailPage() {
	const { id } = useParams()
	const [activeIdx, setActiveIdx] = useState(0)
	const [view, setView] = useState('detail')
	const [orderNum, setOrderNum] = useState('')

	const {
		data: product,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['product', id],
		queryFn: () => axios.get(`/api/products/${id}`).then(r => r.data),
	})

	if (isLoading)
		return (
			<div style={{ minHeight: '100vh' }}>
				<Navbar />
				<div
					style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}
				>
					<div className='spinner' />
				</div>
			</div>
		)

	if (isError || !product)
		return (
			<div
				style={{
					minHeight: '100vh',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					paddingTop: 100,
				}}
			>
				<Navbar />
				<h2>Mahsulot topilmadi</h2>
				<Link to='/products' className='btn btn-primary'>
					← Orqaga
				</Link>
			</div>
		)

	const images =
		Array.isArray(product.images) && product.images.length > 0
			? product.images
			: product.image_url
				? [product.image_url]
				: [FALLBACK]

	const activeImg = images[activeIdx] || FALLBACK
	const hasMany = images.length > 1
	const prev = () => setActiveIdx(i => (i - 1 + images.length) % images.length)
	const next = () => setActiveIdx(i => (i + 1) % images.length)
	const discount = product.old_price
		? Math.round(
				((product.old_price - product.price) / product.old_price) * 100,
			)
		: null

	return (
		<div
			style={{ minHeight: '100vh', background: 'var(--bg-primary, #08080f)' }}
		>
			<Navbar />
			<div
				className='container'
				style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 60px' }}
			>
				{/* Breadcrumb */}
				<nav
					style={{
						display: 'flex',
						gap: 8,
						alignItems: 'center',
						fontSize: 13,
						color: '#6b6b8a',
						marginTop: 50,
					}}
				>
					<Link to='/' style={{ color: '#a78bfa', textDecoration: 'none' }}>
						Bosh sahifa
					</Link>
					<span>→</span>
					<Link
						to='/products'
						style={{ color: '#a78bfa', textDecoration: 'none' }}
					>
						Mahsulotlar
					</Link>
					<span>→</span>
					<span style={{ color: 'white' }}>{product.name}</span>
				</nav>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
						gap: 32,
						marginTop: 20,
					}}
				>
					{/* Gallery */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
					>
						<div
							style={{
								position: 'relative',
								borderRadius: 20,
								overflow: 'hidden',
								background: '#12121e',
								aspectRatio: '1',
								maxHeight: 480,
							}}
						>
							<AnimatePresence mode='wait'>
								<motion.img
									key={activeImg}
									src={activeImg}
									alt={product.name}
									onError={e => (e.target.src = FALLBACK)}
									initial={{ opacity: 0, scale: 0.97 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2 }}
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'contain',
										display: 'block',
										padding: 12,
									}}
								/>
							</AnimatePresence>
							{discount && (
								<div
									style={{
										position: 'absolute',
										top: 16,
										left: 16,
										background: 'rgba(239,68,68,0.9)',
										color: 'white',
										borderRadius: 8,
										padding: '6px 14px',
										fontWeight: 700,
										fontSize: 14,
									}}
								>
									-{discount}%
								</div>
							)}
							{hasMany && (
								<>
									<button onClick={prev} style={arrowStyle('left')}>
										‹
									</button>
									<button onClick={next} style={arrowStyle('right')}>
										›
									</button>
									<div
										style={{
											position: 'absolute',
											bottom: 12,
											right: 12,
											background: 'rgba(0,0,0,0.6)',
											color: 'white',
											borderRadius: 6,
											padding: '4px 10px',
											fontSize: 12,
										}}
									>
										{activeIdx + 1} / {images.length}
									</div>
								</>
							)}
						</div>
						{hasMany && (
							<div
								style={{
									display: 'flex',
									gap: 8,
									marginTop: 10,
									overflowX: 'auto',
									paddingBottom: 4,
								}}
							>
								{images.map((src, i) => (
									<button
										key={i}
										onClick={() => setActiveIdx(i)}
										style={{
											flexShrink: 0,
											width: 64,
											height: 64,
											borderRadius: 10,
											overflow: 'hidden',
											border:
												i === activeIdx
													? '2px solid #6366f1'
													: '2px solid transparent',
											padding: 0,
											cursor: 'pointer',
											background: 'none',
										}}
									>
										<img
											src={src}
											alt={`thumb ${i + 1}`}
											onError={e => (e.target.src = FALLBACK)}
											style={{
												width: '100%',
												height: '100%',
												objectFit: 'cover',
												display: 'block',
											}}
										/>
									</button>
								))}
							</div>
						)}
					</motion.div>

					{/* Details */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						{product.category_name && (
							<div
								style={{
									fontSize: 12,
									color: '#a78bfa',
									textTransform: 'uppercase',
									letterSpacing: '0.1em',
									marginBottom: 8,
								}}
							>
								{product.category_icon} {product.category_name}
							</div>
						)}
						<h1
							style={{
								fontFamily: 'Syne, sans-serif',
								fontWeight: 800,
								fontSize: 28,
								lineHeight: 1.2,
								marginBottom: 16,
							}}
						>
							{product.name}
						</h1>

						<div
							style={{
								display: 'flex',
								alignItems: 'baseline',
								gap: 12,
								marginBottom: 12,
							}}
						>
							<span
								style={{
									fontFamily: 'Syne, sans-serif',
									fontWeight: 800,
									fontSize: 28,
									color: 'white',
								}}
							>
								{formatPrice(product.price)}
							</span>
							{product.old_price && (
								<span
									style={{
										fontSize: 16,
										color: '#6b6b8a',
										textDecoration: 'line-through',
									}}
								>
									{formatPrice(product.old_price)}
								</span>
							)}
						</div>

						<div style={{ marginBottom: 16 }}>
							<StockBadge stock={product.stock} />
						</div>

						{/* ── Xotira va Rang ── */}
						{(product.memory_name || product.color_name) && (
							<div
								style={{
									display: 'flex',
									gap: 10,
									marginBottom: 16,
									flexWrap: 'wrap',
								}}
							>
								{product.memory_name && (
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: 8,
											background: 'rgba(99,102,241,0.08)',
											border: '1px solid rgba(99,102,241,0.2)',
											borderRadius: 10,
											padding: '8px 14px',
										}}
									>
										<span style={{ fontSize: 16 }}>💾</span>
										<div>
											<div
												style={{
													fontSize: 10,
													color: '#6b6b8a',
													textTransform: 'uppercase',
													letterSpacing: '0.08em',
												}}
											>
												Xotira
											</div>
											<div
												style={{
													fontWeight: 600,
													fontSize: 14,
													color: 'white',
												}}
											>
												{product.memory_name}
											</div>
										</div>
									</div>
								)}
								{product.color_name && (
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: 8,
											background: 'rgba(99,102,241,0.08)',
											border: '1px solid rgba(99,102,241,0.2)',
											borderRadius: 10,
											padding: '8px 14px',
										}}
									>
										<div
											style={{
												width: 20,
												height: 20,
												borderRadius: '50%',
												background: product.color_hex || '#888',
												border: '2px solid rgba(255,255,255,0.2)',
												flexShrink: 0,
											}}
										/>
										<div>
											<div
												style={{
													fontSize: 10,
													color: '#6b6b8a',
													textTransform: 'uppercase',
													letterSpacing: '0.08em',
												}}
											>
												Rang
											</div>
											<div
												style={{
													fontWeight: 600,
													fontSize: 14,
													color: 'white',
												}}
											>
												{product.color_name}
											</div>
										</div>
									</div>
								)}
							</div>
						)}

						{product.description && (
							<div
								style={{
									background: 'rgba(255,255,255,0.03)',
									border: '1px solid rgba(255,255,255,0.07)',
									borderRadius: 12,
									padding: '16px 18px',
									marginBottom: 16,
								}}
							>
								<div
									style={{
										fontSize: 11,
										color: '#6b6b8a',
										textTransform: 'uppercase',
										letterSpacing: '0.1em',
										marginBottom: 8,
									}}
								>
									Tavsif
								</div>
								<p
									style={{
										color: '#c1c1d5',
										lineHeight: 1.7,
										fontSize: 15,
										margin: 0,
									}}
								>
									{product.description}
								</p>
							</div>
						)}

						{product.tags?.length > 0 && (
							<div
								style={{
									display: 'flex',
									flexWrap: 'wrap',
									gap: 8,
									marginBottom: 20,
								}}
							>
								{product.tags.map(tag => (
									<span
										key={tag}
										style={{
											background: 'rgba(99,102,241,0.1)',
											color: '#a78bfa',
											border: '1px solid rgba(99,102,241,0.2)',
											borderRadius: 20,
											padding: '4px 12px',
											fontSize: 12,
										}}
									>
										{tag}
									</span>
								))}
							</div>
						)}

						{view === 'detail' && (
							<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.97 }}
									onClick={() => setView('form')}
									disabled={product.stock === 0}
									style={{
										flex: 1,
										minWidth: 180,
										padding: '14px',
										background:
											product.stock === 0
												? 'rgba(99,102,241,0.3)'
												: 'linear-gradient(135deg,#6366f1,#a78bfa)',
										border: 'none',
										borderRadius: 12,
										color: 'white',
										fontSize: 16,
										fontWeight: 600,
										cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
										fontFamily: 'Syne, sans-serif',
										boxShadow: '0 0 20px rgba(99,102,241,0.25)',
									}}
								>
									🛒 Buyurtma berish
								</motion.button>
								<Link
									to='/products'
									style={{
										padding: '14px 20px',
										background: 'rgba(255,255,255,0.06)',
										border: '1px solid rgba(255,255,255,0.1)',
										borderRadius: 12,
										color: 'white',
										fontSize: 15,
										textDecoration: 'none',
										display: 'flex',
										alignItems: 'center',
									}}
								>
									← Orqaga
								</Link>
							</div>
						)}

						{/* Meta */}
						<div
							style={{
								display: 'flex',
								gap: 12,
								marginTop: 20,
								flexWrap: 'wrap',
							}}
						>
							{[
								{ label: 'Mahsulot ID', value: `#${product.id}` },
								hasMany && { label: 'Rasmlar', value: `${images.length} ta` },
								{
									label: "Qo'shilgan",
									value: new Date(product.created_at).toLocaleDateString(
										'uz-UZ',
									),
								},
							]
								.filter(Boolean)
								.map(item => (
									<div
										key={item.label}
										style={{
											background: 'rgba(255,255,255,0.03)',
											border: '1px solid rgba(255,255,255,0.07)',
											borderRadius: 10,
											padding: '10px 14px',
										}}
									>
										<div
											style={{
												fontSize: 10,
												color: '#6b6b8a',
												textTransform: 'uppercase',
												letterSpacing: '0.08em',
												marginBottom: 4,
											}}
										>
											{item.label}
										</div>
										<div style={{ fontWeight: 600, fontSize: 14 }}>
											{item.value}
										</div>
									</div>
								))}
						</div>
					</motion.div>
				</div>

				<AnimatePresence mode='wait'>
					{view === 'form' && (
						<motion.div
							key='form'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<OrderForm
								product={product}
								onSuccess={num => {
									setOrderNum(num)
									setView('success')
								}}
								onCancel={() => setView('detail')}
							/>
						</motion.div>
					)}
					{view === 'success' && (
						<motion.div
							key='success'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<OrderSuccess
								orderNum={orderNum}
								onClose={() => setView('detail')}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	)
}

function arrowStyle(side) {
	return {
		position: 'absolute',
		top: '50%',
		transform: 'translateY(-50%)',
		[side]: 10,
		background: 'rgba(0,0,0,0.5)',
		backdropFilter: 'blur(6px)',
		border: 'none',
		color: 'white',
		fontSize: 28,
		width: 38,
		height: 38,
		borderRadius: '50%',
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	}
}
