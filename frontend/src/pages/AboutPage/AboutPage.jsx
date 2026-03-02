import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Footer from '../../components/Footer/Footer'
import Navbar from '../../components/Navbar/Navbar'

import GiveStats from '../../const/aboudData.jsx'
import styles from './AboutPage.module.css'
const { STATS, VALUES, TEAM, TIMELINE } = GiveStats()

console.log(STATS)

/* ── animation helpers ── */
const FADE_UP = (delay = 0) => ({
	initial: { opacity: 0, y: 24 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.55, delay, ease: 'easeOut' },
})

const FADE_UP_VIEW = (delay = 0) => ({
	initial: { opacity: 0, y: 24 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true },
	transition: { duration: 0.55, delay, ease: 'easeOut' },
})

/* ════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════ */
export default function AboutPage() {
	return (
		<div className={styles.page}>
			<Navbar />

			{/* ── Hero ── */}
			<section className={styles.hero}>
				<div className={styles.orbLeft} aria-hidden />
				<div className={styles.orbRight} aria-hidden />

				<motion.div {...FADE_UP(0)}>
					<span className={styles.badge}>✦ Biz haqimizda</span>
				</motion.div>

				<motion.h1 className={styles.heroTitle} {...FADE_UP(0.1)}>
					Biznes kelajagi —<br />
					raqamda
				</motion.h1>

				<motion.p className={styles.heroSub} {...FADE_UP(0.2)}>
					Biz O'zbekistonning kichik va o'rta bizneslarini onlayn dunyoga olib
					chiqish uchun qurilgan platformamiz. Oddiy, tez va ishonchli.
				</motion.p>
			</section>

			{/* ── Stats row ── */}
			<div className={styles.statsRow}>
				{STATS.map((s, i) => (
					<motion.div
						key={s.label}
						className={styles.statCell}
						{...FADE_UP_VIEW(i * 0.08)}
					>
						<span className={styles.statValue}>{s.value}</span>
						<span className={styles.statLabel}>{s.label}</span>
					</motion.div>
				))}
			</div>

			{/* ── Mission ── */}
			<section className={styles.mission}>
				<motion.div className={styles.missionText} {...FADE_UP_VIEW(0)}>
					<span className={styles.sectionLabel}>Missiyamiz</span>
					<h2 className={styles.missionTitle}>
						Har bir biznesni <span>raqamli</span> qilish
					</h2>
					<p className={styles.missionBody}>
						Bizning maqsadimiz — texnologiya va internet imkoniyatlarini
						O'zbekiston bo'ylab har bir tadbirkorga yetkazish. Murakkab
						jarayonlarni soddalashtirish, vaqt va resurslarni tejaydigan
						yechimlar yaratish.
					</p>
					<p className={styles.missionBody}>
						Biz shunchaki dasturiy ta'minot yaratmaymiz — kelajakda
						raqobatbardosh bo'ladigan biznes ekotizimini qurmoqdamiz.
					</p>
				</motion.div>

				<motion.div className={styles.missionVisual} {...FADE_UP_VIEW(0.15)}>
					{[
						{
							icon: '📦',
							title: 'Oson mahsulot boshqaruvi',
							desc: "Yuzlab mahsulotni bir necha daqiqada qo'shing va tahrirlang.",
						},
						{
							icon: '📊',
							title: 'Real vaqtli tahlil',
							desc: "Savdo va foydalanuvchi ma'lumotlarini jonli kuzating.",
						},
						{
							icon: '🔔',
							title: 'Aqlli bildirishnomalar',
							desc: "Muhim hodisalar haqida darhol xabardor bo'ling.",
						},
						{
							icon: '🛡️',
							title: 'Bank darajasida himoya',
							desc: 'Barcha tranzaksiyalar 256-bit SSL bilan himoyalangan.',
						},
					].map((f, i) => (
						<div key={i} className={styles.missionFeature}>
							<div className={styles.featureIcon}>{f.icon}</div>
							<div className={styles.featureText}>
								<h4>{f.title}</h4>
								<p>{f.desc}</p>
							</div>
						</div>
					))}
				</motion.div>
			</section>

			{/* ── Values ── */}
			<section className={styles.valuesSection}>
				<div className={styles.sectionHeader}>
					<motion.div {...FADE_UP_VIEW(0)}>
						<span className={styles.sectionLabel}>Qadriyatlarimiz</span>
					</motion.div>
					<motion.h2 className={styles.sectionTitle} {...FADE_UP_VIEW(0.08)}>
						Nima uchun biz?
					</motion.h2>
					<motion.p className={styles.sectionSub} {...FADE_UP_VIEW(0.14)}>
						Har bir qaror foydalanuvchi manfaatini ko'zlab qabul qilinadi
					</motion.p>
				</div>

				<div className={styles.valuesGrid}>
					{VALUES.map((v, i) => (
						<motion.div
							key={i}
							className={styles.valueCard}
							{...FADE_UP_VIEW(i * 0.07)}
						>
							<span className={styles.valueEmoji}>{v.emoji}</span>
							<h3>{v.title}</h3>
							<p>{v.desc}</p>
						</motion.div>
					))}
				</div>
			</section>

			{/* ── Team ── */}
			<section className={styles.teamSection}>
				<div className={styles.sectionHeader}>
					<motion.div {...FADE_UP_VIEW(0)}>
						<span className={styles.sectionLabel}>Jamoa</span>
					</motion.div>
					<motion.h2 className={styles.sectionTitle} {...FADE_UP_VIEW(0.08)}>
						Ortimizda kim turibdi
					</motion.h2>
					<motion.p className={styles.sectionSub} {...FADE_UP_VIEW(0.14)}>
						Tajribali va ishtiyoqli mutaxassislar jamoasi
					</motion.p>
				</div>

				<div className={styles.teamGrid}>
					{TEAM.map((m, i) => (
						<motion.div
							key={i}
							className={styles.teamCard}
							{...FADE_UP_VIEW(i * 0.07)}
						>
							<div className={styles.teamAvatar} style={{ background: m.bg }}>
								{m.emoji}
							</div>
							<div className={styles.teamInfo}>
								<h3>{m.name}</h3>
								<p className={styles.teamRole}>{m.role}</p>
								<p className={styles.teamBio}>{m.bio}</p>
							</div>
						</motion.div>
					))}
				</div>
			</section>

			{/* ── Timeline ── */}
			<section className={styles.timelineSection}>
				<div className={styles.sectionHeader}>
					<motion.div {...FADE_UP_VIEW(0)}>
						<span className={styles.sectionLabel}>Tarix</span>
					</motion.div>
					<motion.h2 className={styles.sectionTitle} {...FADE_UP_VIEW(0.08)}>
						Bizning yo'limiz
					</motion.h2>
					<motion.p className={styles.sectionSub} {...FADE_UP_VIEW(0.14)}>
						G'oyadan milliy platformagacha
					</motion.p>
				</div>

				<div className={styles.timeline}>
					{TIMELINE.map((t, i) => (
						<motion.div
							key={i}
							className={styles.timelineItem}
							{...FADE_UP_VIEW(i * 0.1)}
						>
							<div className={styles.timelineDot}>{t.emoji}</div>
							<div className={styles.timelineContent}>
								<div className={styles.timelineYear}>{t.year}</div>
								<h3>{t.title}</h3>
								<p>{t.desc}</p>
							</div>
						</motion.div>
					))}
				</div>
			</section>

			{/* ── CTA ── */}
			<section className={styles.ctaBanner}>
				<motion.div className={styles.ctaInner} {...FADE_UP_VIEW(0)}>
					<h2 className={styles.ctaTitle}>Biznes safiga qo'shiling</h2>
					<p className={styles.ctaSub}>
						Bugun ro'yxatdan o'ting va 30 kun bepul foydalaning. Kredit karta
						talab etilmaydi.
					</p>
					<div className={styles.ctaButtons}>
						<Link to='/register' className={styles.btnPrimary}>
							Bepul boshlash →
						</Link>
						<Link to='/products' className={styles.btnOutline}>
							Mahsulotlarni ko'rish
						</Link>
					</div>
				</motion.div>
			</section>

			{/* ── Footer ── */}
			<footer>
				<Footer />
			</footer>
		</div>
	)
}
