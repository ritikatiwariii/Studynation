const convertSecondsToDuration = (totalSeconds) => {
    const seconds = Math.floor((totalSeconds) % 60)
    const minutes = Math.floor((totalSeconds / 60) % 60)
    const hours = Math.floor((totalSeconds / 3600) % 24)
    const days = Math.floor(totalSeconds / 86400)

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${seconds}s`
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`
    } else {
        return `${seconds}s`
    }
}

module.exports = {
    convertSecondsToDuration,
} 