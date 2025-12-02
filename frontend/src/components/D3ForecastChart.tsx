import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'
import type { ForecastChartData } from '../types/weather.types'

interface D3ForecastChartProps {
  data: ForecastChartData[]
  width?: number
  height?: number
}

type MetricType = 'temperature' | 'precipitation' | 'humidity' | 'pressure'

const D3ForecastChart = ({
  data,
  width = 800,
  height = 400,
}: D3ForecastChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('temperature')

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    const margin = { top: 30, right: 80, bottom: 60, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Parse time
    const parseTime = d3.timeParse('%Y-%m-%d %H:%M:%S')
    const dataWithDates = data.map((d) => ({
      ...d,
      date: parseTime(d.time) || new Date(),
    }))

    // Create scales based on selected metric
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dataWithDates, (d) => d.date) as [Date, Date])
      .range([0, innerWidth])

    let yScale: d3.ScaleLinear<number, number>
    let yAxisLabel: string
    let getValue: (d: any) => number
    let color: string
    let unit: string

    switch (selectedMetric) {
      case 'temperature':
        yScale = d3
          .scaleLinear()
          .domain([
            d3.min(dataWithDates, (d) => d.temp)! - 5,
            d3.max(dataWithDates, (d) => d.temp)! + 5,
          ])
          .range([innerHeight, 0])
        yAxisLabel = 'Temperature (°F)'
        getValue = (d) => d.temp
        color = '#ff5722'
        unit = '°F'
        break
      case 'precipitation':
        yScale = d3
          .scaleLinear()
          .domain([0, Math.max(d3.max(dataWithDates, (d) => d.precipitation)! + 10, 100)])
          .range([innerHeight, 0])
        yAxisLabel = 'Precipitation Chance (%)'
        getValue = (d) => d.precipitation
        color = '#2196f3'
        unit = '%'
        break
      case 'humidity':
        yScale = d3
          .scaleLinear()
          .domain([0, 100])
          .range([innerHeight, 0])
        yAxisLabel = 'Humidity (%)'
        getValue = (d) => d.humidity
        color = '#00bcd4'
        unit = '%'
        break
      case 'pressure':
        yScale = d3
          .scaleLinear()
          .domain([
            d3.min(dataWithDates, (d) => d.pressure)! - 5,
            d3.max(dataWithDates, (d) => d.pressure)! + 5,
          ])
          .range([innerHeight, 0])
        yAxisLabel = 'Pressure (hPa)'
        getValue = (d) => d.pressure
        color = '#9c27b0'
        unit = ' hPa'
        break
    }

    // Add grid
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )

    // Create area
    const area = d3
      .area<any>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(getValue(d)))
      .curve(d3.curveMonotoneX)

    const areaPath = g
      .append('path')
      .datum(dataWithDates)
      .attr('fill', color)
      .attr('fill-opacity', 0.2)
      .attr('d', area)

    // Animate area
    const areaLength = areaPath.node()?.getTotalLength() || 0
    areaPath
      .attr('stroke-dasharray', `${areaLength} ${areaLength}`)
      .attr('stroke-dashoffset', areaLength)
      .attr('stroke', 'none')
      .transition()
      .duration(1000)
      .attr('stroke-dashoffset', 0)

    // Create line
    const line = d3
      .line<any>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(getValue(d)))
      .curve(d3.curveMonotoneX)

    const linePath = g
      .append('path')
      .datum(dataWithDates)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('d', line)

    // Animate line
    const lineLength = linePath.node()?.getTotalLength() || 0
    linePath
      .attr('stroke-dasharray', `${lineLength} ${lineLength}`)
      .attr('stroke-dashoffset', lineLength)
      .transition()
      .duration(1500)
      .ease(d3.easeQuadInOut)
      .attr('stroke-dashoffset', 0)

    // Add bars for precipitation
    if (selectedMetric === 'precipitation') {
      const bars = g
        .selectAll('rect')
        .data(dataWithDates)
        .enter()
        .append('rect')
        .attr('x', (d) => xScale(d.date) - 3)
        .attr('y', innerHeight)
        .attr('width', 6)
        .attr('height', 0)
        .attr('fill', color)
        .attr('opacity', 0.3)

      bars
        .transition()
        .delay((_d, i) => i * 30)
        .duration(500)
        .attr('y', (d) => yScale(getValue(d)))
        .attr('height', (d) => innerHeight - yScale(getValue(d)))
    }

    // Add data points
    const circles = g
      .selectAll('circle')
      .data(dataWithDates)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.date))
      .attr('cy', (d) => yScale(getValue(d)))
      .attr('r', 0)
      .attr('fill', color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')

    circles
      .transition()
      .delay((_d, i) => i * 40 + 500)
      .duration(300)
      .attr('r', 4)

    // Interactivity
    circles
      .on('mouseover', function (event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 7)

        if (tooltipRef.current) {
          const tooltip = d3.select(tooltipRef.current)
          tooltip
            .style('opacity', 1)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .html(`
              <div style="font-weight: bold; margin-bottom: 4px">${d.time}</div>
              <div>🌡️ ${d.temp.toFixed(1)}°F</div>
              <div>💧 ${d.humidity}% humidity</div>
              <div>🌧️ ${d.precipitation}% precip</div>
              <div>📊 ${d.pressure} hPa</div>
              <div>💨 ${d.windSpeed.toFixed(1)} mph</div>
            `)
        }
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration(200).attr('r', 4)

        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style('opacity', 0)
        }
      })

    // Add axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat((d) => d3.timeFormat('%a %I%p')(d as Date))

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-30)')
      .style('text-anchor', 'end')

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(8)
      .tickFormat((d) => `${d}${unit}`)

    g.append('g').call(yAxis)

    // Add axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 50)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Time')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text(yAxisLabel)

    // Add title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', color)
      .text(`${yAxisLabel} - 5 Day Forecast`)

    // Add average line
    const avgValue = d3.mean(dataWithDates, getValue) || 0
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(avgValue))
      .attr('y2', yScale(avgValue))
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0)
      .transition()
      .delay(1500)
      .duration(500)
      .attr('opacity', 0.4)

    // Add average label
    g.append('text')
      .attr('x', innerWidth + 5)
      .attr('y', yScale(avgValue) + 4)
      .style('font-size', '11px')
      .style('fill', color)
      .attr('opacity', 0)
      .text(`Avg: ${avgValue.toFixed(1)}${unit}`)
      .transition()
      .delay(1500)
      .duration(500)
      .attr('opacity', 0.7)
  }, [data, width, height, selectedMetric])

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={selectedMetric}
          exclusive
          onChange={(_, value) => value && setSelectedMetric(value)}
          size="small"
        >
          <ToggleButton value="temperature">🌡️ Temperature</ToggleButton>
          <ToggleButton value="precipitation">🌧️ Precipitation</ToggleButton>
          <ToggleButton value="humidity">💧 Humidity</ToggleButton>
          <ToggleButton value="pressure">📊 Pressure</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <svg ref={svgRef} style={{ width: '100%', height: 'auto' }} />
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            opacity: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            pointerEvents: 'none',
            fontSize: '13px',
            lineHeight: '1.8',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            transition: 'opacity 0.2s',
            zIndex: 1000,
          }}
        />
      </Box>
    </Box>
  )
}

export default D3ForecastChart
