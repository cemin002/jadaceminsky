const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const captureStream = canvas.captureStream();
const mediaRecorder = new MediaRecorder(captureStream, {
    mimeType: 'video/webm;codecs=vp9'
});

// Set dimensions to match the welcome text area
canvas.width = 600;
canvas.height = 200;

let chunks = [];
let startTime = null;
const DURATION = 5000; // 5 seconds

mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'welcome-text.webm';
    a.click();
};

function draw(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const normalizedProgress = progress / DURATION;

    // Clear canvas
    ctx.fillStyle = '#ff69b4'; // Your theme color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animated text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '48px "DM Serif Text"';
    
    const text = 'WelcomeToMyWebsite!';
    const letters = text.split('');
    
    letters.forEach((letter, i) => {
        const letterDelay = i * 0.05;
        const letterProgress = Math.max(0, Math.min(1, (normalizedProgress - letterDelay) * 3));
        
        const x = canvas.width/2 - (letters.length * 20)/2 + i * 20;
        const y = canvas.height/2;
        
        // Letter animation
        const scale = letterProgress;
        const opacity = letterProgress;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillText(letter, 0, 0);
        ctx.restore();
    });

    if (progress < DURATION) {
        requestAnimationFrame(draw);
    } else {
        mediaRecorder.stop();
    }
}

// Start recording and animation
mediaRecorder.start();
requestAnimationFrame(draw);