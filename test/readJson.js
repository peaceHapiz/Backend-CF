const fs = require('fs');

// 🔹 Fungsi untuk membaca JSON
function readJSON(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null; // Jika file tidak ada, return null
        const data = fs.readFileSync(filePath, "utf8");
        console.log(data)
        return data.trim() ? JSON.parse(data) : null; // Pastikan tidak meng-parse string kosong

    } catch (error) {
        console.error("❌ Gagal membaca JSON:", error.message);
        return null;
    }
}
const jsonUser = './db/admin.json'; 

readJSON(jsonUser)