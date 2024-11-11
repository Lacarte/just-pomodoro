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

    // Array of motivational quotes
    const motivationalQuotes = [
        // Original quotes
        "Stay focused and never give up!",
        "You can do it, one step at a time.",
        "Keep pushing forward; you're doing great!",
        "Success is the sum of small efforts, repeated.",
        "Stay strong, stay positive, and keep going.",
        "Believe in yourself; you are capable of amazing things.",
        "Every moment you work hard brings you closer to success.",
        "The only limit to your impact is your imagination and commitment.",
        "Push through the challenge; greatness awaits.",
        "Focus on your goals and let nothing stop you.",
        
        // Growth mindset quotes
        "Mistakes are proof that you're trying.",
        "Your potential is limitless; embrace the journey.",
        "Growth happens outside your comfort zone.",
        "Every expert was once a beginner.",
        "Learning is a journey, not a destination.",
        
        // Perseverance quotes
        "The harder you work, the luckier you get.",
        "Your future self will thank you for not giving up.",
        "Persistence beats resistance.",
        "Small progress is still progress.",
        "The best view comes after the hardest climb.",
        
        // Achievement quotes
        "Dream big, work hard, stay humble.",
        "Your attitude determines your direction.",
        "Success is built one day at a time.",
        "Make it happen, shock everyone.",
        "Excellence is not an act, but a habit.",
        
        // Inspiration quotes
        "Be the energy you want to attract.",
        "Your time is now; seize the moment.",
        "Turn your dreams into reality.",
        "Create the life you can't wait to wake up to.",
        "You are stronger than you think.",
        
        // Wisdom quotes
        "The journey of a thousand miles begins with a single step.",
        "Yesterday's ceiling becomes tomorrow's floor.",
        "Difficult roads often lead to beautiful destinations.",
        "Your future is created by what you do today.",
        "The only bad workout is the one that didn't happen.",
        
        // Self-belief quotes
        "Trust yourself; you know more than you think.",
        "Your potential to succeed is infinite.",
        "Be fearless in the pursuit of what sets your soul on fire.",
        "You are capable of more than you know.",
        "Believe you can and you're halfway there.",
        
        // Action-oriented quotes
        "Take action; inspiration will follow.",
        "Start where you are, use what you have.",
        "Make today count.",
        "The best time to start was yesterday. The next best time is now.",
        "Do something today that your future self will thank you for."
    ];
    
    function showNotification(initialMessage) {
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        const title = isFocusTime ? "Focus Time Started!" : "Break Time Started!";
        const bodyMessage = isFocusTime ? randomQuote : "Take a break and recharge for the next focus session.";
    
        new Notification(title, {
            body: bodyMessage,
            icon: "icon-green.png" // Custom icon if needed
        });

        // Update document title with bodyMessage
        window.electronAPI.getAppVersion().then(version => {
            document.title = `Just Pomodoro v${version} - ${bodyMessage}`;
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
    
        // Create a radial gradient for a multi-layered glow effect
        const gradient = ctx.createRadialGradient(x, y, radius - 50, x, y, radius);
        gradient.addColorStop(0, isFocusTime ? 'rgba(58, 29, 109, 0.5)' : 'rgba(58, 29, 109, 0.3)');
        gradient.addColorStop(0.5, isFocusTime ? 'rgba(120, 36, 199, 0.6)' : 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, isFocusTime ? 'rgba(246, 49, 83, 1)' : 'rgba(255, 255, 255, 1)');
    
        ctx.save();
        if (isActive && isPlaying) {
            ctx.shadowColor = isFocusTime ? '#f63153' : '#ffffff';
            ctx.shadowBlur = 80; // More intense shadow blur for a brighter glow
            ctx.fillStyle = gradient;
        }
    
        // Draw the circle outline with a multi-layered gradient
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 10; // Thicker line for better visual impact
        ctx.stroke();
        ctx.restore();
    
        // Draw stars and particles for a cosmic effect
        if (isActive && isPlaying) {
            for (let i = 0; i < 50; i++) {
                const starX = x + (Math.random() - 0.5) * radius * 2;
                const starY = y + (Math.random() - 0.5) * radius * 2;
                const starRadius = Math.random() * 2;
    
                ctx.beginPath();
                ctx.arc(starX, starY, starRadius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
                ctx.fill();
            }
        }
    
        // Draw the progress arc
        ctx.beginPath();
        ctx.arc(x, y, radius, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
        ctx.strokeStyle = isFocusTime ? '#f63153' : '#ffffff';
        ctx.lineWidth = 8;
        ctx.stroke();
    
        // Draw the time display
        ctx.fillStyle = isActive && isPlaying && isFocusTime ? '#f63153' : '#ffffff';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${String(minutes).padStart(2, '0')} ${String(seconds).padStart(2, '0')}`,
            x,
            y + 20
        );
    
        // Draw the labels
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
    });

    loadConfiguration();
});
