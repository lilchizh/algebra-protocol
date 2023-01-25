import * as LightWeightCharts from "lightweight-charts";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { format } from "../shared/currency-formatter";

import { ChartSpan, ChartView } from "./Charts";


interface IChart {
    chartData: any[];
    chartType: ChartView;
    chartTitle: string;
    chartCurrentValue: string;
    chartSpan: ChartSpan;
    setChartSpan: (chartSpan: ChartSpan) => void
}

export default function Chart({ chartData, chartType, chartTitle, chartCurrentValue, chartSpan, setChartSpan }: IChart) {

    const chartRef = useRef<HTMLDivElement>(null);

    const [series, setSeries] = useState<LightWeightCharts.ISeriesApi<"Line" | "Histogram"> | undefined>();
    const [chartCreated, setChart] = useState<LightWeightCharts.IChartApi | undefined>();

    const [displayValue, setDisplayValued] = useState(chartCurrentValue)
    const [displayDate, setDisplayDate] = useState(new Date().toLocaleDateString())

    const handleResize = useCallback(() => {
        if (chartCreated && chartRef?.current?.parentElement) {
            chartCreated.resize(chartRef.current.offsetWidth - 32, chartRef.current.offsetHeight);
            chartCreated.timeScale().fitContent();
            chartCreated.timeScale().scrollToPosition(0, false);
        }
    }, [chartCreated, chartRef, chartRef]);

    // add event listener for resize
    const isClient = typeof window === "object";
    useEffect(() => {
        if (!isClient) {
            return;
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isClient, chartRef, handleResize]); // Empty array ensures that effect is only run on mount and unmount


    useEffect(() => {
        if (!chartData && chartCreated && series) {
            chartCreated.remove()
            chartCreated.unsubscribeCrosshairMove(crosshairMoveHandler)
        }
    }, [chartData, chartCreated, series])

    useLayoutEffect(() => {
        if (!chartRef.current || !chartData) return;

        if (chartRef.current.hasChildNodes()) chartRef.current.innerHTML = "";

        const chart = LightWeightCharts.createChart(chartRef.current, {
            width: chartRef.current.parentElement?.clientWidth,
            height: chartRef.current.parentElement?.clientHeight || 300,
            layout: {
                backgroundColor: "transparent",
                textColor: "#585858",
            },
            grid: {
                vertLines: {
                    color: "rgba(197, 203, 206, 0.0)",
                },
                horzLines: {
                    color: "rgba(197, 203, 206, 0.0)",
                },
            },
            crosshair: {
                mode: LightWeightCharts.CrosshairMode.Magnet,
            },
            rightPriceScale: {
                borderColor: "#eaeaea",
            },
            timeScale: {
                borderColor: "#585858",
            },
            handleScale: {
                mouseWheel: false,
            },
            handleScroll: {
                pressedMouseMove: false,
                vertTouchDrag: false,
                horzTouchDrag: false
            }
        });

        let series;

        if (chartType === ChartView.AREA) {

            series = chart?.addAreaSeries({
                topColor: "rgba(161, 97, 255, 0.6)",
                bottomColor: "rgba(161, 97, 255, 0.04)",
                lineColor: "rgba(161, 97, 255, 1)",
                priceFormat: {
                    type: 'custom',
                    formatter: (price) => format.format(price)
                },
                autoscaleInfoProvider: () => ({
                    priceRange: {
                        minValue: 0,
                        maxValue: Math.max(...chartData.map(v => v.value))
                    }
                })
            });

        } else {
            series = chart?.addHistogramSeries({
                color: "rgba(161, 97, 255, 1)",
                priceLineVisible: false,
                priceFormat: {
                    type: 'custom',
                    formatter: (price) => format.format(price)
                },
                autoscaleInfoProvider: () => ({
                    priceRange: {
                        minValue: 0,
                        maxValue: Math.max(...chartData.map(v => v.value))
                    }
                })
            });
        }

        series.setData(chartData)

        chart.timeScale().fitContent();

        setChart(chart);
        setSeries(series)


    }, [chartRef, chartData]);

    const crosshairMoveHandler = useCallback((param) => {
        if (param.point) {
            setDisplayValued(format.format(param.seriesPrices.get(series)))
            setDisplayDate(new Date(param.time * 1000).toLocaleDateString())
        } else {
            setDisplayValued(chartCurrentValue)
        }
    }, [series, chartCurrentValue])

    useEffect(() => {

        if (!chartCreated) return

        chartCreated.subscribeCrosshairMove(crosshairMoveHandler)

        return () => chartCreated.unsubscribeCrosshairMove(crosshairMoveHandler)

    }, [chartCreated])

    useEffect(() => {
        setDisplayValued(chartCurrentValue)
    }, [chartCurrentValue])

    return <>
        <div className="flex flex-col lg:flex-row items-start lg:justify-between">

            <div>

                <div className="font-bold text-1xl mb-2">{chartTitle}</div>

                <div className="font-bold text-3xl mb-2">
                    {displayValue ? displayValue : chartCurrentValue ? chartCurrentValue : <div className="min-h-[56px]">
                        <span className="w-[24px] h-[24px] inline-block border-2 border-solid border-white rounded-full border-b-transparent animate-[rotation_1s_linear_infinite]"></span>
                        </div>}
                </div>

                <div className="text-[#b7b7b7] text-sm">
                    {displayValue ? displayDate : null}
                </div>

            </div>

            <div className="flex w-full lg:w-fit bg-[#0a090f] text-center cursor-pointer rounded-md text-sm mt-4 lg:mt-0 mb-4 lg:mb-0">
                <div className={`py-2 px-4 w-full border-2 border-solid rounded-l-md ${chartSpan === ChartSpan.MONTH ? 'border-[#36f] bg-[#130e28]' : 'border-[#0a090f] hover:bg-black'}`} onClick={() => setChartSpan(ChartSpan.MONTH)}>30D</div>
                <div className={`py-2 px-4 w-full border-2 border-solid ${chartSpan === ChartSpan.THREE_MONTH ? 'border-[#36f] bg-[#130e28]' : 'border-[#0a090f] hover:bg-black'}`} onClick={() => setChartSpan(ChartSpan.THREE_MONTH)}>3M</div>
                <div className={`py-2 px-4 w-full border-2 border-solid rounded-r-md ${chartSpan === ChartSpan.YEAR ? 'border-[#36f] bg-[#130e28]' : 'border-[#0a090f] hover:bg-black'}`} onClick={() => setChartSpan(ChartSpan.YEAR)}>All</div>
            </div>

        </div>
        <div className="relative">
            <div style={{ height: '300px' }} ref={chartRef}></div>
            {!chartData ? <div className="absolute flex items-center justify-center w-full h-full top-0">
                <span className="w-[48px] h-[48px] border-2 border-solid border-white rounded-full border-b-transparent animate-[rotation_1s_linear_infinite]"></span>
            </div> : null}
        </div>
    </>

}