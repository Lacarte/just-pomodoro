window.electronAPI.getAppVersion().then(version => {
    document.title = `Just Pomodoro v${version}`;
});
