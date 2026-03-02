import axios from 'axios'
import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'

dotenv.config()

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const MINI_APP_URL = process.env.MINI_APP_URL // https://yourdomain.com/tma
const API_URL = process.env.API_URL || 'http://localhost:5000'

if (!BOT_TOKEN) {
	console.error('❌ TELEGRAM_BOT_TOKEN env variable is required!')
	process.exit(1)
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true })

console.log('🤖 Telegram Bot ishga tushdi...')

// ─── /start command ───────────────────────────────────────────────
bot.onText(/\/start/, async msg => {
	const chatId = msg.chat.id
	const firstName = msg.from?.first_name || 'Foydalanuvchi'

	await bot.sendMessage(
		chatId,
		`👋 Salom, *${firstName}*!\n\n` +
			`🛍️ *Biznes Platforma*ga xush kelibsiz!\n\n` +
			`Bizning do'konimizda eng sifatli mahsulotlarni topasiz.\n` +
			`Mahsulotlarni ko'rish uchun quyidagi tugmani bosing 👇`,
		{
			parse_mode: 'Markdown',
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: "🛍️ Do'konni ochish",
							web_app: { url: MINI_APP_URL },
						},
					],
					[
						{ text: '📦 Mahsulotlar', callback_data: 'show_products' },
						{ text: '📂 Kategoriyalar', callback_data: 'show_categories' },
					],
					[{ text: "📞 Bog'lanish", callback_data: 'contact' }],
				],
			},
		},
	)
})

// ─── /shop command ─────────────────────────────────────────────────
bot.onText(/\/shop/, async msg => {
	const chatId = msg.chat.id

	await bot.sendMessage(
		chatId,
		`🛍️ *Do\'konimiz*\n\nBarcha mahsulotlarni ko\'rish uchun quyidagi tugmani bosing:`,
		{
			parse_mode: 'Markdown',
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: "🚀 Do'konni ochish",
							web_app: { url: MINI_APP_URL },
						},
					],
				],
			},
		},
	)
})

// ─── /products command ─────────────────────────────────────────────
bot.onText(/\/products/, async msg => {
	await showProducts(msg.chat.id)
})

// ─── /categories command ───────────────────────────────────────────
bot.onText(/\/categories/, async msg => {
	await showCategories(msg.chat.id)
})

// ─── /help command ─────────────────────────────────────────────────
bot.onText(/\/help/, async msg => {
	const chatId = msg.chat.id
	await bot.sendMessage(
		chatId,
		`📋 *Mavjud buyruqlar:*\n\n` +
			`/start — Botni boshlash\n` +
			`/shop — Do'konni ochish\n` +
			`/products — Mahsulotlar ro'yxati\n` +
			`/categories — Kategoriyalar\n` +
			`/featured — Tanlangan mahsulotlar\n` +
			`/help — Yordam\n\n` +
			`💡 Yoki quyidagi tugma orqali to'liq do'konni oching:`,
		{
			parse_mode: 'Markdown',
			reply_markup: {
				inline_keyboard: [
					[{ text: "🛍️ Do'konni ochish", web_app: { url: MINI_APP_URL } }],
				],
			},
		},
	)
})

// ─── /featured command ─────────────────────────────────────────────
bot.onText(/\/featured/, async msg => {
	const chatId = msg.chat.id
	try {
		const res = await axios.get(`${API_URL}/api/products?featured=true&limit=5`)
		const products = res.data.products || []

		if (!products.length) {
			return bot.sendMessage(chatId, "Hozircha featured mahsulotlar yo'q.")
		}

		await bot.sendMessage(chatId, '⭐ *Tanlangan mahsulotlar:*', {
			parse_mode: 'Markdown',
		})

		for (const p of products) {
			await sendProductCard(chatId, p)
		}
	} catch (e) {
		bot.sendMessage(chatId, "❌ Xatolik yuz berdi. Keyinroq urinib ko'ring.")
	}
})

// ─── Callback queries ──────────────────────────────────────────────
bot.on('callback_query', async query => {
	const chatId = query.message.chat.id
	const data = query.data

	await bot.answerCallbackQuery(query.id)

	if (data === 'show_products') {
		await showProducts(chatId)
	} else if (data === 'show_categories') {
		await showCategories(chatId)
	} else if (data === 'contact') {
		await bot.sendMessage(
			chatId,
			`📞 *Bog'lanish:*\n\n` +
				`📱 Telefon: +998 90 123 45 67\n` +
				`📧 Email: info@biznes.uz\n` +
				`🕐 Ish vaqti: 09:00 - 18:00`,
			{ parse_mode: 'Markdown' },
		)
	} else if (data.startsWith('cat_')) {
		const slug = data.replace('cat_', '')
		await showProductsByCategory(chatId, slug)
	} else if (data.startsWith('product_')) {
		const id = data.replace('product_', '')
		await showProductDetail(chatId, id)
	} else if (data === 'back_categories') {
		await showCategories(chatId)
	} else if (data === 'open_shop') {
		await bot.sendMessage(chatId, "🛍️ Do'konni oching:", {
			reply_markup: {
				inline_keyboard: [
					[{ text: "🚀 Do'konni ochish", web_app: { url: MINI_APP_URL } }],
				],
			},
		})
	}
})

// ─── Helper functions ──────────────────────────────────────────────

async function showProducts(chatId, page = 1) {
	try {
		const res = await axios.get(`${API_URL}/api/products?limit=6&page=${page}`)
		const { products, total, totalPages } = res.data

		if (!products.length) {
			return bot.sendMessage(chatId, "📦 Hozircha mahsulotlar yo'q.")
		}

		const text = `📦 *Mahsulotlar* (${total} ta)\n\nBatafsil ko'rish uchun mahsulotni tanlang:`

		const keyboard = products.map(p => [
			{
				text: `${p.name} — ${formatPrice(p.price)} so'm`,
				callback_data: `product_${p.id}`,
			},
		])

		// Pagination buttons
		const navRow = []
		if (page > 1)
			navRow.push({ text: '← Oldingi', callback_data: `page_${page - 1}` })
		if (page < totalPages)
			navRow.push({ text: 'Keyingi →', callback_data: `page_${page + 1}` })
		if (navRow.length) keyboard.push(navRow)

		keyboard.push([
			{ text: "🛍️ Do'konni ochish", web_app: { url: MINI_APP_URL } },
		])

		await bot.sendMessage(chatId, text, {
			parse_mode: 'Markdown',
			reply_markup: { inline_keyboard: keyboard },
		})
	} catch (e) {
		bot.sendMessage(chatId, "❌ Mahsulotlarni yuklab bo'lmadi.")
		console.error(e.message)
	}
}

async function showCategories(chatId) {
	try {
		const res = await axios.get(`${API_URL}/api/categories`)
		const categories = res.data

		if (!categories.length) {
			return bot.sendMessage(chatId, "Kategoriyalar yo'q.")
		}

		const keyboard = []
		for (let i = 0; i < categories.length; i += 2) {
			const row = [
				{
					text: `${categories[i].icon} ${categories[i].name}`,
					callback_data: `cat_${categories[i].slug}`,
				},
			]
			if (categories[i + 1]) {
				row.push({
					text: `${categories[i + 1].icon} ${categories[i + 1].name}`,
					callback_data: `cat_${categories[i + 1].slug}`,
				})
			}
			keyboard.push(row)
		}
		keyboard.push([
			{ text: "🛍️ Do'konni ochish", web_app: { url: MINI_APP_URL } },
		])

		await bot.sendMessage(
			chatId,
			`📂 *Kategoriyalar*\n\nQaysi kategoriyani ko'rishni istaysiz?`,
			{ parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } },
		)
	} catch (e) {
		bot.sendMessage(chatId, "❌ Kategoriyalarni yuklab bo'lmadi.")
	}
}

async function showProductsByCategory(chatId, slug) {
	try {
		const res = await axios.get(
			`${API_URL}/api/products?category=${slug}&limit=8`,
		)
		const { products, total } = res.data

		if (!products.length) {
			return bot.sendMessage(chatId, "Bu kategoriyada mahsulot yo'q.", {
				reply_markup: {
					inline_keyboard: [
						[{ text: '← Kategoriyalar', callback_data: 'back_categories' }],
					],
				},
			})
		}

		const text = `📦 *${products[0]?.category_name || slug}* kategoriyasi (${total} ta)`
		const keyboard = products.map(p => [
			{
				text: `${p.name} — ${formatPrice(p.price)} so'm`,
				callback_data: `product_${p.id}`,
			},
		])
		keyboard.push([
			{ text: '← Kategoriyalar', callback_data: 'back_categories' },
			{
				text: "🛍️ Do'kon",
				web_app: { url: `${MINI_APP_URL}?category=${slug}` },
			},
		])

		await bot.sendMessage(chatId, text, {
			parse_mode: 'Markdown',
			reply_markup: { inline_keyboard: keyboard },
		})
	} catch (e) {
		bot.sendMessage(chatId, '❌ Xatolik yuz berdi.')
	}
}

async function showProductDetail(chatId, id) {
	try {
		const res = await axios.get(`${API_URL}/api/products/${id}`)
		const p = res.data

		const discount = p.old_price
			? `\n🏷️ Chegirma: *${Math.round(((p.old_price - p.price) / p.old_price) * 100)}%*`
			: ''

		const stock =
			p.stock === 0
				? '\n❌ *Mavjud emas*'
				: p.stock < 10
					? `\n⚠️ Faqat *${p.stock}* ta qoldi`
					: `\n✅ Mavjud (${p.stock} ta)`

		const text =
			`📦 *${p.name}*\n\n` +
			`${p.description ? p.description + '\n\n' : ''}` +
			`💰 Narxi: *${formatPrice(p.price)} so'm*` +
			(p.old_price ? `\n~~${formatPrice(p.old_price)} so'm~~` : '') +
			discount +
			stock +
			(p.category_name
				? `\n📂 Kategoriya: ${p.category_icon || ''} ${p.category_name}`
				: '')

		const keyboard = [
			[
				{
					text: "🛍️ Do'konda ko'rish",
					web_app: { url: `${MINI_APP_URL}?product=${p.id}` },
				},
			],
			[{ text: '← Mahsulotlar', callback_data: 'show_products' }],
		]

		if (p.image_url) {
			try {
				await bot.sendPhoto(chatId, p.image_url, {
					caption: text,
					parse_mode: 'Markdown',
					reply_markup: { inline_keyboard: keyboard },
				})
			} catch {
				await bot.sendMessage(chatId, text, {
					parse_mode: 'Markdown',
					reply_markup: { inline_keyboard: keyboard },
				})
			}
		} else {
			await bot.sendMessage(chatId, text, {
				parse_mode: 'Markdown',
				reply_markup: { inline_keyboard: keyboard },
			})
		}
	} catch (e) {
		bot.sendMessage(chatId, '❌ Mahsulot topilmadi.')
	}
}

async function sendProductCard(chatId, p) {
	const text =
		`*${p.name}*\n` +
		`💰 ${formatPrice(p.price)} so'm` +
		(p.old_price ? ` ~~${formatPrice(p.old_price)}~~` : '')

	const keyboard = [[{ text: 'Batafsil →', callback_data: `product_${p.id}` }]]

	if (p.image_url) {
		try {
			await bot.sendPhoto(chatId, p.image_url, {
				caption: text,
				parse_mode: 'Markdown',
				reply_markup: { inline_keyboard: keyboard },
			})
			return
		} catch {
			/* fall through */
		}
	}
	await bot.sendMessage(chatId, text, {
		parse_mode: 'Markdown',
		reply_markup: { inline_keyboard: keyboard },
	})
}

function formatPrice(price) {
	return new Intl.NumberFormat('uz-UZ').format(price)
}

// ─── Error handling ────────────────────────────────────────────────
bot.on('polling_error', err => {
	console.error('Polling error:', err.message)
})

bot.on('error', err => {
	console.error('Bot error:', err.message)
})

process.on('SIGINT', () => {
	console.log("Bot to'xtatildi.")
	bot.stopPolling()
	process.exit(0)
})
