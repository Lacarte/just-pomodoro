document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('timerCanvas');
    const ctx = canvas.getContext('2d');
    const playButton = document.getElementById('playButton');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const notificationSoundFocus = document.getElementById('notificationSoundFocus');
    const notificationSoundBreak = document.getElementById('notificationSoundBreak');

    const focusTimeInput = document.getElementById('focusTimeInput');
    const breakTimeInput = document.getElementById('breakTimeInput');

    const settingsButton = document.getElementById('settingsButton');
    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    const soundToggle = document.getElementById('soundToggle');
    const systemNotificationToggle = document.getElementById('systemNotificationToggle');
    const trayToggle = document.getElementById('trayToggle');
    const startupToggle = document.getElementById('startupToggle');
    const alwaysOnTopToggle = document.getElementById('alwaysOnTopToggle');


    let isPlaying = false;
    let isFocusTime = true;
    let focusTime = 0;
    let breakTime = 0;
    let currentTime = 0;
    let isSoundEnabled = true;
    let isSystemNotificationToggle = false;

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
        "Progress over perfection.",

        // Perseverance quotes
        "The harder you work, the luckier you get.",
        "Your future self will thank you for not giving up.",
        "Persistence beats resistance.",
        "Small progress is still progress.",
        "The best view comes after the hardest climb.",
        "Tough times never last, but tough people do.",

        // Achievement quotes
        "Dream big, work hard, stay humble.",
        "Your attitude determines your direction.",
        "Success is built one day at a time.",
        "Make it happen, shock everyone.",
        "Excellence is not an act, but a habit.",
        "Success is the sum of small efforts, repeated day in and day out.",

        // Inspiration quotes
        "Be the energy you want to attract.",
        "Your time is now; seize the moment.",
        "Turn your dreams into reality.",
        "Create the life you can't wait to wake up to.",
        "You are stronger than you think.",
        "Act as if what you do makes a difference. It does.",

        // Wisdom quotes
        "The journey of a thousand miles begins with a single step.",
        "Yesterday's ceiling becomes tomorrow's floor.",
        "Difficult roads often lead to beautiful destinations.",
        "Your future is created by what you do today.",
        "The only bad workout is the one that didn't happen.",
        "Do not watch the clock. Do what it does. Keep going.",

        // Self-belief quotes
        "Trust yourself; you know more than you think.",
        "Your potential to succeed is infinite.",
        "Be fearless in the pursuit of what sets your soul on fire.",
        "You are capable of more than you know.",
        "Believe you can and you're halfway there.",
        "You have what it takes to reach your goals.",

        // Action-oriented quotes
        "Take action; inspiration will follow.",
        "Start where you are, use what you have.",
        "Make today count.",
        "The best time to start was yesterday. The next best time is now.",
        "Do something today that your future self will thank you for.",
        "Great things never come from comfort zones."
    ];


    function showNotification(initialMessage) {
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        const title = isFocusTime ? "Focus Time Started!" : "Break Time Started!";
        const bodyMessage = isFocusTime ? randomQuote : "Take a break and recharge for the next focus session.";

        if (isSystemNotificationToggle) {
            new Notification(title, {
                body: bodyMessage,
                icon: "icon-green.png" // Custom icon if needed
            });
        }

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

            focusTimeInput.value = config.minutesFocus; // Set default value for focus time
            breakTimeInput.value = config.minutesBreak; // Set default value for break time


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

        // Set the ring color based on focus or break mode
        const ringColor = isFocusTime ? '#ffffff' : '#ffffff'; // Red for focus, white for break
        const indicatorColor = isFocusTime ? '#f63153' : '#ffffff'; // Same color for the indicator

        ctx.save();
        if (isActive && isPlaying) {
            ctx.shadowColor = isFocusTime ? '#f63153' : '#ffffff';
            ctx.shadowBlur = 20; // Soft glow for a more minimalist look
        }

        // Draw the circle outline (ring)
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = ringColor; // Apply ring color based on mode (initially white for break)
        ctx.lineWidth = 6; // Thinner line for minimalistic design
        ctx.stroke();
        ctx.restore();

        // Draw smoother particles around the circle for an elegant glow
        if (isActive && isPlaying) {
            const particleCount = 30; // Reduced count for a cleaner look
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2; // Randomize particle position for smoother effect
                const distance = radius + 10 + Math.random() * 5; // Randomize distance for a dynamic look
                const particleX = x + Math.cos(angle) * distance;
                const particleY = y + Math.sin(angle) * distance;
                const particleRadius = Math.random() * 1 + 0.5; // Smaller particles for a minimal effect

                // Create gradient for particles
                ctx.beginPath();
                ctx.arc(particleX, particleY, particleRadius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // Soft white color for particles to match the break ring
                ctx.fill();
            }
        }

        // Draw the progress arc indicator
        ctx.beginPath();
        ctx.arc(x, y, radius + 5, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress)); // Slightly outside the main circle
        ctx.strokeStyle = indicatorColor; // Progress arc color based on mode
        ctx.lineWidth = 4; // Thinner arc for minimalistic design
        ctx.stroke();

        // Draw the time display
        ctx.fillStyle = isActive && isPlaying && isFocusTime ? '#f63153' : '#ffffff';
        ctx.font = 'bold 48px Arial'; // Adjusted for minimalistic appearance
        ctx.textAlign = 'center';
        ctx.fillText(
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
            x,
            y + 15
        );

        // Draw the labels
        ctx.font = '16px Arial'; // Smaller font for labels
        ctx.fillText('MINS', x - 30, y + 45);
        ctx.fillText('SECS', x + 30, y + 45);
        ctx.fillText(label, x, y - 50);
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

                if (isSoundEnabled) {
                    if (isFocusTime) {
                        notificationSoundFocus.play();
                    } else {
                        notificationSoundBreak.play();
                    }
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
            if (isSoundEnabled) {
                notificationSoundFocus.play();
            }

        }
    });

    // Show the modal
    settingsButton.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });

    // Close the modal
    closeModalBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    // Reset Timer Logic
    resetTimerBtn.addEventListener('click', () => {
        // Reset the timer to the initial focus time
        currentTime = focusTime;

        const newFocusTime = parseInt(focusTimeInput.value);
        const newBreakTime = parseInt(breakTimeInput.value);

        if (newFocusTime > 0) {
            focusTime = newFocusTime * 60; // Convert to seconds
        }

        if (newBreakTime > 0) {
            breakTime = newBreakTime * 60; // Convert to seconds
        }

        // Pause the timer if it is currently running
        if (isPlaying) {
            isPlaying = false;
            playIcon.style.display = 'block'; // Show play icon
            pauseIcon.style.display = 'none'; // Hide pause icon
        }

        // Redraw the timer to reflect the reset state
        draw();
    });


    // Toggle Sound Logic
    soundToggle.addEventListener('change', (e) => {
        isSoundEnabled = e.target.checked;
        if (isSoundEnabled) {
            console.log("Sound Enabled");
        } else {
            console.log("Sound Disabled");
        }
    });


    // Toggle Sound Logic
    systemNotificationToggle.addEventListener('change', (e) => {
        isSystemNotificationToggle = e.target.checked;
    });


    // Tray Toggle Logic
    trayToggle.addEventListener('change', (e) => {
        const isTrayEnabled = e.target.checked;
        window.electronAPI.toggleTray(isTrayEnabled);
    });

    // Startup Toggle Logic
    startupToggle.addEventListener('change', (e) => {
        const isStartupEnabled = e.target.checked;
        window.electronAPI.toggleStartup(isStartupEnabled);
    });

    // Always on Top Logic
    alwaysOnTopToggle.addEventListener('change', (e) => {
        const isAlwaysOnTop = e.target.checked;
        window.electronAPI.setAlwaysOnTop(isAlwaysOnTop);
    });


    loadConfiguration();
});
