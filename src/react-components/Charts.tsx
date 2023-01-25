import { useCallback, useEffect, useMemo, useState } from "react"
import { apis } from "../shared/apis"
import { format } from "../shared/currency-formatter";
import Chart from "./Chart"
import { ChartType } from "./ChartLayout";
import DexCards from "./DexCards";

export enum ChartView {
    AREA,
    BAR
}

export enum ChartSpan {
    YEAR = 365,
    THREE_MONTH = 90,
    MONTH = 30
}

type ChartPiece = { time: number, value: number };

type StatsData = { [key: string]: { tvl: ChartPiece[] | null, volume: ChartPiece[] | null, fees: ChartPiece[] | null } }

interface ICharts {
    chartData: ChartPiece[] | undefined;
    chartType: ChartType;
    chartDEX: string;
    chartSpan: ChartSpan;
    setChartSpan: (chartSpan: ChartSpan) => void
}

export default function Charts( { chartData, chartType, chartDEX, chartSpan, setChartSpan }: ICharts ) {

    const currentValue = useMemo(() => {

        if (!chartData) return

        return format.format(chartData[chartData.length - 1].value)

    }, [chartData])

    const chartView = chartType === ChartType.TVL ? ChartView.AREA : ChartView.BAR

    const chartTitle = `${chartType} ${chartDEX ? `(${chartDEX})` : ''}`

    return <div className="flex flex-col w-full h-full px-8 pt-8 bg-[#16151e] rounded-br-lg shadow-xl">
            <div className="flex flex-col pt-0 pl-8 pr-8 pb-8 mx-[-2rem]">
                <Chart chartData={chartData} chartType={chartView} chartTitle={chartTitle} chartCurrentValue={currentValue} chartSpan={chartSpan} setChartSpan={setChartSpan} />
            </div>
    </div>
}