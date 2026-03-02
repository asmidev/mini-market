import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Admindashboard.module.css'

function formatPrice(p) {
	return new Intl.NumberFormat('uz-UZ').format(p)
}

const EMPTY_PRODUCT = {
	name: '',
	description: '',
	price: '',
	old_price: '',
	image_url: '',
	category_id: '',
	stock: 0,
	featured: false,
	active: true,
	tags: '',
	memory_id: '',
	color_id: '',
}

const STAT_CARDS = stats => [
	{
		label: 'Jami mahsulot',
		value: stats?.totalProducts ?? 0,
		icon: '📦',
		color: '#6366f1',
	},
	{
		label: 'Kategoriyalar',
		value: stats?.totalCategories ?? 0,
		icon: '📂',
		color: '#a78bfa',
	},
	{
		label: 'Featured',
		value: stats?.featuredProducts ?? 0,
		icon: '⭐',
		color: '#f59e0b',
	},
	{
		label: 'Tugagan',
		value: stats?.outOfStock ?? 0,
		icon: '❌',
		color: '#ef4444',
	},
]

const TABS = editProduct => [
	{ id: 'products', label: '📦 Mahsulotlar' },
	{ id: 'add', label: editProduct ? '✏️ Tahrirlash' : "➕ Qo'shish" },
]

export default function AdminDashboard() {
	const { admin, logout } = useAuth()
	const navigate = useNavigate()
	const qc = useQueryClient()

	const [tab, setTab] = useState('products')
	const [editProduct, setEditProduct] = useState(null)
	const [form, setForm] = useState(EMPTY_PRODUCT)
	const [imageFiles, setImageFiles] = useState([])
	const [imagePreviews, setImagePreviews] = useState([])
	const [deleteConfirm, setDeleteConfirm] = useState(null)

	const { data: stats } = useQuery({
		queryKey: ['admin-stats'],
		queryFn: () => axios.get('/api/admin/stats').then(r => r.data),
	})

	const { data: products, isLoading } = useQuery({
		queryKey: ['admin-products'],
		queryFn: () => axios.get('/api/admin/products').then(r => r.data),
	})

	const { data: categories } = useQuery({
		queryKey: ['categories'],
		queryFn: () => axios.get('/api/categories').then(r => r.data),
	})

	const { data: memories } = useQuery({
		queryKey: ['memories'],
		queryFn: () => axios.get('/api/memories').then(r => r.data),
	})

	const { data: colors } = useQuery({
		queryKey: ['colors'],
		queryFn: () => axios.get('/api/colors').then(r => r.data),
	})

	const createMutation = useMutation({
		mutationFn: fd =>
			axios.post('/api/admin/products', fd, {
				headers: { 'Content-Type': 'multipart/form-data' },
			}),
		onSuccess: () => {
			toast.success("Mahsulot qo'shildi!")
			qc.invalidateQueries({ queryKey: ['admin-products'] })
			qc.invalidateQueries({ queryKey: ['admin-stats'] })
			resetForm()
			setTab('products')
		},
		onError: e => toast.error(e.response?.data?.error || 'Xato'),
	})

	const updateMutation = useMutation({
		mutationFn: ({ id, fd }) =>
			axios.put(`/api/admin/products/${id}`, fd, {
				headers: { 'Content-Type': 'multipart/form-data' },
			}),
		onSuccess: () => {
			toast.success('Yangilandi!')
			qc.invalidateQueries({ queryKey: ['admin-products'] })
			resetForm()
			setTab('products')
		},
		onError: e => toast.error(e.response?.data?.error || 'Xato'),
	})

	const deleteMutation = useMutation({
		mutationFn: id => axios.delete(`/api/admin/products/${id}`),
		onSuccess: () => {
			toast.success("O'chirildi")
			qc.invalidateQueries({ queryKey: ['admin-products'] })
			qc.invalidateQueries({ queryKey: ['admin-stats'] })
			setDeleteConfirm(null)
		},
	})

	const resetForm = () => {
		setForm(EMPTY_PRODUCT)
		setEditProduct(null)
		setImageFiles([])
		setImagePreviews([])
	}

	const openEdit = product => {
		setEditProduct(product)
		setForm({
			name: product.name ?? '',
			description: product.description ?? '',
			price: product.price ?? '',
			old_price: product.old_price ?? '',
			image_url: product.image_url ?? '',
			category_id: product.category_id ?? '',
			stock: product.stock ?? 0,
			featured: product.featured ?? false,
			active: product.active !== false,
			tags: (product.tags ?? []).join(', '),
			memory_id: product.memory_id ?? '',
			color_id: product.color_id ?? '',
		})
		const existing = product.images?.length
			? product.images
			: product.image_url
				? [product.image_url]
				: []
		setImagePreviews(existing)
		setImageFiles([])
		setTab('add')
	}

	const handleImageChange = e => {
		const files = Array.from(e.target.files)
		if (!files.length) return
		setImageFiles(prev => [...prev, ...files])
		files.forEach(file => {
			const reader = new FileReader()
			reader.onload = ev =>
				setImagePreviews(prev => [...prev, ev.target.result])
			reader.readAsDataURL(file)
		})
	}

	const removeImage = index => {
		setImagePreviews(prev => prev.filter((_, i) => i !== index))
		setImageFiles(prev => {
			const existingCount = imagePreviews.length - imageFiles.length
			const fileIndex = index - existingCount
			if (fileIndex < 0) return prev
			return prev.filter((_, i) => i !== fileIndex)
		})
	}

	const handleSubmit = e => {
		e.preventDefault()
		if (!form.name || !form.price) return toast.error('Nom va narx majburiy')
		const fd = new FormData()
		Object.entries(form).forEach(([k, v]) => {
			if (v !== '' && v !== null && v !== undefined) fd.append(k, v)
		})
		imageFiles.forEach(file => fd.append('images', file))
		if (editProduct) {
			updateMutation.mutate({ id: editProduct.id, fd })
		} else {
			createMutation.mutate(fd)
		}
	}

	const handleLogout = () => {
		logout()
		navigate('/')
		toast.success('Chiqildi')
	}

	const patchForm = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
	const patchFormBool = key => e =>
		setForm(f => ({ ...f, [key]: e.target.checked }))
	const isSubmitting = createMutation.isPending || updateMutation.isPending

	const selectedColor = (colors ?? []).find(
		c => String(c.id) === String(form.color_id),
	)

	return (
		<div className={styles.page}>
			{/* ───── Navbar ───── */}
			<header className={`glass ${styles.navbar}`}>
				<div className={styles.navBrand}>
					<div className={styles.navLogo}>⚙️</div>
					<span className={styles.navTitle}>Admin Panel</span>
					<span className={`badge badge-accent ${styles.navVersion}`}>
						v1.0
					</span>
				</div>
				<div className={styles.navActions}>
					<span className={styles.navUser}>👤 {admin?.username}</span>
					<button
						onClick={handleLogout}
						className={`btn btn-ghost ${styles.logoutBtn}`}
					>
						Chiqish
					</button>
				</div>
			</header>

			{/* ───── Main ───── */}
			<main className={styles.main}>
				{/* Stats */}
				<div className={styles.statsGrid}>
					{STAT_CARDS(stats).map((s, i) => (
						<motion.div
							key={s.label}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.05 }}
							className={styles.statCard}
						>
							<div className={styles.statOrb} style={{ background: s.color }} />
							<div className={styles.statIcon}>{s.icon}</div>
							<div className={styles.statValue} style={{ color: s.color }}>
								{s.value}
							</div>
							<div className={styles.statLabel}>{s.label}</div>
						</motion.div>
					))}
				</div>

				{/* Tabs */}
				<div className={styles.tabs}>
					{TABS(editProduct).map(t => (
						<button
							key={t.id}
							onClick={() => {
								if (t.id === 'products' && editProduct) resetForm()
								setTab(t.id)
							}}
							className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`}
						>
							{t.label}
						</button>
					))}
				</div>

				<AnimatePresence mode='wait'>
					{/* ── Products List ── */}
					{tab === 'products' && (
						<motion.div
							key='products'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							{isLoading ? (
								<div className={styles.skeletonList}>
									{Array.from({ length: 5 }).map((_, i) => (
										<div key={i} className={`shimmer ${styles.skeletonRow}`} />
									))}
								</div>
							) : (
								<div className={styles.table}>
									<div className={styles.tableHeader}>
										<span>Rasm</span>
										<span>Nomi</span>
										<span>Narxi</span>
										<span>💾 Xotira</span>
										<span>🎨 Rang</span>
										<span>Stok</span>
										<span>Status</span>
										<span>Amallar</span>
									</div>

									{!products?.length ? (
										<div className={styles.tableEmpty}>
											<div className={styles.tableEmptyIcon}>📦</div>
											<p>Hali mahsulot qo'shilmagan</p>
											<button
												className='btn btn-primary'
												style={{ marginTop: 16 }}
												onClick={() => setTab('add')}
											>
												Birinchi mahsulotni qo'shish →
											</button>
										</div>
									) : (
										products.map((p, i) => (
											<motion.div
												key={p.id}
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: i * 0.02 }}
												className={styles.tableRow}
												whileHover={{
													backgroundColor: 'rgba(99,102,241,0.03)',
												}}
											>
												<img
													src={
														p.image_url ||
														'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100'
													}
													alt={p.name}
													className={styles.productThumb}
													onError={e => {
														e.target.src =
															'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100'
													}}
												/>
												<div className={styles.productInfo}>
													<div className={styles.productName}>{p.name}</div>
													<div className={styles.productCategory}>
														{p.category_name || 'Kategoriyasiz'}
													</div>
												</div>
												<div className={styles.productPrice}>
													<div className={styles.priceMain}>
														{formatPrice(p.price)} so'm
													</div>
													{p.old_price && (
														<div className={styles.priceOld}>
															{formatPrice(p.old_price)} so'm
														</div>
													)}
												</div>
												<div
													style={{
														fontSize: 12,
														color: 'var(--text-secondary)',
													}}
												>
													{p.memory_name || '—'}
												</div>
												<div
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: 6,
													}}
												>
													{p.color_hex && (
														<div
															style={{
																width: 12,
																height: 12,
																borderRadius: '50%',
																background: p.color_hex,
																border: '1px solid rgba(255,255,255,0.2)',
																flexShrink: 0,
															}}
														/>
													)}
													<span
														style={{
															fontSize: 12,
															color: 'var(--text-secondary)',
														}}
													>
														{p.color_name || '—'}
													</span>
												</div>
												<span
													className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock < 10 ? 'badge-warning' : 'badge-success'}`}
												>
													{p.stock}
												</span>
												<span
													className={`badge ${p.active ? 'badge-success' : 'badge-danger'}`}
												>
													{p.active ? 'Aktiv' : 'Yashirin'}
												</span>
												<div className={styles.rowActions}>
													<button
														className={`btn btn-outline ${styles.actionBtn}`}
														onClick={() => openEdit(p)}
													>
														✏️
													</button>
													<button
														className={`btn btn-danger ${styles.actionBtn}`}
														onClick={() => setDeleteConfirm(p)}
													>
														🗑️
													</button>
												</div>
											</motion.div>
										))
									)}
								</div>
							)}
						</motion.div>
					)}

					{/* ── Add / Edit Form ── */}
					{tab === 'add' && (
						<motion.div
							key='add'
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
						>
							<div className={styles.formCard}>
								<h2 className={styles.formTitle}>
									{editProduct
										? `"${editProduct.name}" ni tahrirlash`
										: "Yangi mahsulot qo'shish"}
								</h2>

								<form onSubmit={handleSubmit}>
									<div className={styles.formGrid}>
										<FormField label='Mahsulot nomi *'>
											<input
												type='text'
												placeholder='iPhone 15 Pro'
												value={form.name}
												onChange={patchForm('name')}
												required
											/>
										</FormField>

										<FormField label='Kategoriya'>
											<select
												value={form.category_id}
												onChange={patchForm('category_id')}
											>
												<option value=''>Kategoriya tanlang</option>
												{(categories ?? []).map(c => (
													<option key={c.id} value={c.id}>
														{c.icon} {c.name}
													</option>
												))}
											</select>
										</FormField>

										<FormField label="Narxi (so'm) *">
											<input
												type='number'
												placeholder='1299000'
												value={form.price}
												onChange={patchForm('price')}
												required
												min={0}
											/>
										</FormField>

										<FormField label='Eski narxi (ixtiyoriy)'>
											<input
												type='number'
												placeholder='1599000'
												value={form.old_price}
												onChange={patchForm('old_price')}
												min={0}
											/>
										</FormField>

										<FormField label='Stok miqdori'>
											<input
												type='number'
												value={form.stock}
												onChange={patchForm('stock')}
												min={0}
											/>
										</FormField>

										<FormField label='Teglar (vergul bilan)'>
											<input
												type='text'
												placeholder='yangi, chegirma, premium'
												value={form.tags}
												onChange={patchForm('tags')}
											/>
										</FormField>

										{/* ── Xotira ── */}
										<FormField label='💾 Xotira (RAM / Storage)'>
											<select
												value={form.memory_id}
												onChange={patchForm('memory_id')}
											>
												<option value=''>— Tanlang —</option>
												{(memories ?? []).map(m => (
													<option key={m.id} value={m.id}>
														{m.name}
													</option>
												))}
											</select>
										</FormField>

										{/* ── Rang ── */}
										<FormField label='🎨 Rang'>
											<select
												value={form.color_id}
												onChange={patchForm('color_id')}
											>
												<option value=''>— Tanlang —</option>
												{(colors ?? []).map(c => (
													<option key={c.id} value={c.id}>
														{c.icon} {c.name}
													</option>
												))}
											</select>
											{selectedColor && (
												<div
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: 8,
														marginTop: 8,
													}}
												>
													<div
														style={{
															width: 20,
															height: 20,
															borderRadius: '50%',
															background: selectedColor.color,
															border: '2px solid rgba(255,255,255,0.2)',
															flexShrink: 0,
														}}
													/>
													<span
														style={{
															fontSize: 13,
															color: 'var(--text-secondary)',
														}}
													>
														{selectedColor.name}
													</span>
												</div>
											)}
										</FormField>
									</div>

									<div className={styles.formFullWidth}>
										<FormField label='Tavsif'>
											<textarea
												placeholder="Mahsulot haqida batafsil ma'lumot..."
												value={form.description}
												onChange={patchForm('description')}
												rows={4}
												className={styles.textarea}
											/>
										</FormField>
									</div>

									{/* ── Rasm yuklash ── */}
									<div className={styles.imageSection}>
										<div className={styles.imageSectionHeader}>
											<span className={styles.fieldLabel}>
												📸 Rasmlar ({imagePreviews.length} ta)
											</span>
											{imagePreviews.length > 0 && (
												<button
													type='button'
													className={styles.clearAllBtn}
													onClick={() => {
														setImageFiles([])
														setImagePreviews([])
													}}
												>
													Hammasini tozalash
												</button>
											)}
										</div>

										<label className={styles.dropZone}>
											<input
												type='file'
												accept='image/*'
												multiple
												onChange={handleImageChange}
												className={styles.fileInputHidden}
											/>
											<div className={styles.dropZoneContent}>
												<span className={styles.dropZoneIcon}>🖼️</span>
												<span className={styles.dropZoneText}>
													Rasmlarni tanlang yoki shu yerga tashlang
												</span>
												<span className={styles.dropZoneHint}>
													PNG, JPG, WEBP — maksimal 10 ta
												</span>
											</div>
										</label>

										<FormField label="Yoki URL orqali qo'shing">
											<div className={styles.urlRow}>
												<input
													type='url'
													placeholder='https://example.com/image.jpg'
													value={form.image_url}
													onChange={patchForm('image_url')}
												/>
												<button
													type='button'
													className={styles.urlAddBtn}
													onClick={() => {
														if (!form.image_url) return
														setImagePreviews(prev => [...prev, form.image_url])
														setForm(f => ({ ...f, image_url: '' }))
													}}
												>
													Qo'shish
												</button>
											</div>
										</FormField>

										{imagePreviews.length > 0 && (
											<div className={styles.previewGrid}>
												{imagePreviews.map((src, i) => (
													<div key={i} className={styles.previewItem}>
														{i === 0 && (
															<span className={styles.mainBadge}>Asosiy</span>
														)}
														<img
															src={src}
															alt={`Rasm ${i + 1}`}
															className={styles.previewImg}
															onError={e => (e.target.style.display = 'none')}
														/>
														<button
															type='button'
															className={styles.removeBtn}
															onClick={() => removeImage(i)}
															aria-label="Rasmni o'chirish"
														>
															✕
														</button>
													</div>
												))}
											</div>
										)}
									</div>

									<div className={styles.checkboxGroup}>
										{[
											{ key: 'featured', label: '⭐ Featured mahsulot' },
											{ key: 'active', label: "✅ Aktiv (ko'rinadigan)" },
										].map(cb => (
											<label key={cb.key} className={styles.checkboxLabel}>
												<input
													type='checkbox'
													checked={form[cb.key]}
													onChange={patchFormBool(cb.key)}
													className={styles.checkbox}
												/>
												<span className={styles.checkboxText}>{cb.label}</span>
											</label>
										))}
									</div>

									<div className={styles.formActions}>
										<motion.button
											type='submit'
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.97 }}
											className={`btn btn-primary ${styles.submitBtn}`}
											disabled={isSubmitting}
										>
											{isSubmitting ? (
												<>
													<span
														className='spinner'
														style={{ width: 16, height: 16, borderWidth: 2 }}
													/>{' '}
													Saqlanmoqda...
												</>
											) : editProduct ? (
												'✏️ Yangilash'
											) : (
												"➕ Qo'shish"
											)}
										</motion.button>
										<button
											type='button'
											className='btn btn-outline'
											onClick={() => {
												resetForm()
												setTab('products')
											}}
										>
											Bekor qilish
										</button>
									</div>
								</form>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</main>

			{/* ───── Delete Modal ───── */}
			<AnimatePresence>
				{deleteConfirm && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className={styles.modalOverlay}
						onClick={e =>
							e.target === e.currentTarget && setDeleteConfirm(null)
						}
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className={`glass ${styles.modal}`}
						>
							<div className={styles.modalIcon}>🗑️</div>
							<h3 className={styles.modalTitle}>O'chirishni tasdiqlang</h3>
							<p className={styles.modalBody}>
								"<strong>{deleteConfirm.name}</strong>" mahsulotini
								o'chirasizmi? Bu amalni qaytarib bo'lmaydi.
							</p>
							<div className={styles.modalActions}>
								<button
									className='btn btn-outline'
									onClick={() => setDeleteConfirm(null)}
								>
									Bekor qilish
								</button>
								<button
									className='btn btn-danger'
									onClick={() => deleteMutation.mutate(deleteConfirm.id)}
									disabled={deleteMutation.isPending}
								>
									{deleteMutation.isPending
										? "O'chirilmoqda..."
										: "✓ Ha, o'chirish"}
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

function FormField({ label, children }) {
	return (
		<div className={styles.field}>
			<label className={styles.fieldLabel}>{label}</label>
			{children}
		</div>
	)
}
