'use client';

import React, { useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyMetric } from "@/lib/api";
import { useDashboardStore } from "@/store/dashboard-store";
import { Button } from "@/components/ui/button";
import { BarChart3, LineChart as LineChartIcon } from "lucide-react";
import { ParentSize } from "@visx/responsive";
import { scaleTime, scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { AreaClosed, LinePath, Bar } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import { Group } from "@visx/group";
import { GridRows, GridColumns } from "@visx/grid";
import { LinearGradient } from "@visx/gradient";
import { LegendOrdinal } from "@visx/legend";
import { scaleOrdinal } from "@visx/scale";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { bisector } from "d3-array";
import { timeFormat } from "d3-time-format";

const background = "transparent";
const engagementColor = "#8884d8";
const reachColor = "#82ca9d";
const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  padding: "0.5rem",
};

// Accessors
const getDate = (d: DailyMetric) => new Date(d.date);
const getEngagement = (d: DailyMetric) => Number(d.engagement);
const getReach = (d: DailyMetric) => Number(d.reach);
const bisectDate = bisector<DailyMetric, Date>((d) => new Date(d.date)).left;
const formatDate = timeFormat("%b %d");

interface InnerChartProps {
  width: number;
  height: number;
  data: DailyMetric[];
  chartViewType: "area" | "line";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  showTooltip: (args: any) => void;
  hideTooltip: () => void;
  tooltipOpen: boolean;
  tooltipData?: DailyMetric;
  tooltipLeft?: number;
  tooltipTop?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TooltipInPortal: React.ComponentType<any>;
}

const InnerChart = ({
  width,
  height,
  data,
  chartViewType,
  showTooltip,
  hideTooltip,
  tooltipOpen,
  tooltipData,
  tooltipLeft,
  tooltipTop,
  TooltipInPortal,
}: InnerChartProps) => {
  // Bounds
  const margin = { top: 20, right: 30, bottom: 50, left: 50 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Scales
  const xScale = useMemo(
    () =>
      scaleTime({
        range: [0, xMax],
        domain: [
          Math.min(...data.map((d) => getDate(d).getTime())),
          Math.max(...data.map((d) => getDate(d).getTime())),
        ],
      }),
    [xMax, data]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        domain: [
          0,
          Math.max(
            ...data.map((d) => Math.max(getEngagement(d), getReach(d)))
          ) * 1.1,
        ],
        nice: true,
      }),
    [yMax, data]
  );

  // Legend Scale
  const ordinalColorScale = scaleOrdinal({
    domain: ["Engagement", "Reach"],
    range: [engagementColor, reachColor],
  });

  // Tooltip handler
  const handleTooltip = useCallback(
    (
      event:
        | React.TouchEvent<SVGRectElement>
        | React.MouseEvent<SVGRectElement>
    ) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x - margin.left);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;
      if (d1 && getDate(d1)) {
        d =
          x0.valueOf() - getDate(d0).valueOf() >
          getDate(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: yScale(getEngagement(d)),
      });
    },
    [showTooltip, yScale, xScale, data, margin.left]
  );

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={background}
          rx={14}
        />
        <LinearGradient
          id="area-engagement-gradient"
          from={engagementColor}
          to={engagementColor}
          fromOpacity={0.8}
          toOpacity={0}
        />
        <LinearGradient
          id="area-reach-gradient"
          from={reachColor}
          to={reachColor}
          fromOpacity={0.8}
          toOpacity={0}
        />
        <Group left={margin.left} top={margin.top}>
          <GridRows
            scale={yScale}
            width={xMax}
            height={yMax}
            stroke="var(--border)"
            strokeOpacity={0.4}
          />
          <GridColumns
            scale={xScale}
            width={xMax}
            height={yMax}
            stroke="var(--border)"
            strokeOpacity={0.4}
          />

          {/* Reach Chart */}
          {chartViewType === "area" ? (
            <AreaClosed<DailyMetric>
              data={data}
              x={(d) => xScale(getDate(d)) ?? 0}
              y={(d) => yScale(getReach(d)) ?? 0}
              yScale={yScale}
              strokeWidth={1}
              stroke="url(#area-reach-gradient)"
              fill="url(#area-reach-gradient)"
              curve={curveMonotoneX}
            />
          ) : (
            <LinePath<DailyMetric>
              data={data}
              x={(d) => xScale(getDate(d)) ?? 0}
              y={(d) => yScale(getReach(d)) ?? 0}
              stroke={reachColor}
              strokeWidth={2}
              curve={curveMonotoneX}
            />
          )}

          {/* Engagement Chart */}
          {chartViewType === "area" ? (
            <AreaClosed<DailyMetric>
              data={data}
              x={(d) => xScale(getDate(d)) ?? 0}
              y={(d) => yScale(getEngagement(d)) ?? 0}
              yScale={yScale}
              strokeWidth={1}
              stroke="url(#area-engagement-gradient)"
              fill="url(#area-engagement-gradient)"
              curve={curveMonotoneX}
            />
          ) : (
            <LinePath<DailyMetric>
              data={data}
              x={(d) => xScale(getDate(d)) ?? 0}
              y={(d) => yScale(getEngagement(d)) ?? 0}
              stroke={engagementColor}
              strokeWidth={2}
              curve={curveMonotoneX}
            />
          )}

          <AxisBottom
            top={yMax}
            scale={xScale}
            numTicks={width > 520 ? 10 : 5}
            stroke="var(--border)"
            tickStroke="var(--border)"
            tickLabelProps={() => ({
              fill: "var(--muted-foreground)",
              fontSize: 11,
              textAnchor: "middle",
            })}
          />
          <AxisLeft
            scale={yScale}
            stroke="var(--border)"
            tickStroke="var(--border)"
            tickFormat={(val) => 
              new Intl.NumberFormat('en-US', {
                notation: "compact",
                compactDisplay: "short",
                maximumFractionDigits: 1,
              }).format(Number(val))
            }
            tickLabelProps={() => ({
              fill: "var(--muted-foreground)",
              fontSize: 11,
              textAnchor: "end",
              dx: -4,
              dy: 2.5,
            })}
          />

          {/* Tooltip Overlay */}
          <Bar
            x={0}
            y={0}
            width={xMax}
            height={yMax}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />

          {/* Tooltip Line Indicator */}
          {tooltipOpen && tooltipData && (
            <g>
              <LinePath
                data={[
                  { date: getDate(tooltipData).toISOString(), value: 0 },
                  { date: getDate(tooltipData).toISOString(), value: yMax },
                ]}
                x={(d) => xScale(new Date(d.date)) ?? 0}
                y={(d) => d.value}
                stroke="var(--muted-foreground)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <circle
                cx={xScale(getDate(tooltipData))}
                cy={yScale(getEngagement(tooltipData))}
                r={4}
                fill={engagementColor}
                stroke="white"
                strokeWidth={2}
              />
              <circle
                cx={xScale(getDate(tooltipData))}
                cy={yScale(getReach(tooltipData))}
                r={4}
                fill={reachColor}
                stroke="white"
                strokeWidth={2}
              />
            </g>
          )}
        </Group>
      </svg>

      {/* Legend */}
      <div className="absolute top-0 right-0 flex space-x-4 text-xs">
        <LegendOrdinal
          scale={ordinalColorScale}
          direction="row"
          labelMargin="0 15px 0 0"
        />
      </div>

      {/* Tooltip Content */}
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          <div className="font-semibold mb-1">
            {formatDate(getDate(tooltipData))}
          </div>
          <div style={{ color: engagementColor }}>
            Engagement: <strong>{getEngagement(tooltipData)}</strong>
          </div>
          <div style={{ color: reachColor }}>
            Reach: <strong>{getReach(tooltipData)}</strong>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
};

export default function EngagementChart({ data }: { data: DailyMetric[] }) {
  const { chartViewType, setChartViewType } = useDashboardStore();
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<DailyMetric>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  if (!data || data.length === 0) {
    // Generate dummy data for the empty state visualization
    const emptyStateData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
      engagement: 20 + Math.random() * 30,
      reach: 40 + Math.random() * 40,
      impressions: 0,
      saves: 0,
      shares: 0,
      comments: 0,
      likes: 0
    }));

    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Engagement Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-0 relative">
          {/* Blurred Chart Background */}
          <div className="h-[350px] w-full opacity-20 pointer-events-none filter blur-sm select-none">
            <ParentSize>
              {({ width, height }) =>
                width > 0 && height > 0 ? (
                  <InnerChart
                    width={width}
                    height={height}
                    data={emptyStateData}
                    chartViewType="area"
                    showTooltip={() => {}}
                    hideTooltip={() => {}}
                    tooltipOpen={false}
                    TooltipInPortal={TooltipInPortal}
                  />
                ) : null
              }
            </ParentSize>
          </div>

          {/* Empty State Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px] z-10">
            <div className="bg-background border rounded-full p-4 shadow-sm mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No Data Available</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] text-center mt-2">
              Engagement metrics will appear here once you start tracking your social media performance.
            </p>
            <Button variant="outline" className="mt-6" size="sm">
              Learn how to connect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Engagement Overview</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 border rounded-md p-1">
            <Button
              variant={chartViewType === "area" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setChartViewType("area")}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={chartViewType === "line" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setChartViewType("line")}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-0" ref={containerRef}>
        <div className="h-[350px] w-full">
          <ParentSize>
            {({ width, height }) =>
              width > 0 && height > 0 ? (
                <InnerChart
                  width={width}
                  height={height}
                  data={data}
                  chartViewType={chartViewType}
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                  tooltipOpen={tooltipOpen}
                  tooltipData={tooltipData}
                  tooltipLeft={tooltipLeft}
                  tooltipTop={tooltipTop}
                  TooltipInPortal={TooltipInPortal}
                />
              ) : null
            }
          </ParentSize>
        </div>
      </CardContent>
    </Card>
  );
}
