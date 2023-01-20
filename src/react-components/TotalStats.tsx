import { useCallback, useEffect, useMemo, useState } from "react"
import { apis } from "../shared/apis"
import { format } from "../shared/currency-formatter";

type ITotalStats = { [dex: string]: {  tvl: number;
    volume: number;
    fees: number; } }

export default function TotalStats () {

    const [totalStats, setTotalStats] = useState<ITotalStats>(Object.keys(apis).reduce( (acc, dex) => ({
        ...acc,
        [dex]: { tvl: null, volume: null, fees: null } 
    }), {} ))

    const fetchStats = useCallback(() => {

        const existingStats = Object.entries(totalStats)
        
        if (existingStats.every(([dex, { tvl, volume, fees }]) => tvl && volume && fees )) {
            return
        }

        const fetchApis = existingStats.filter(([dex, { tvl, volume, fees }]) => !Boolean(tvl && volume && fees)).reduce<{ [key: string]: string }>( (acc, [dex]) => ({
            ...acc,
            [dex]: apis[dex]
        }), {})
        
        const requests = Object.values(fetchApis).map( api => fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `query totalStats {  
                    factories {    
                        totalValueLockedUSD
                    }
                    algebraDayDatas(first: 2, orderBy: date, orderDirection: desc) {    
                        date
                        volumeUSD
                        feesUSD
                    }
                }`
            })
        })
            .then(res => res.json())
            .catch(err => console.log('aa', err))

        )

        Promise.allSettled<{ data: { factories: any, algebraDayDatas: any } }>(requests)
            .then( datas => datas.map( (res) => res.status === 'fulfilled' ? [res.value.data.factories, res.value.data.algebraDayDatas] : null) )
            .then(datas => Object.keys(fetchApis).reduce((acc, dex, i) => ({
                ...acc,
                [dex]: datas[i]
            }) , {}) )
            .then(dexes => Object.entries(dexes).reduce((acc, [dex, data]: [string, any[]]) => {
                if (data[0]) {
                    return {
                        ...acc,
                        [dex]: {
                            tvl: Number(data[0][0].totalValueLockedUSD),
                            volume: Number(data[1][1].volumeUSD) - Number(data[1][0].volumeUSD),
                            fees: Number(data[1][1].feesUSD) - Number(data[1][0].feesUSD),
                        }
                    }
                }
            }, {
                ...totalStats
            }))
            .then(stats => setTotalStats(stats))
            .catch(v => console.error(v))

    }, [apis, totalStats])

    useEffect(() => {
        fetchStats()
    }, [])

    const { tvl, volume, fees } = useMemo(() => {

        let tvl = 0, volume = 0, fees = 0;

        for (const dex in totalStats) {
            tvl += (totalStats[dex].tvl || 0)
            volume += (totalStats[dex].volume || 0)
            fees += (totalStats[dex].fees || 0)
        }

        return { 
            tvl: Math.round(tvl), 
            volume: Math.round(volume), 
            fees: Math.round(fees) 
        }

    }, [totalStats])

    const Loader = () => <span className="w-[24px] h-[24px] inline-block border-2 border-solid border-white rounded-full border-b-transparent animate-[rotation_1s_linear_infinite]"></span> 

    return <div className="flex flex-col lg:flex-row w-full gap-8 lg:gap-0 lg:w-[80%] p-8 ml-auto mr-auto lg:rounded-lg justify-between mt-16 mb-16 text-center bg-[#0f0e15] shadow-xl">
        <div>
            <div className="font-semibold text-3xl">{tvl ? format.format(tvl) : <Loader/>}</div>
            <div className="font-medium text-lg mt-4">Total Value Locked</div>
        </div>
        <div>
            <div className="font-semibold text-3xl">{volume ? format.format(volume) : <Loader/>}</div>
            <div className="font-medium text-lg mt-4">Volume 24H</div>
        </div>
        <div>
            <div className="font-semibold text-3xl">{fees ? format.format(fees) : <Loader/>}</div>
            <div className="font-medium text-lg mt-4">Collected Fees 24H</div>
        </div>
    </div>

}