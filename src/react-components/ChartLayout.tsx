import { useCallback, useEffect, useMemo, useState } from "react";
import { apis } from "../shared/apis";
import { get2DayChange, getPercentChange } from "../shared/percent-change";
import Charts, { ChartSpan } from "./Charts";
import DexCards from "./DexCards";
import TotalStats from "./TotalStats";
import AlgebraLogo from '../images/algebra-logo.png'

export enum ChartType {
    TVL = 'Total Value Locked',
    VOLUME = 'Volume',
    FEES = 'Fees'
}

type ChartPiece = { time: number, tvl: string, volume: string, fees: string };

type StatsData = { [key: string]: ChartPiece[] | null }

export default function ChartLayout() {

    const [totalStats, setTotalStats] = useState<StatsData>()

    const [selectedDex, setSelectedDex] = useState(null)
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

    const { totalTVL, totalVolume, totalFees } = useMemo(() => {

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
            totalFees: Object.entries(totalFees).map(([time, value]) => ({ time: Number(time), value }))
        }

    }, [totalStats])

    const { dexesTVL, dexesVolume, dexesFees } = useMemo(() => {

        if (!totalStats) return {}

        const { dexesTVL, dexesVolume, dexesFees } = Object.entries(totalStats)
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
                }
            }),
                { dexesTVL: {}, dexesVolume: {}, dexesFees: {} }
            )

        return {
            dexesTVL,
            dexesVolume,
            dexesFees
        }

    }, [totalStats])

    const totalChartDatas = {
        [ChartType.TVL]: totalTVL,
        [ChartType.VOLUME]: totalVolume,
        [ChartType.FEES]: totalFees
    }

    const dexesChartDatas = {
        [ChartType.TVL]: dexesTVL,
        [ChartType.VOLUME]: dexesVolume,
        [ChartType.FEES]: dexesFees
    }

    const { currentTVL, currentVolume, currentFees } = useMemo(() => {

        if (!totalTVL) return {}

        const tvlToday = Number(totalTVL[totalTVL.length - 1].value);
        const tvlYesterday = Number(totalTVL[totalTVL.length - 2].value);
        const tvlChange = getPercentChange(tvlToday, tvlYesterday)

        const volumeToday = Number(totalVolume[totalVolume.length - 1].value)
        const volumeYesterday = Math.abs(Number(totalVolume[totalVolume.length - 2].value) - Number(totalVolume[totalVolume.length - 3].value))

        const volumeChange = volumeToday / volumeYesterday * 100 - 100

        const fees = Number(totalFees[totalFees.length - 1].value)

        console.log('tvl', tvlChange)

        return {
            currentTVL: {
                value: tvlToday,
                change: tvlChange
            },
            currentVolume: {
                value: volumeToday,
                change: volumeChange
            },
            currentFees: {
                value: fees,
                change: fees
            }
        }

    }, [totalTVL, totalVolume, totalFees])

    const chartData = useMemo(() => {

        if (!totalStats) return

        if (!selectedDex) {
            return totalChartDatas[selectedChart].slice(-chartSpan)
        }

        return dexesChartDatas[selectedChart][selectedDex].slice(-chartSpan)

    }, [totalStats, totalChartDatas, selectedChart, selectedDex, chartSpan])

    useEffect(() => {
        fetchStats()
    }, [])

    console.log(AlgebraLogo)
    return <div className="flex flex-col mt-16 mb-16">
        <div className="flex flex-col lg:flex-row w-full">
            <div className="flex items-center lg:flex-1 lg:max-w-[300px] py-4 px-8 lg:rounded-tl-lg bg-[#0a090f] border-r-2 border-solid border-[#13121c]">
                <div className={`w-[45px] h-[45px] rounded-full bg-[#211f29] border-solid border-2 border-[#36f] bg-no-repeat bg-center bg-[length:30px_30px]`} style={{backgroundImage: `url(${AlgebraLogo.src})`}}></div>
                <div className="ml-6">
                    <div className="text-lg font-bold">Algebra Protocol</div>
                    <div>Powered DEXs</div>
                </div>
            </div>
            <div className="flex-1 w-full">
                <DexCards selectedDex={selectedDex} selectDex={(dex) => setSelectedDex(dex)} />
            </div>
        </div>
        <div className="flex flex-col lg:flex-row">
            <div className="w-full flex-1 lg:max-w-[300px]">
                <TotalStats currentTVL={currentTVL} currentVolume={currentVolume} currentFees={currentFees} selectedChart={selectedChart} selectChart={(chart) => setSelectedChart(chart)} />
            </div>
            <div className="w-full flex-1">
                <div className="h-full">
                    <Charts chartData={chartData} chartType={selectedChart} chartDEX={selectedDex} chartSpan={chartSpan} setChartSpan={setChartSpan} />
                </div>
            </div>
        </div>
    </div>
}