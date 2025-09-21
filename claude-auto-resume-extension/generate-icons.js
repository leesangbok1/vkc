// Node.js 환경에서 아이콘 생성
const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // 배경 그라디언트
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // 로봇 아이콘 그리기
    ctx.fillStyle = 'white';

    // 로봇 머리
    ctx.beginPath();
    ctx.roundRect(size * 0.2, size * 0.25, size * 0.6, size * 0.4, size * 0.1);
    ctx.fill();

    // 로봇 눈
    ctx.fillStyle = '#667eea';
    ctx.beginPath();
    ctx.arc(size * 0.35, size * 0.4, size * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(size * 0.65, size * 0.4, size * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // 로봇 몸체
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.roundRect(size * 0.25, size * 0.6, size * 0.5, size * 0.25, size * 0.05);
    ctx.fill();

    // 새로고침 화살표
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = size * 0.04;
    ctx.lineCap = 'round';

    const centerX = size * 0.75;
    const centerY = size * 0.25;
    const radius = size * 0.08;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI/2, Math.PI, false);
    ctx.stroke();

    // 화살표 머리
    ctx.beginPath();
    ctx.moveTo(centerX - radius * 0.7, centerY + radius * 0.7);
    ctx.lineTo(centerX - radius, centerY + radius);
    ctx.lineTo(centerX - radius * 1.3, centerY + radius * 0.7);
    ctx.stroke();

    return canvas.toBuffer('image/png');
}

// 아이콘 생성 및 저장
[16, 32, 48, 128].forEach(size => {
    try {
        const buffer = createIcon(size);
        fs.writeFileSync(`icons/icon${size}.png`, buffer);
        console.log(`✅ icon${size}.png 생성 완료`);
    } catch (error) {
        console.error(`❌ icon${size}.png 생성 실패:`, error.message);
    }
});

console.log('🎨 모든 아이콘 생성 완료!');