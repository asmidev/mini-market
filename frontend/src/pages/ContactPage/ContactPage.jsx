import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Footer from '../../components/Footer/Footer'
import Navbar from '../../components/Navbar/Navbar'
import styles from './ContactPage.module.css'

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

/* ── data ── */
const INFO_CARDS = [
	{
		icon: '📍',
		label: 'Manzil',
		value: 'Toshkent, Yunusobod tumani',
		desc: "Amir Temur shoh ko'chasi, 108-bino",
	},
	{
		icon: '📞',
		label: 'Telefon',
		value: '+998 71 123 45 67',
		desc: 'Du-Ju: 09:00 – 18:00',
		href: 'tel:+998711234567',
	},
	{
		icon: '✉️',
		label: 'Email',
		value: 'info@biznes.uz',
		desc: '24 soat ichida javob beramiz',
		href: 'mailto:info@biznes.uz',
	},
	{
		icon: '⏰',
		label: 'Ish vaqti',
		value: 'Dushanba – Juma',
		desc: '09:00 – 18:00 (UTC+5)',
	},
]

const SOCIALS = [
	{ emoji: '✈️', name: 'Telegram', href: '#' },
	{ emoji: '📸', name: 'Instagram', href: '#' },
	{ emoji: '▶️', name: 'YouTube', href: '#' },
	{ emoji: '💬', name: 'Facebook', href: '#' },
]

const TOPICS = [
	'Umumiy savol',
	'Texnik yordam',
	"To'lov masalasi",
	'Hamkorlik taklifi',
	'Shikoyat',
	'Boshqa',
]

const FAQS = [
	{
		q: 'Savolimga qancha vaqt ichida javob berasiz?',
		a: 'Barcha murojaatlarga 24 soat ichida javob beramiz. Texnik muammolar uchun 4-6 soat ichida murojaat qilinadi.',
	},
	{
		q: "Platformani bepul sinab ko'rish mumkinmi?",
		a: "Ha, ro'yxatdan o'tganingizdan so'ng 30 kun bepul foydalanishingiz mumkin. Kredit karta talab etilmaydi.",
	},
	{
		q: "Qo'llab-quvvatlash xizmati qaysi tillarda ishlaydi?",
		a: "Hozirda O'zbek, Rus va Ingliz tillarida yordam beramiz. Yaqin kelajakda Qoraqalpoq tili ham qo'shiladi.",
	},
	{
		q: 'Texnik muammo yuzaga kelsa nima qilaman?',
		a: 'Telegram kanalimizga yozing yoki support@biznes.uz manziliga xat yuboring. 24/7 monitoring jamoamiz mavjud.',
	},
	{
		q: "Ma'lumotlarim xavfsizmi?",
		a: "Barcha ma'lumotlar 256-bit SSL shifrlash bilan himoyalangan. Shaxsiy ma'lumotlar hech qachon uchinchi shaxslarga uzatilmaydi.",
	},
]

/* ════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════ */
export default function ContactPage() {
	const [form, setForm] = useState({
		name: '',
		email: '',
		phone: '',
		topic: '',
		message: '',
	})
	const [loading, setLoading] = useState(false)
	const [sent, setSent] = useState(false)
	const [openFaq, setOpenFaq] = useState(null)

	const handleChange = e => {
		setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
	}

	const handleSubmit = async e => {
		e.preventDefault()
		setLoading(true)
		await axios.post('/api/contact', form)
		await new Promise(r => setTimeout(r, 1400))
		setLoading(false)
		setSent(true)
	}

	const toggleFaq = i => setOpenFaq(prev => (prev === i ? null : i))

	return (
		<div className={styles.page}>
			<Navbar />

			{/* ── Hero ── */}
			<section className={styles.hero}>
				<div className={styles.orbLeft} aria-hidden />
				<div className={styles.orbRight} aria-hidden />

				<motion.div {...FADE_UP(0)}>
					<span className={styles.badge}>✦ Biz bilan bog'laning</span>
				</motion.div>

				<motion.h1 className={styles.heroTitle} {...FADE_UP(0.1)}>
					Savollaringiz bormi?
				</motion.h1>

				<motion.p className={styles.heroSub} {...FADE_UP(0.2)}>
					Har qanday savol yoki takliflaringiz bo'lsa — yozing. Jamoamiz 24 soat
					ichida javob beradi.
				</motion.p>
			</section>

			{/* ── Main: info + form ── */}
			<div className={styles.main}>
				{/* Info side */}
				<motion.div className={styles.infoSide} {...FADE_UP_VIEW(0)}>
					<div className={styles.infoGrid}>
						{INFO_CARDS.map((c, i) => (
							<motion.div
								key={i}
								className={styles.infoCard}
								{...FADE_UP_VIEW(i * 0.07)}
							>
								<div className={styles.infoIcon}>{c.icon}</div>
								<div className={styles.infoContent}>
									<h3>{c.label}</h3>
									{c.href ? (
										<a href={c.href} className={styles.infoValue}>
											{c.value}
										</a>
									) : (
										<p className={styles.infoValue}>{c.value}</p>
									)}
									<p className={styles.infoDesc}>{c.desc}</p>
								</div>
							</motion.div>
						))}
					</div>

					{/* Socials */}
					<motion.div {...FADE_UP_VIEW(0.3)} style={{ marginTop: 20 }}>
						<p className={styles.socialsLabel}>Ijtimoiy tarmoqlar</p>
						<div className={styles.socials}>
							{SOCIALS.map(s => (
								<a key={s.name} href={s.href} className={styles.socialBtn}>
									<span>{s.emoji}</span>
									<span>{s.name}</span>
								</a>
							))}
						</div>
					</motion.div>
				</motion.div>

				{/* Form card */}
				<motion.div className={styles.formCard} {...FADE_UP_VIEW(0.1)}>
					<AnimatePresence mode='wait'>
						{sent ? (
							<motion.div
								key='success'
								className={styles.successBox}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.4 }}
							>
								<span className={styles.successEmoji}>🎉</span>
								<h3 className={styles.successTitle}>Xabaringiz yuborildi!</h3>
								<p className={styles.successDesc}>
									24 soat ichida {form.email} manzilingizga javob yuboramiz.
								</p>
								<button
									className={styles.submitBtn}
									style={{ marginTop: 8, maxWidth: 240 }}
									onClick={() => {
										setSent(false)
										setForm({
											name: '',
											email: '',
											phone: '',
											topic: '',
											message: '',
										})
									}}
								>
									Yana yuborish
								</button>
							</motion.div>
						) : (
							<motion.form
								key='form'
								onSubmit={handleSubmit}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<h2 className={styles.formTitle}>Xabar yuborish</h2>
								<p className={styles.formSubtitle}>
									Barcha maydonlarni to'ldiring, tez javob beramiz
								</p>

								{/* Name + Phone */}
								<div className={styles.formRow}>
									<div className={styles.fieldGroup}>
										<label className={styles.fieldLabel}>Ism *</label>
										<input
											className={styles.fieldInput}
											name='name'
											value={form.name}
											onChange={handleChange}
											placeholder='Ismingiz'
											required
										/>
									</div>
									<div className={styles.fieldGroup}>
										<label className={styles.fieldLabel}>Telefon</label>
										<input
											className={styles.fieldInput}
											name='phone'
											value={form.phone}
											onChange={handleChange}
											placeholder='+998 90 123 45 67'
											type='tel'
										/>
									</div>
								</div>

								{/* Email + Topic */}
								<div className={styles.formRow}>
									<div className={styles.fieldGroup}>
										<label className={styles.fieldLabel}>Email *</label>
										<input
											className={styles.fieldInput}
											name='email'
											value={form.email}
											onChange={handleChange}
											placeholder='email@example.com'
											type='email'
											required
										/>
									</div>
									<div className={styles.fieldGroup}>
										<label className={styles.fieldLabel}>Mavzu</label>
										<select
											className={styles.fieldSelect}
											name='topic'
											value={form.topic}
											onChange={handleChange}
										>
											<option value=''>Tanlang...</option>
											{TOPICS.map(t => (
												<option key={t} value={t}>
													{t}
												</option>
											))}
										</select>
									</div>
								</div>

								{/* Message */}
								<div className={styles.fieldGroup} style={{ marginBottom: 16 }}>
									<label className={styles.fieldLabel}>Xabar *</label>
									<textarea
										className={styles.fieldTextarea}
										name='message'
										value={form.message}
										onChange={handleChange}
										placeholder='Savolingizni yoki xabaringizni yozing...'
										required
									/>
								</div>

								<button
									type='submit'
									className={styles.submitBtn}
									disabled={loading}
								>
									{loading ? '⏳ Yuborilmoqda...' : 'Xabar yuborish →'}
								</button>
							</motion.form>
						)}
					</AnimatePresence>
				</motion.div>
			</div>

			{/* ── Map / Location ── */}
			<motion.div className={styles.mapSection} {...FADE_UP_VIEW(0)}>
				<div className={styles.mapCard}>
					<div className={styles.mapHeader}>
						<div>
							<h3 className={styles.mapTitle}>📍 Ofisimiz manzili</h3>
							<p className={styles.mapAddress}>
								Toshkent, Yunusobod tumani, Amir Temur shoh ko'chasi, 108
							</p>
						</div>
					</div>
					<div className={styles.mapPlaceholder}>
						<span className={styles.mapPin}>📍</span>
						<span>Toshkent, Yunusobod</span>
						<a
							href='https://maps.google.com/?q=Tashkent'
							target='_blank'
							rel='noopener noreferrer'
							style={{
								color: '#a78bfa',
								fontSize: 13,
								textDecoration: 'none',
								marginTop: 4,
							}}
						>
							Google Maps da ko'rish →
						</a>
					</div>
				</div>
			</motion.div>

			{/* ── FAQ ── */}
			<section className={styles.faqSection}>
				<div className={styles.faqInner}>
					<motion.span className={styles.sectionLabel} {...FADE_UP_VIEW(0)}>
						Ko'p so'raladigan savollar
					</motion.span>
					<motion.h2 className={styles.sectionTitle} {...FADE_UP_VIEW(0.08)}>
						Javoblar shu yerda
					</motion.h2>
					<motion.p className={styles.sectionSub} {...FADE_UP_VIEW(0.14)}>
						Topmasangiz — yuqoridagi forma orqali yuboring
					</motion.p>

					<div className={styles.faqList}>
						{FAQS.map((faq, i) => (
							<motion.div
								key={i}
								className={`${styles.faqItem} ${openFaq === i ? styles.open : ''}`}
								{...FADE_UP_VIEW(i * 0.06)}
							>
								<button
									className={styles.faqQuestion}
									onClick={() => toggleFaq(i)}
									type='button'
								>
									<span>{faq.q}</span>
									<span className={styles.faqChevron}>▼</span>
								</button>
								<AnimatePresence initial={false}>
									{openFaq === i && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: 'auto', opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.25, ease: 'easeInOut' }}
											style={{ overflow: 'hidden' }}
										>
											<p className={styles.faqAnswer}>{faq.a}</p>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* ── Footer ── */}
			<footer>
				<Footer />
			</footer>
		</div>
	)
}
