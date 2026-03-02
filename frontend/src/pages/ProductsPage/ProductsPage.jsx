import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import ProductCard from '../../components/ProductCard/ProductCard'
import styles from './Productspage.module.css'

export default function ProductsPage() {
	const [searchParams, setSearchParams] = useSearchParams()
	const [search, setSearch] = useState(searchParams.get('q') || '')
	const [debouncedSearch, setDebouncedSearch] = useState(search)

	const category = searchParams.get('category') || 'all'
	const page = parseInt(searchParams.get('page') || '1')

	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search), 400)
		return () => clearTimeout(t)
	}, [search])

	const { data, isLoading } = useQuery({
		queryKey: ['products', category, debouncedSearch, page],
		queryFn: () => {
			const params = new URLSearchParams({ page, limit: 12 })
			if (category !== 'all') params.set('category', category)
			if (debouncedSearch) params.set('search', debouncedSearch)
			return axios.get(`/api/products?${params}`).then(r => r.data)
		},
	})

	const { data: categories } = useQuery({
		queryKey: ['categories'],
		queryFn: () => axios.get('/api/categories').then(r => r.data),
	})

	const products = data?.products ?? []
	const totalPages = data?.totalPages ?? 1

	const setCategory = cat =>
		setSearchParams(prev => {
			const next = new URLSearchParams(prev)
			next.set('category', cat)
			next.set('page', '1')
			return next
		})

	const setPage = p =>
		setSearchParams(prev => {
			const next = new URLSearchParams(prev)
			next.set('page', p)
			return next
		})

	return (
		<div className={styles.page}>
			<Navbar />

			{/* ── Page Header ── */}
			<div className={styles.header}>
				<div className={styles.headerGlow} aria-hidden />
				<div className='container'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<nav className={styles.breadcrumb} aria-label='breadcrumb'>
							<Link to='/' className={styles.breadcrumbLink}>
								Bosh sahifa
							</Link>
							<span aria-hidden>→</span>
							<span className={styles.breadcrumbCurrent}>Mahsulotlar</span>
						</nav>

						<h1 className={styles.title}>Barcha Mahsulotlar</h1>

						{data && (
							<p className={styles.count}>{data.total} ta mahsulot topildi</p>
						)}
					</motion.div>
				</div>
			</div>

			{/* ── Main Content ── */}
			<div className={`container ${styles.container}`}>
				{/* Search & Filters */}
				<div className={styles.toolbar}>
					<div className={styles.searchWrapper}>
						<span className={styles.searchIcon} aria-hidden>
							🔍
						</span>
						<input
							type='text'
							placeholder='Mahsulot qidirish...'
							value={search}
							onChange={e => setSearch(e.target.value)}
							className={styles.searchInput}
						/>
					</div>

					<div className={styles.filters}>
						<FilterBtn
							active={category === 'all'}
							onClick={() => setCategory('all')}
						>
							Barchasi
						</FilterBtn>
						{(categories ?? []).map(cat => (
							<FilterBtn
								key={cat.id}
								active={category === cat.slug}
								onClick={() => setCategory(cat.slug)}
							>
								{cat.icon} {cat.name}
							</FilterBtn>
						))}
					</div>
				</div>

				{/* Products Grid */}
				{isLoading ? (
					<div className={styles.skeletonGrid}>
						{Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className={`shimmer ${styles.skeletonCard}`} />
						))}
					</div>
				) : products.length === 0 ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className={styles.empty}
					>
						<div className={styles.emptyIcon}>🔍</div>
						<h3 className={styles.emptyTitle}>Mahsulot topilmadi</h3>
						<p className={styles.emptySubtitle}>
							Boshqa kalit so'z yoki kategoriya tanlang
						</p>
					</motion.div>
				) : (
					<AnimatePresence mode='wait'>
						<div className='products-grid'>
							{products.map((product, i) => (
								<ProductCard key={product.id} product={product} index={i} />
							))}
						</div>
					</AnimatePresence>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className={styles.pagination}>
						<button
							className={`btn btn-outline ${styles.pageNavBtn}`}
							onClick={() => setPage(page - 1)}
							disabled={page === 1}
						>
							← Oldingi
						</button>

						{Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
							<FilterBtn
								key={p}
								active={p === page}
								onClick={() => setPage(p)}
								className={styles.pageNumBtn}
							>
								{p}
							</FilterBtn>
						))}

						<button
							className={`btn btn-outline ${styles.pageNavBtn}`}
							onClick={() => setPage(page + 1)}
							disabled={page === totalPages}
						>
							Keyingi →
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

/* ── Reusable active/inactive filter button ── */
function FilterBtn({ active, onClick, children, className = '' }) {
	return (
		<motion.button
			whileTap={{ scale: 0.95 }}
			onClick={onClick}
			className={`btn ${styles.filterBtn} ${active ? styles.filterBtnActive : styles.filterBtnIdle} ${className}`}
		>
			{children}
		</motion.button>
	)
}
