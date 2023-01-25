export const getPercentChange = (valueNow: number | undefined, value24HoursAgo: number | undefined): number => {
    if (valueNow && value24HoursAgo) {
        const change = ((valueNow - value24HoursAgo) / value24HoursAgo) * 100
        if (isFinite(change)) return change
    }
    return 0
}

export const get2DayChange = (valueNow: number, value24HoursAgo: number, value48HoursAgo: number): [number, number] => {
    // get volume info for both 24 hour periods
    const currentChange = valueNow - value24HoursAgo
    const previousChange = value24HoursAgo - value48HoursAgo
    const adjustedPercentChange = ((currentChange - previousChange) / previousChange) * 100
    if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
        return [currentChange, 0]
    }
    return [currentChange, adjustedPercentChange]
}        
