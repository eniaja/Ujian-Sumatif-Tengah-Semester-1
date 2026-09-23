// ID Spreadsheet Anda
const SPREADSHEET_ID = "https://docs.google.com/spreadsheets/d/11VpXjNyuyypLGPqeTM_Zz4t6aFSSyLKlWNysEhSl78A/edit?gid=0#gid=0";
// Email Penerima Notifikasi & Laporan (Email Admin/Pengawas)
const EMAIL_NOTIF = "teachereni04@gmail.com"; 

// MASTER PASSWORD UNTUK ADMIN/PENGAWAS
// Pengawas/Guru menggunakan password ini untuk membuka kunci layar siswa yang terdeteksi curang/pindah tab
const ADMIN_MASTER_PASSWORD = "GALATIAHEBAT"; 

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Sumatif Tengah Semester 1')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Verifikasi password pembuka kunci dari Admin
function verifyAdminPassword(inputPass) {
  return inputPass === ADMIN_MASTER_PASSWORD;
}

// Laporan Kecurangan Langsung Kirim Email ke Admin saat Terjadi Pelanggaran
function notifyAdminCheating(studentName, reason) {
  try {
    const subject = `[PERINGATAN UJIAN] ${studentName} Terkunci!`;
    const body = `
Pemberitahuan Sistem Ujian:

Siswa atas nama : ${studentName}
Waktu Terkunci : ${new Date().toLocaleString('id-ID')}
Penyebab        : ${reason}

Layar ujian siswa telah terkunci otomatis. 
Gunakan Master Password Admin (${ADMIN_MASTER_PASSWORD}) di perangkat siswa untuk membuka kembali pengerjaan ujian.
    `;
    MailApp.sendEmail(EMAIL_NOTIF, subject, body);
  } catch(e) {
    Logger.log("Gagal kirim email alert: " + e.message);
  }
}

// Simpan Pendataan Ujian Selesai
function submitExam(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Sheet1');
  const timestamp = new Date();
  
  const statusUjian = data.cheatingLogs.length > 0 
    ? "SELESAI DENGAN CATATAN: " + data.cheatingLogs.join("; ") 
    : "SELESAI (Lancar Tanpa Pelanggaran)";

  // Catat ke Google Sheet
  sheet.appendRow([
    timestamp,
    data.studentName,
    statusUjian
  ]);

  // Email Notifikasi Hasil Akhir
  try {
    const subject = `[Laporan Ujian Selesai] ${data.studentName}`;
    const body = `
Siswa Telah Selesai Mengerjakan Ujian:

Nama Siswa    : ${data.studentName}
Waktu Selesai : ${timestamp.toLocaleString('id-ID')}
Status Ujian  : ${statusUjian}

--------------------------------------------------
Sistem Pendataan Ujian
    `;
    MailApp.sendEmail(EMAIL_NOTIF, subject, body);
  } catch(e) {
    Logger.log("Gagal kirim email: " + e.message);
  }

  return { success: true };
}
