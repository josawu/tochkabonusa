import os
import requests
from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters
)

BOT_TOKEN = os.getenv("BOT_TOKEN")
GOOGLE_SCRIPT_URL = os.getenv("GOOGLE_SCRIPT_URL")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "☕ Программа лояльности\n\n"
        "📸 Загрузи фото чека\n"
        "🎁 10 чеков = бесплатный кофе"
    )


async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.message.from_user
    photo = update.message.photo[-1]

    payload = {
        "action": "add_check",
        "user_id": user.id,
        "username": user.username or "",
        "file_id": photo.file_id
    }

    response = requests.post(GOOGLE_SCRIPT_URL, json=payload, timeout=10)
    data = response.json()

    if data.get("bonus"):
        await update.message.reply_text(
            "🎉 Бесплатный кофе!\n"
            "Покажи это сообщение."
        )
    else:
        await update.message.reply_text(
            f"✅ Чек принят\n"
            f"{data['count']} / 10"
        )


def main():
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.PHOTO, handle_photo))

    app.run_polling()


if __name__ == "__main__":
    main()
