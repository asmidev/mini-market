/* ── data ── */

const GiveStats = () => {
	const STATS = [
		{ value: '2 400+', label: 'Foydalanuvchi' },
		{ value: '18 000+', label: 'Mahsulot' },
		{ value: '99.9%', label: 'Ishonchlilik' },
		{ value: '2021', label: 'Tashkil etilgan' },
	]

	const VALUES = [
		{
			emoji: '🚀',
			title: 'Tezlik va samaradorlik',
			desc: 'Har bir funksiya tezlik bilan ishlashi uchun optimallashtirilgan. Vaqtingiz bizning eng muhim resursimiz.',
		},
		{
			emoji: '🔒',
			title: 'Xavfsizlik birinchi',
			desc: "Ma'lumotlaringiz xavfsizligi uchun zamonaviy shifrlash va autentifikatsiya tizimlaridan foydalanamiz.",
		},
		{
			emoji: '🤝',
			title: 'Hamkorlik',
			desc: "Foydalanuvchilar bilan birga o'samiz. Har bir fikr va taklif platformani yaxshilashda muhim rol o'ynaydi.",
		},
		{
			emoji: '🎯',
			title: 'Aniqlik va sifat',
			desc: "Kichik tafsilotlargacha e'tibor beramiz. Har bir element ma'qul va intuitiv bo'lishi uchun harakat qilamiz.",
		},
		{
			emoji: '💡',
			title: 'Innovatsiya',
			desc: "Doimo yangi texnologiyalar va yondashuvlarni qo'llab, biznes ehtiyojlariga mos yechimlar taqdim etamiz.",
		},
		{
			emoji: '🌍',
			title: 'Hamma uchun ochiq',
			desc: "Kichik do'kondan yirik biznesgacha — har qanday o'lchamdagi kompaniyaga mos tarif va yechimlar mavjud.",
		},
	]

	const TEAM = [
		{
			emoji: '👨‍💼',
			name: 'Jasur Karimov',
			role: 'Bosh ijrochi direktor',
			bio: "10 yillik IT tajribasi. Biznesni raqamlashtirish bo'yicha mutaxassis.",
			bg: 'rgba(124,58,237,0.15)',
		},
		{
			emoji: '👩‍💻',
			name: 'Nilufar Yusupova',
			role: 'Texnik direktor',
			bio: "Full-stack dasturchi. Arxitektura va infratuzilma bo'yicha ekspert.",
			bg: 'rgba(37,99,235,0.15)',
		},
		{
			emoji: '👨‍🎨',
			name: 'Bobur Rahimov',
			role: 'Dizayn rahbari',
			bio: "UX/UI dizayn va brending bo'yicha ijodkor mutaxassis.",
			bg: 'rgba(236,72,153,0.12)',
		},
		{
			emoji: '👩‍📊',
			name: 'Zulfiya Toshmatova',
			role: 'Marketing direktori',
			bio: "Raqamli marketing va o'sish strategiyalari bo'yicha mutaxassis.",
			bg: 'rgba(16,185,129,0.12)',
		},
		{
			emoji: '👨‍🔧',
			name: 'Sardor Mirzayev',
			role: 'Mahsulot menejeri',
			bio: "Foydalanuvchi ehtiyojlarini texnik yechimlarga aylantiruvchi ko'prik.",
			bg: 'rgba(245,158,11,0.12)',
		},
		{
			emoji: '👩‍💼',
			name: 'Kamola Nazarova',
			role: 'Mijozlar xizmati',
			bio: 'Har bir foydalanuvchiga eng yaxshi tajribani taqdim etishga intiladi.',
			bg: 'rgba(139,92,246,0.12)',
		},
	]

	const TIMELINE = [
		{
			year: '2021',
			emoji: '🌱',
			title: "Boshlang'ich g'oya",
			desc: "Kichik do'kon egalarining onlayn savdoda qiyinchiliklarini ko'rib, platforma g'oyasi tug'ildi.",
		},
		{
			year: '2022',
			emoji: '⚡',
			title: 'Beta versiya',
			desc: "100 ta pilot foydalanuvchi bilan beta test o'tkazildi. Muhim fikr-mulohazalar to'plandi.",
		},
		{
			year: '2023',
			emoji: '🚀',
			title: 'Rasmiy ishga tushirish',
			desc: "Platforma rasman ishga tushirildi. Birinchi oy 500+ do'kon ro'yxatdan o'tdi.",
		},
		{
			year: '2024',
			emoji: '🏆',
			title: 'Yil platformasi',
			desc: "O'zbekiston IT mukofotida 'Yilning eng yaxshi B2C platformasi' unvonini qo'lga kiritdik.",
		},
		{
			year: '2025',
			emoji: '🌍',
			title: 'Kengayish bosqichi',
			desc: "Qo'shni mamlakatlar bozoriga chiqish rejalashtirilmoqda. Yangi xususiyatlar qo'shilmoqda.",
		},
	]

	return { STATS, VALUES, TEAM, TIMELINE }
}

export default GiveStats
