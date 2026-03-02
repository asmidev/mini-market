import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const SOCIALS = [
	{ emoji: '✈️', label: 'Telegram', href: 't.me/@asmi_dev' },
	{ emoji: '📸', label: 'Instagram', href: '#' },
	{ emoji: '▶️', label: 'YouTube', href: '#' },
	{ emoji: '💬', label: 'Facebook', href: '#' },
]

const LINKS = [
	{
		title: 'Platforma',
		items: [
			{ label: 'Mahsulotlar', to: '/products' },
			{ label: 'Kategoriyalar', to: '/products?category=all' },
		],
	},
	{
		title: 'Kompaniya',
		items: [
			// { label: 'Biz haqimizda', to: '/about' },
			{ label: 'Aloqa', to: '/contact' },
		],
	},
	{
		title: 'Admin',
		items: [{ label: 'Admin panel', to: '/admin/login' }],
	},
]

export default function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.footerGrid}>
				{/* Brand */}
				<div className={styles.footerBrandCol}>
					<div className={styles.footerBrand}>✦ BIZNES</div>
					<p className={styles.footerTagline}>
						Kichik bizneslar uchun eng qulay onlayn savdo platformasi.
					</p>
					<div className={styles.footerSocials}>
						{SOCIALS.map(s => (
							<a
								key={s.label}
								href={s.href}
								className={styles.footerSocialBtn}
								aria-label={s.label}
							>
								{s.emoji}
							</a>
						))}
					</div>
				</div>

				{/* Link columns */}
				{LINKS.map(col => (
					<div key={col.title} className={styles.footerCol}>
						<div className={styles.footerColTitle}>{col.title}</div>
						{col.items.map(item => (
							<Link key={item.to} to={item.to} className={styles.footerLink}>
								{item.label}
							</Link>
						))}
					</div>
				))}
			</div>

			<div className={styles.footerBottom}>
				<span>© 2026 Biznes Platform. Barcha huquqlar himoyalangan.</span>
				<span>asmitech.uz</span>
			</div>
		</footer>
	)
}
