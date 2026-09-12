# FA Wedding RSVP Backend Setup

Google Sheet sudah disediakan: **FA Wedding RSVP**

## 1. Buka Apps Script dari Google Sheet
Buka Google Sheet > **Extensions > Apps Script**.

## 2. Copy kod backend
Salin semua kandungan `backend/Code.gs` dari repo ini dan ganti kandungan `Code.gs` dalam Apps Script.

## 3. Simpan Telegram token dengan selamat
Dalam Apps Script buka **Project Settings > Script Properties** dan tambah:

- `TELEGRAM_BOT_TOKEN` = token bot Telegram yang BARU

Jangan simpan token dalam GitHub atau HTML website.

## 4. Dapatkan Chat ID secara automatik
1. Hantar `/start` kepada bot Telegram.
2. Dalam Apps Script pilih function `detectTelegramChatId`.
3. Tekan **Run** dan benarkan permission.
4. Script akan simpan `TELEGRAM_CHAT_ID` secara automatik dalam Script Properties.
5. Pilih `testTelegram` dan tekan **Run** untuk test notification.

## 5. Deploy Web App
Apps Script > **Deploy > New deployment > Web app**

- Execute as: **Me**
- Who has access: **Anyone**

Tekan **Deploy** dan copy URL yang berakhir dengan `/exec`.

URL `/exec` itu perlu dimasukkan ke website sebagai RSVP endpoint.

## Data disimpan
Sheet `RSVP` menggunakan kolum:
Timestamp | Nama Tetamu | Kehadiran | Pax | No. Telefon | Ucapan | Sumber
