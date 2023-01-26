import { useCallback, useEffect, useMemo, useState } from "react";
import { apis, blocklyticsApis } from "../shared/apis";
import { get2DayChange, getPercentChange } from "../shared/percent-change";
import Charts, { ChartSpan } from "./Charts";
import DexCards from "./DexCards";
import TotalStats from "./TotalStats";
import AlgebraLogo from '../images/algebra-logo.png'

export enum ChartType {
    TVL = 'Total Value Locked',
    VOLUME = 'Volume',
    FEES = 'Fees',
    PROTOCOL_EARNED = 'Protocol Earned'
}

type ChartPiece = { time: number, tvl: string, volume: string, fees: string };

type StatsData = { [key: string]: ChartPiece[] | null }

type SummaryData = { totalVolumeUSD: number; totalValueLockedUSD: number; totalFeesUSD: number }

type AbsoluteData = { [key: string]: { now: SummaryData; dayAgo: SummaryData; twoDaysAgo: SummaryData } | null }

export default function ChartLayout() {

    const [totalStats, setTotalStats] = useState<StatsData>()
    const [absoluteStats, setAbsoluteStats] = useState<AbsoluteData>()

    const [selectedDex, setSelectedDex] = useState('Algebra Protocol')
    const [selectedChart, setSelectedChart] = useState(ChartType.TVL)
    const [chartSpan, setChartSpan] = useState(ChartSpan.MONTH)

    const fetchStats = useCallback(() => {

        const requests = Object.values(apis).map(api => fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `query yearData {
                    algebraDayDatas(first: 365, orderBy: date, orderDirection: desc) {    
                        time: date
                        tvl: tvlUSD
                        volume: volumeUSD
                        fees: feesUSD
                    }      
                }`
            })
        })
            .then(res => res.json())
            .catch(console.error)

        )

        Promise.allSettled<{ data: { algebraDayDatas: any } }>(requests)
            .then(datas => datas.map((res) => res.status === 'fulfilled' ? res.value.data.algebraDayDatas : null))
            .then(datas => Object.keys(apis).reduce((acc, dex, i) => ({
                ...acc,
                [dex]: datas[i]
            }), {}))
            .then(stats => setTotalStats(stats))
            .catch(console.error)

    }, [apis, totalStats])

    const fetch24HData = useCallback(() => {

        const dayAgo = Math.round((Date.now() - 1000 * 60 * 60 * 24) / 1000)
        const twoDaysAgo = Math.round((Date.now() - 1000 * 60 * 60 * 24 * 2) / 1000)

        const requests = Object.values(blocklyticsApis).map(api => fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `query blocks {
                    blocks24: blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${dayAgo}, timestamp_lt: ${dayAgo + 600} }) {
                    number
                }
                blocks48: blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${twoDaysAgo}, timestamp_lt: ${twoDaysAgo + 600} }) {
                    number
                }
            }`
            })
        })
            .then(res => res.json())
            .catch(console.error)

        )


        Promise.allSettled<{ data: { blocks: { blocks24, blocks48 } } }>(requests)
            .then(datas => datas.map((res) => res.status === 'fulfilled' ? res.value.data : null))
            .then(datas => Object.keys(apis).reduce((acc, dex, i) => ({
                ...acc,
                [dex]: datas[i]
            }), {}))
            .then((datas: { [dex: string]: { blocks24, blocks48 } }) => Object.entries(datas).map(([dex, value]) => fetch(apis[dex], {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: `query totalStats {
                    now: factories {
                      totalVolumeUSD
                      totalValueLockedUSD
                      totalFeesUSD
                    }
                    dayAgo: factories (block: { number: ${value.blocks24[0].number} }) {
                      totalVolumeUSD
                      totalValueLockedUSD
                      totalFeesUSD
                    }
                    twoDaysAgo: factories (block: { number: ${value.blocks48[0].number} }) {
                        totalVolumeUSD
                        totalValueLockedUSD
                        totalFeesUSD
                      }
              }`
                })
            })
                .then(v => v.json())))
            .then(requests => Promise.allSettled<{ data: { now: any, dayAgo: any, twoDaysAgo: any } }>(requests))
            .then(datas => datas.map((res) => res.status === 'fulfilled' ? res.value.data : null))
            .then((res) => res.reduce((acc, v, i) => ({
                ...acc,
                [Object.keys(blocklyticsApis)[i]]: v
            }), {}))
            .then(setAbsoluteStats)
            .catch(console.error)


    }, [blocklyticsApis])

    const { totalTVL, totalVolume, totalFees, totalProtocolEarned } = useMemo(() => {

        if (!totalStats) return {}

        const { totalTVL, totalVolume, totalFees } = Object.values(totalStats)
            .reduce((acc, v) => [...acc, ...v], [])
            .reduce((acc, el, i) => {
                return {
                    totalTVL: {
                        ...acc.totalTVL,
                        [el.time]: (acc.totalTVL[el.time] || 0) + Number(el.tvl)
                    },
                    totalVolume: {
                        ...acc.totalVolume,
                        [el.time]: (acc.totalVolume[el.time] || 0) + Number(el.volume)
                    },
                    totalFees: {
                        ...acc.totalFees,
                        [el.time]: (acc.totalFees[el.time] || 0) + Number(el.fees)
                    }
                }
            }, { totalTVL: {}, totalVolume: {}, totalFees: {} })

        return {
            totalTVL: Object.entries(totalTVL).map(([time, value]) => ({ time: Number(time), value })),
            totalVolume: Object.entries(totalVolume).map(([time, value]) => ({ time: Number(time), value })),
            totalFees: Object.entries(totalFees).map(([time, value]) => ({ time: Number(time), value })),
            totalProtocolEarned: Object.entries(totalFees).map(([time, value]) => ({ time: Number(time), value: Number(value) * 0.015 }))
        }

    }, [totalStats])

    const { dexesTVL, dexesVolume, dexesFees, dexesProtocolEarned } = useMemo(() => {

        if (!totalStats) return {}

        const { dexesTVL, dexesVolume, dexesFees, dexesProtocolEarned } = Object.entries(totalStats)
            .reduce((acc, [dex, data]) => ({
                dexesTVL: {
                    ...acc.dexesTVL,
                    [dex]: data.map(({ time, tvl }) => ({ time, value: tvl })).reverse()
                },
                dexesVolume: {
                    ...acc.dexesVolume,
                    [dex]: data.map(({ time, volume }) => ({ time, value: volume })).reverse()
                },
                dexesFees: {
                    ...acc.dexesFees,
                    [dex]: data.map(({ time, fees }) => ({ time, value: fees })).reverse()
                },
                dexesProtocolEarned: {
                    ...acc.dexesProtocolEarned,
                    [dex]: data.map(({ time, fees }) => ({ time, value: Number(fees) * 0.015 })).reverse()
                }
            }),
                { dexesTVL: {}, dexesVolume: {}, dexesFees: {}, dexesProtocolEarned: {} }
            )

        return {
            dexesTVL,
            dexesVolume,
            dexesFees,
            dexesProtocolEarned
        }

    }, [totalStats])

    const totalChartDatas = {
        [ChartType.TVL]: totalTVL,
        [ChartType.VOLUME]: totalVolume,
        [ChartType.FEES]: totalFees,
        [ChartType.PROTOCOL_EARNED]: totalProtocolEarned
    }

    const dexesChartDatas = {
        [ChartType.TVL]: dexesTVL,
        [ChartType.VOLUME]: dexesVolume,
        [ChartType.FEES]: dexesFees,
        [ChartType.PROTOCOL_EARNED]: dexesProtocolEarned
    }

    const {
        now: { tvlSummaryNow, volumeSummaryNow, feesSummaryNow },
        oneDay: { tvlSummary24, volumeSummary24, feesSummary24 },
        twoDays: { tvlSummary48, volumeSummary48, feesSummary48 }
    } = useMemo(() => {

        return Object.values(absoluteStats || {}).reduce((acc, v) => ({
            now: {
                tvlSummaryNow: acc.now.tvlSummaryNow += Number(v.now[0].totalValueLockedUSD),
                volumeSummaryNow: acc.now.volumeSummaryNow += Number(v.now[0].totalVolumeUSD),
                feesSummaryNow: acc.now.feesSummaryNow += Number(v.now[0].totalFeesUSD)
            },
            oneDay: {
                tvlSummary24: acc.oneDay.tvlSummary24 += Number(v.dayAgo[0].totalValueLockedUSD),
                volumeSummary24: acc.oneDay.volumeSummary24 += Number(v.dayAgo[0].totalVolumeUSD),
                feesSummary24: acc.oneDay.feesSummary24 += Number(v.dayAgo[0].totalFeesUSD)
            },
            twoDays: {
                tvlSummary48: acc.twoDays.tvlSummary48 += Number(v.twoDaysAgo[0].totalValueLockedUSD),
                volumeSummary48: acc.twoDays.volumeSummary48 += Number(v.twoDaysAgo[0].totalVolumeUSD),
                feesSummary48: acc.twoDays.feesSummary48 += Number(v.twoDaysAgo[0].totalFeesUSD)
            }
        }), {
            now: { tvlSummaryNow: 0, volumeSummaryNow: 0, feesSummaryNow: 0 },
            oneDay: { tvlSummary24: 0, volumeSummary24: 0, feesSummary24: 0 },
            twoDays: { tvlSummary48: 0, volumeSummary48: 0, feesSummary48: 0 },
        })

    }, [absoluteStats])

    const { currentTVL, currentVolume, currentFees, currentProtocolEarned } = useMemo(() => {

        if (!absoluteStats) return {}

        if (selectedDex === 'Algebra Protocol') {

            return {
                currentTVL: {
                    value: tvlSummaryNow,
                    change: getPercentChange(tvlSummaryNow, tvlSummary24),
                },
                currentVolume: {
                    value: volumeSummaryNow - volumeSummary24,
                    change: get2DayChange(volumeSummaryNow, volumeSummary24, volumeSummary48)[1],
                },
                currentFees: {
                    value: feesSummaryNow - feesSummary24,
                    change: get2DayChange(feesSummaryNow, feesSummary24, feesSummary48)[1]
                },
                currentProtocolEarned: {
                    value: feesSummaryNow * 0.015 - feesSummary24 * 0.015,
                    change: get2DayChange(feesSummaryNow * 0.015, feesSummary24 * 0.015, feesSummary48 * 0.015)[1]
                }
            }

        }

        return {
            currentTVL: {
                value: absoluteStats[selectedDex].now[0].totalValueLockedUSD,
                change: getPercentChange(absoluteStats[selectedDex].now[0].totalValueLockedUSD, absoluteStats[selectedDex].dayAgo[0].totalValueLockedUSD),
            },
            currentVolume: {
                value: absoluteStats[selectedDex].now[0].totalVolumeUSD - absoluteStats[selectedDex].dayAgo[0].totalVolumeUSD,
                change: get2DayChange(absoluteStats[selectedDex].now[0].totalVolumeUSD, absoluteStats[selectedDex].dayAgo[0].totalVolumeUSD, absoluteStats[selectedDex].twoDaysAgo[0].totalVolumeUSD)[1],
            },
            currentFees: {
                value: absoluteStats[selectedDex].now[0].totalFeesUSD - absoluteStats[selectedDex].dayAgo[0].totalFeesUSD,
                change: get2DayChange(absoluteStats[selectedDex].now[0].totalFeesUSD, absoluteStats[selectedDex].dayAgo[0].totalFeesUSD, absoluteStats[selectedDex].twoDaysAgo[0].totalFeesUSD)[1],
            },
            currentProtocolEarned: {
                value: absoluteStats[selectedDex].now[0].totalFeesUSD * 0.015 - absoluteStats[selectedDex].dayAgo[0].totalFeesUSD * 0.015,
                change: get2DayChange(absoluteStats[selectedDex].now[0].totalFeesUSD * 0.015, absoluteStats[selectedDex].dayAgo[0].totalFeesUSD * 0.015, absoluteStats[selectedDex].twoDaysAgo[0].totalFeesUSD * 0.015)[1],
            }
        }

    }, [selectedDex, absoluteStats])

    const chartData = useMemo(() => {

        if (!totalStats) return

        if (selectedDex === 'Algebra Protocol') {
            return totalChartDatas[selectedChart].slice(-chartSpan)
        }

        return dexesChartDatas[selectedChart][selectedDex].slice(-chartSpan)

    }, [totalStats, totalChartDatas, selectedChart, selectedDex, chartSpan])

    useEffect(() => {
        fetchStats()
        fetch24HData()
    }, [])

    return <div className="flex flex-col mt-16 mb-16">
        <div className="flex flex-col lg:flex-row w-full">
            <div className="flex-1 w-full">
                <DexCards selectedDex={selectedDex} selectDex={(dex) => setSelectedDex(dex)} />
            </div>
        </div>
        <div className="flex flex-col lg:flex-row">
            <div className="w-full flex-1 lg:max-w-[300px]">
                <TotalStats currentTVL={currentTVL} currentVolume={currentVolume} currentFees={currentFees} currentProtocolEarned={currentProtocolEarned} selectedChart={selectedChart} selectChart={(chart) => setSelectedChart(chart)} />
            </div>
            <div className="w-full flex-1">
                <div className="h-full">
                    <Charts chartData={chartData} chartType={selectedChart} chartDEX={selectedDex} chartSpan={chartSpan} setChartSpan={setChartSpan} />
                </div>
            </div>
        </div>
    </div>
}