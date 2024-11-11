document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('timerCanvas');
    const ctx = canvas.getContext('2d');
    const playButton = document.getElementById('playButton');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const notificationSoundFocus = document.getElementById('notificationSoundFocus');
    const notificationSoundBreak = document.getElementById('notificationSoundBreak');

    let isPlaying = false;
    let isFocusTime = true;
    let focusTime = 0;
    let breakTime = 0;
    let currentTime = 0;

    function showNotification(message) {
        new Notification(message, {
            body: message,
            icon: "icon-green.png" // Custom icon if needed
        });
    }

    async function loadConfiguration() {
        try {
            const response = await fetch('./config.json');
            if (!response.ok) {
                throw new Error("Failed to load configuration file.");
            }
            const config = await response.json();

            if (
                typeof config.minutesFocus !== 'number' ||
                typeof config.minutesBreak !== 'number' ||
                config.minutesFocus <= 0 ||
                config.minutesBreak <= 0
            ) {
                throw new Error("Invalid configuration format. Please check your JSON file.");
            }

            focusTime = config.minutesFocus * 60;
            breakTime = config.minutesBreak * 60;
            currentTime = focusTime;

            draw();
            updateTimer();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    function drawTimer(x, y, radius, time, label, isActive) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const progress = isActive ? 1 - (time / (isFocusTime ? focusTime : breakTime)) : 0;

        ctx.save();
        if (isActive && isPlaying) {
            ctx.shadowColor = isFocusTime ? '#f63153' : '#ffffff';
            ctx.shadowBlur = 30;
        }
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        if (isActive && isPlaying) {
            ctx.beginPath();
            ctx.arc(x, y, radius, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
            ctx.strokeStyle = isFocusTime ? '#f63153' : '#ffffff';
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        ctx.fillStyle = isActive && isPlaying && isFocusTime ? '#f63153' : '#ffffff';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${String(minutes).padStart(2, '0')} ${String(seconds).padStart(2, '0')}`,
            x,
            y + 20
        );

        ctx.font = '20px Arial';
        ctx.fillText('MINS', x - 40, y + 60);
        ctx.fillText('SECS', x + 40, y + 60);
        ctx.fillText(label, x, y - 60);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX1 = canvas.width / 3;
        const centerX2 = (canvas.width / 3) * 2;

        drawTimer(centerX1, canvas.height / 2, 150, isFocusTime ? currentTime : focusTime, 'FOCUS', isFocusTime);
        drawTimer(centerX2, canvas.height / 2, 150, !isFocusTime ? currentTime : breakTime, 'BREAK', !isFocusTime);
    }

    function updateTimer() {
        if (isPlaying && currentTime > 0) {
            currentTime--;
            if (currentTime === 0) {
                isFocusTime = !isFocusTime;
                currentTime = isFocusTime ? focusTime : breakTime;
                showNotification(isFocusTime ? "Focus time started!" : "Break time started!");
                if (isFocusTime) {
                    notificationSoundFocus.play();
                } else {
                    notificationSoundBreak.play();
                }
            }
        }
        draw();
        setTimeout(updateTimer, 1000);
    }

    playButton.addEventListener('click', () => {
        isPlaying = !isPlaying;
        playIcon.style.display = isPlaying ? 'none' : 'block';
        pauseIcon.style.display = isPlaying ? 'block' : 'none';
        if (isPlaying) {
            showNotification("Timer started!");
            notificationSoundFocus.play();
        }
    });
    

    document.getElementById('centerButton').addEventListener('click', () => {
        alert('Center button clicked!');
        // Add any functionality you need here
    });
    

    loadConfiguration();
});
