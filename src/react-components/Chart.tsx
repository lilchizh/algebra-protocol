import * as LightWeightCharts from "lightweight-charts";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { format } from "../shared/currency-formatter";

import { ChartType } from "./Charts";

interface IChart {
    chartData: any[];
    chartType: ChartType;
    chartTitle: string;
    chartCurrentValue: string;
    color?: string;
}

export default function Chart({ chartData, chartType, chartTitle, chartCurrentValue, color }: IChart) {

    const chartRef = useRef<HTMLDivElement>(null);

    const [series, setSeries] = useState<LightWeightCharts.ISeriesApi<"Line" | "Histogram"> | undefined>();
    const [chartCreated, setChart] = useState<LightWeightCharts.IChartApi | undefined>();

    const [displayValue, setDisplayValued] = useState(chartCurrentValue)

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
            height: chartRef.current.parentElement?.clientHeight || 400,
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
                visible: false
            },
            timeScale: {
                borderColor: "#585858",
            },
            handleScale: {
                mouseWheel: false
            },
            handleScroll: {
                pressedMouseMove: false
            }
        });

        let series;

        if (chartType === ChartType.AREA) {

            series = chart?.addAreaSeries({
                topColor: "rgba(161, 97, 255, 0.6)",
                bottomColor: "rgba(161, 97, 255, 0.04)",
                lineColor: "rgba(161, 97, 255, 1)",
                priceLineVisible: false
            });

        } else {
            series = chart?.addHistogramSeries({
                color,
                priceLineVisible: false
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
        <div className="font-bold text-1xl mb-2">{chartTitle}</div>
        <div className="font-bold text-3xl">{displayValue ? displayValue : chartCurrentValue ? chartCurrentValue : <span className="w-[24px] h-[24px] inline-block border-2 border-solid border-white rounded-full border-b-transparent animate-[rotation_1s_linear_infinite]"></span>}</div>
        <div>
        </div>
        <div className="relative">
            <div style={{ height: '400px' }} ref={chartRef}></div>
            {!chartData ? <div className="absolute flex items-center justify-center w-full h-full top-0">
                <span className="w-[48px] h-[48px] border-2 border-solid border-white rounded-full border-b-transparent animate-[rotation_1s_linear_infinite]"></span>
            </div> : null}
        </div>
    </>

}