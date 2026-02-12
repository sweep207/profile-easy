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
let hasSent = false; // Khóa chặn gửi trùng trong 1 lần load trang

// --- 2. NHẬN DIỆN CHI TIẾT THIẾT BỊ ---
function getDetailDevice() {
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
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("Mac")) os = "MacOS";

    if (/Android|iPhone|iPad|iPod/i.test(ua)) deviceType = "📱 Điện thoại";

    return { browser, os, deviceType };
}

// --- 3. LẤY IP, THÀNH PHỐ, NHÀ MẠNG (HTTPS 100%) ---
async function fetchIpInfo() {
    // Thử các nguồn khác nhau để tránh N/A
    const apis = [
        {
            url: 'https://ipwho.is/',
            parse: (d) => ({ ip: d.ip, city: d.city, isp: d.connection?.isp || d.org })
        },
        {
            url: 'https://ipapi.co/json/',
            parse: (d) => ({ ip: d.ip, city: d.city, isp: d.org || d.asn_organization })
        }
    ];

    for (const api of apis) {
        try {
            const res = await fetch(api.url, { signal: AbortSignal.timeout(4000) });
            const d = await res.json();
            const result = api.parse(d);
            if (result.ip && result.city && result.city !== "N/A") return result;
        } catch (e) { continue; }
    }
    return { ip: "Không rõ", city: "Không rõ", isp: "Không rõ" };
}

// --- 4. HÀM GỬI THÔNG BÁO ---
async function sendNotification(pos, ipInfo) {
    if (hasSent) return; // Nếu đang trong quá trình gửi thì không chạy thêm
    hasSent = true;

    const device = getDetailDevice();
    const time = new Date().toLocaleString('vi-VN');

    let msg = `<b>🚀 PHÁT HIỆN TRUY CẬP MỚI</b>\n\n`;
    msg += `🕒 <b>Thời gian:</b> <code>${time}</code>\n`;
    msg += `🌐 <b>IP:</b> <code>${ipInfo.ip}</code>\n`;
    msg += `🏙️ <b>Thành phố:</b> <code>${ipInfo.city}</code>\n`;
    msg += `📡 <b>Nhà mạng:</b> <b>${ipInfo.isp}</b>\n\n`;

    msg += `ℹ️ <b>Thông tin thiết bị:</b>\n`;
    msg += `├─ Loại: <b>${device.deviceType}</b>\n`;
    msg += `├─ Hệ điều hành: <code>${device.os}</code>\n`;
    msg += `└─ Trình duyệt: <b>${device.browser}</b>\n\n`;

    if (pos && pos.coords) {
        const { latitude: lat, longitude: lon } = pos.coords;
        msg += `📍 <b>Vị trí GPS:</b>\n`;msg += `└ 👉 <a href="https://www.google.com/maps?q=${lat},${lon}">Nhấn để xem Bản đồ</a>\n`;
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
        console.log("Đã gửi thông báo về Bot.");
    } catch (err) {
        console.error("Lỗi gửi Telegram:", err);
        hasSent = false; // Reset nếu lỗi để có thể thử lại
    }
}

// --- 5. KHỞI CHẠY ---
async function startTracking() {
    // Chạy song song để tốc độ nhanh nhất
    const ipPromise = fetchIpInfo();
    const gpsPromise = new Promise(r => navigator.geolocation.getCurrentPosition(r, () => r(null), {timeout: 4000}));
    
    const [ipInfo, pos] = await Promise.all([ipPromise, gpsPromise]);
    await sendNotification(pos, ipInfo);
}

// Luôn chạy khi load trang
window.onload = () => {
    // Xóa bỏ kiểm tra localStorage để lần nào vào cũng gửi tin
    startTracking();
};

// Nếu bạn vẫn muốn dùng nút Cookie để kích hoạt GPS
function acceptCookies() {
    const box = document.getElementById('cookie-box');
    if (box) box.style.display = 'none';
    startTracking();
}
