import { useCallback, useEffect, useMemo, useState } from "react"
import { apis } from "../shared/apis"
import { format } from "../shared/currency-formatter";
import Chart from "./Chart"
import DexCards from "./DexCards";

export enum ChartType {
    AREA,
    BAR
}

type ChartPiece = { time: number, value: number };

type StatsData = { [key: string]: { tvl: ChartPiece[] | null, volume: ChartPiece[] | null, fees: ChartPiece[] | null } }

export default function Charts() {

    const [totalStats, setTotalStats] = useState<StatsData>(Object.keys(apis).reduce((acc, dex) => ({
        ...acc,
        [dex]: { tvl: null, volume: null, fees: null }
    }), {}))

    const [selectedDex, setSelectedDex] = useState(Object.keys(totalStats)[0])

    const fetchStats = useCallback(() => {

        const { tvl, volume, fees } = totalStats[selectedDex]

        if (tvl !== null && volume !== null && fees !== null) {
            return
        }

        // const fetchApis = existingStats.filter(([dex, stats]) => !Boolean(stats[chartType])).reduce<{ [key: string]: string }>( (acc, [dex]) => ({
        //     ...acc,
        //     [dex]: apis[dex]
        // }), {})

        const requests = fetch(apis[selectedDex], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `query yearData {  
                    algebraDayDatas(first: 365, orderBy: date, orderDirection: desc) {    
                        date
                        tvlUSD
                        volumeUSD
                        feesUSD
                    }      
                }`
            })
        })
            .then(res => res.json())
            .then(({ data: { algebraDayDatas } }) => {

                if (algebraDayDatas) {

                    const { tvl, volume, fees } = algebraDayDatas.reduce((acc, { date, tvlUSD, volumeUSD, feesUSD }) => {
                        return {
                            tvl: [...acc.tvl, { time: date, value: Number(tvlUSD) }],
                            volume: [...acc.volume, { time: date, value: Number(volumeUSD) }],
                            fees: [...acc.fees, { time: date, value: Number(feesUSD) }]
                        }
                    }, { tvl: [], volume: [], fees: [] })

                    setTotalStats({
                        ...totalStats,
                        [selectedDex]: {
                            tvl: tvl.reverse(),
                            volume: volume.reverse(),
                            fees: fees.reverse()
                        }
                    })

                }

            })

            .catch(console.error)

    }, [apis, selectedDex, totalStats])

    useEffect(() => {
        fetchStats()
    }, [selectedDex])

    useEffect(() => console.log(totalStats), [totalStats])

    const { tvlData, volumeData, feesData } = useMemo(() => {

        if (!totalStats[selectedDex].tvl) return {}

        return {
            tvlData: totalStats[selectedDex].tvl,
            volumeData: totalStats[selectedDex].volume,
            feesData: totalStats[selectedDex].fees,
        }

    }, [totalStats, selectedDex])

    const { tvlCurrent, volumeCurrent, feesCurrent } = useMemo(() => {

        if (!totalStats[selectedDex].tvl) return {}

        return {
            tvlCurrent: format.format(tvlData[tvlData.length - 1].value),
            volumeCurrent: format.format(volumeData[volumeData.length - 1].value),
            feesCurrent: format.format(feesData[feesData.length - 1].value)
        }

    }, [totalStats, selectedDex, tvlData, volumeData, feesData])

    return <div className="flex flex-col w-full">
        <h2 className="font-bold text-center text-3xl mb-16">Integrated DEX-es</h2>
        <DexCards selectedDex={selectedDex} selectDex={(dex) => setSelectedDex(dex)} />
        <div className="p-8 bg-[#16151e] rounded-b-lg shadow-xl">
            <div className="flex flex-col pt-0 pl-8 pr-8 pb-8 mx-[-2rem] border-b-2 border-b-solid border-b-[#0f0e15]">
                <Chart chartData={tvlData} chartType={ChartType.AREA} chartTitle={'Total Value Locked'} chartCurrentValue={tvlCurrent}/>
            </div>
            <div className="flex flex-col pt-8 pl-8 pr-8 pb-8 mx-[-2rem] border-b-2 border-b-solid border-b-[#0f0e15]">
                <Chart chartData={volumeData} chartType={ChartType.BAR} chartTitle={'Volume 24H'} chartCurrentValue={volumeCurrent} color={'#64b5ab'}/>
            </div>
            <div className="flex flex-col pt-8 pl-8 pr-8 mx-[-2rem]">
                <Chart chartData={feesData} chartType={ChartType.BAR} chartTitle={'Collected Fees 24H'} chartCurrentValue={feesCurrent} color={'#d966a7'} />
            </div>
        </div>
    </div>
}