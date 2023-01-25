import { useCallback, useEffect, useMemo, useState } from "react"
import { apis } from "../shared/apis"
import { format } from "../shared/currency-formatter";
import { ChartType } from "./ChartLayout";

type ITotalStats = {
    [dex: string]: {
        tvl: number;
        volume: number;
        fees: number;
    }
}

type StatsCard = {
    value: number;
    change: number;
}

interface TotalStats {
    currentTVL: StatsCard;
    currentVolume: StatsCard;
    currentFees: StatsCard;
    selectedChart: ChartType,
    selectChart: (chart: ChartType) => void
}

export default function TotalStats({ currentTVL, currentVolume, currentFees, selectedChart, selectChart }: TotalStats) {

    const Loader = () => <span className="w-[24px] h-[24px] inline-block border-2 border-solid border-white rounded-full border-b-transparent animate-[rotation_1s_linear_infinite]"></span>

    const cards = [
        { title: 'Total Value Locked', type: ChartType.TVL, value: currentTVL?.value, change: currentTVL?.change },
        { title: 'Volume 24H', type: ChartType.VOLUME, value: currentVolume?.value, change: currentVolume?.change },
        { title: 'Collected Fees 24H', type: ChartType.FEES, value: currentFees?.value, change: currentFees?.change }
    ]

    return <div className="flex flex-col w-full h-full lg:rounded-bl-lg bg-[#0f0e15] shadow-xl">
        {
            cards.map((card, i) =>
                <div key={i} className={`flex-1 p-8 border-r-solid rounded-bl-lg border-r-2 ${selectedChart === card.type ? 'bg-[#130e28] border-r-[#36f]' : 'border-r-[#16151e] hover:bg-black hover:border-r-[#101c3d] cursor-pointer'}`} onClick={() => selectChart(card.type)}>
                    <div className="font-semibold text-lg mb-4">{card.title}</div>
                    {
                        card.value ?
                            <div className="flex items-center">
                                <div className="font-bold text-3xl">{format.format(card.value)}</div>
                                {
                                    card.type === ChartType.TVL ?
                                    <div className={`ml-4 ${card.change > 0 ? 'text-[#46ec46]' : 'text-[#ff4545]'}`}>
                                        <span>{card.change > 0 ? '+' : ''}</span>
                                        <span>{`${card.change.toFixed(2)}%`}</span>
                                    </div>
                                    : null
                                }
                            </div> : <div className="min-h-[36px]">
                                <Loader />
                            </div>
                    }
                </div>
            )
        }
    </div>

}