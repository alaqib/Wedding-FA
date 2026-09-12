const SPREADSHEET_ID = '1lVI50EVlSkWNsIAsKUAvbmhVWFdSExtRpL67PcqgJFk';
const SHEET_NAME = 'RSVP';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'FA Wedding RSVP' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    const name = clean_(p.name, 120);
    const attendance = clean_(p.attendance, 30);
    const paxRaw = parseInt(p.pax || '1', 10);
    const pax = Number.isFinite(paxRaw) ? Math.min(Math.max(paxRaw, 0), 20) : 1;
    const phone = clean_(p.phone, 40);
    const message = clean_(p.message, 500);
    const source = clean_(p.source || 'Wedding-FA', 80);

    if (!name || !attendance) throw new Error('Nama dan kehadiran diperlukan.');

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet RSVP tidak dijumpai.');

    const now = new Date();
    sheet.appendRow([now, name, attendance, pax, phone, message, source]);

    sendTelegram_(name, attendance, pax, phone, message);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err.message || err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function clean_(value, maxLen) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, maxLen);
}

function sendTelegram_(name, attendance, pax, phone, message) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('TELEGRAM_BOT_TOKEN');
  const chatId = props.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chatId) return;

  const text = [
    '💍 RSVP Baru — Fazilla & Aqib',
    '',
    'Nama: ' + name,
    'Kehadiran: ' + attendance,
    'Pax: ' + pax,
    'Telefon: ' + (phone || '-'),
    'Ucapan: ' + (message || '-'),
    '',
    '12.12.2026 • Dewan Kilimu, Ranau'
  ].join('\n');

  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: chatId, text: text }),
    muteHttpExceptions: true
  });
}

function detectTelegramChatId() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('TELEGRAM_BOT_TOKEN');
  if (!token) throw new Error('Set TELEGRAM_BOT_TOKEN dalam Script Properties dahulu.');

  const r = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/getUpdates', {
    muteHttpExceptions: true
  });
  const data = JSON.parse(r.getContentText());
  if (!data.ok || !data.result || !data.result.length) {
    throw new Error('Tiada mesej dijumpai. Hantar /start kepada bot dahulu.');
  }

  for (let i = data.result.length - 1; i >= 0; i--) {
    const msg = data.result[i].message || data.result[i].channel_post;
    if (msg && msg.chat && msg.chat.id) {
      props.setProperty('TELEGRAM_CHAT_ID', String(msg.chat.id));
      Logger.log('TELEGRAM_CHAT_ID saved: ' + msg.chat.id);
      return String(msg.chat.id);
    }
  }
  throw new Error('Chat ID tidak ditemui dalam update bot.');
}

function testTelegram() {
  sendTelegram_('TEST RSVP', 'Hadir', 2, '0123456789', 'Test notification berjaya.');
}
