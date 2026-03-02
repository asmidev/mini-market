import { useEffect, useState } from 'react'
import './iphone.css'

/* ─── Bar chart data ─────────────────────────── */
const BAR_DATA = [
	{ h: '60%', color: 'rgba(139,92,246,0.38)' },
	{ h: '78%', color: 'rgba(139,92,246,0.38)' },
	{ h: '42%', color: 'rgba(139,92,246,0.38)' },
	{ h: '92%', color: 'linear-gradient(180deg,#60a5fa,#3b82f6)', glow: true },
	{ h: '68%', color: 'rgba(139,92,246,0.38)' },
	{ h: '84%', color: 'linear-gradient(180deg,#a78bfa,#7c3aed)' },
	{ h: '52%', color: 'rgba(139,92,246,0.38)' },
]

/* ─── Automation pipeline ─────────────────────── */
const NODES = [
	{ label: 'Buyurtma', icon: '📦' },
	{ label: "To'lov", icon: '💳' },
	{ label: 'Ombor', icon: '🏭' },
	{ label: 'Yetkazib', icon: '🚚' },
	{ label: 'Tasdiq', icon: '✅' },
]

const ORDERS = [
	{ name: 'iPhone 15 Pro', price: '18 990 000', status: '✅' },
	{ name: 'MacBook Air M3', price: '32 500 000', status: '🔄' },
	{ name: 'AirPods Pro', price: '5 490 000', status: '🚚' },
]

/* ─── Sub-components ──────────────────────────── */

function AnalyticsCard() {
	return (
		<div className='ep-analytics'>
			<div className='ep-analytics-top'>
				<div>
					<div className='ep-analytics-label'>Savdo Tahlili</div>
					<div className='ep-analytics-value'>₿ 48,290</div>
				</div>
				<div className='ep-analytics-badge'>
					<span>↑</span> 23.5%
				</div>
			</div>

			<div className='ep-bars'>
				{BAR_DATA.map((b, i) => (
					<div
						key={i}
						className='ep-bar'
						style={{
							height: b.h,
							background: b.color,
							animationDelay: `${i * 0.08}s`,
							boxShadow: b.glow ? '0 0 10px rgba(96,165,250,0.5)' : 'none',
						}}
					/>
				))}
			</div>

			<div className='ep-tabs'>
				{['Oylik', 'Haftalik', 'Kunlik'].map((t, i) => (
					<div key={i} className={`ep-tab ${i === 0 ? 'active' : 'inactive'}`}>
						{t}
					</div>
				))}
			</div>
		</div>
	)
}

function AutomationNodes() {
	const W = 272
	const step = W / (NODES.length - 1)

	return (
		<div className='ep-automation'>
			<div className='ep-automation-label'>Avtomatlashtirish</div>
			<svg width='100%' height='72' viewBox={`0 0 ${W} 72`} overflow='visible'>
				<defs>
					<linearGradient id='lineGrad' x1='0%' y1='0%' x2='100%' y2='0%'>
						<stop offset='0%' stopColor='#7c3aed' />
						<stop offset='100%' stopColor='#3b82f6' />
					</linearGradient>
					<filter id='glow'>
						<feGaussianBlur stdDeviation='2' result='blur' />
						<feMerge>
							<feMergeNode in='blur' />
							<feMergeNode in='SourceGraphic' />
						</feMerge>
					</filter>
				</defs>

				<line
					x1='0'
					y1='30'
					x2={W}
					y2='30'
					stroke='url(#lineGrad)'
					strokeWidth='1.2'
					strokeDasharray='5 4'
					opacity='0.5'
				/>

				{NODES.map((n, i) => {
					const cx = i * step
					return (
						<g key={i}>
							<rect
								x={cx - 18}
								y={16}
								width={36}
								height={28}
								rx={8}
								fill={`rgba(88,28,220,${0.25 + i * 0.04})`}
								stroke='rgba(139,92,246,0.45)'
								strokeWidth={1}
								filter='url(#glow)'
							/>
							<text
								x={cx}
								y={34}
								textAnchor='middle'
								fontSize='11'
								style={{ userSelect: 'none' }}
							>
								{n.icon}
							</text>
							<text
								x={cx}
								y={62}
								textAnchor='middle'
								fill='rgba(255,255,255,0.38)'
								fontSize='6'
								style={{ userSelect: 'none' }}
							>
								{n.label}
							</text>
							<circle
								cx={cx}
								cy={16}
								r={3}
								fill='#60a5fa'
								className='blink'
								style={{
									filter: 'drop-shadow(0 0 4px #60a5fa)',
									animationDelay: `${i * 0.3}s`,
								}}
							/>
						</g>
					)
				})}
			</svg>
		</div>
	)
}

function CartWidget() {
	const [count, setCount] = useState(0)
	const [total, setTotal] = useState(0)

	useEffect(() => {
		const t = setTimeout(() => {
			const iv = setInterval(() => {
				setCount(c => {
					if (c >= 847) {
						clearInterval(iv)
						return 847
					}
					return c + Math.ceil(Math.random() * 18)
				})
				setTotal(v => {
					if (v >= 124580) {
						clearInterval(iv)
						return 124580
					}
					return v + Math.ceil(Math.random() * 1800)
				})
			}, 45)
			return () => clearInterval(iv)
		}, 400)
		return () => clearTimeout(t)
	}, [])

	return (
		<div className='ep-cart-section'>
			<div className='ep-total-card'>
				<div>
					<div className='ep-total-sublabel'>Jami Savdo</div>
					<div className='ep-total-value'>{total.toLocaleString()} so'm</div>
					<div className='ep-live-dot'>
						<span />
						<p>Jonli sinxronlash</p>
					</div>
				</div>

				<div className='ep-cart-icon'>
					<svg width='56' height='56' viewBox='0 0 60 60' fill='none'>
						<defs>
							<linearGradient id='cartGrad' x1='0' y1='0' x2='60' y2='60'>
								<stop stopColor='#7c3aed' />
								<stop offset='1' stopColor='#3b82f6' />
							</linearGradient>
						</defs>
						<path
							d='M8 10h6l8 24h22l4-16H16'
							stroke='url(#cartGrad)'
							strokeWidth='3.5'
							strokeLinecap='round'
							strokeLinejoin='round'
							fill='none'
						/>
						<circle cx='24' cy='40' r='4' fill='url(#cartGrad)' />
						<circle cx='38' cy='40' r='4' fill='url(#cartGrad)' />
					</svg>
				</div>
			</div>

			<div className='ep-stats'>
				<div className='ep-stat'>
					<div className='ep-stat-emoji'>📋</div>
					<div className='ep-stat-value'>{count}</div>
					<div className='ep-stat-label'>Buyurtmalar</div>
				</div>
				<div className='ep-stat'>
					<div className='ep-stat-emoji'>🛍️</div>
					<div className='ep-stat-value'>2,847</div>
					<div className='ep-stat-label'>Mahsulotlar</div>
				</div>
			</div>

			<div className='ep-orders'>
				<div className='ep-orders-label'>So'nggi Buyurtmalar</div>
				{ORDERS.map((o, i) => (
					<div key={i} className='ep-order-row'>
						<span className='ep-order-name'>{o.name}</span>
						<span>
							<span className='ep-order-price'>{o.price}</span>
							<span className='ep-order-status'>{o.status}</span>
						</span>
					</div>
				))}
			</div>
		</div>
	)
}

/* ─── Main export ─────────────────────────────── */
export default function EcommercePhone() {
	return (
		<div className='ep-scene'>
			<div className='ep-phone'>
				{/* Physical frame */}
				<div className='ep-frame'>
					<div className='ep-btn ep-btn-mute' />
					<div className='ep-btn ep-btn-vol1' />
					<div className='ep-btn ep-btn-vol2' />
					<div className='ep-btn ep-btn-power' />
				</div>

				{/* Screen */}
				<div className='ep-screen'>
					<div className='ep-screen-bg' />
					<div className='ep-island'>
						<div className='ep-island-camera' />
						<div className='ep-island-sensor' />
					</div>

					<div className='ep-content'>
						<div className='ep-status'>
							<span>9:41</span>
							<span>●●●● WiFi 🔋</span>
						</div>

						<div className='ep-header'>
							<div>
								<div className='ep-header-greeting'>Salom, Admin 👋</div>
								<div className='ep-header-title'>DokonBot Pro</div>
							</div>
							<div className='ep-header-icon'>🛒</div>
						</div>

						<AnalyticsCard />
						<AutomationNodes />
						<CartWidget />
					</div>
				</div>
			</div>
		</div>
	)
}
