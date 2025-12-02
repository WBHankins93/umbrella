import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { Box } from '@mui/material'
import type { ForecastChartData } from '../types/weather.types'

interface D3TemperatureChartProps {
  data: ForecastChartData[]
  width?: number
  height?: number
}

const D3TemperatureChart = ({
  data,
  width = 800,
  height = 400,
}: D3TemperatureChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 50, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Parse time and create scales
    const parseTime = d3.timeParse('%Y-%m-%d %H:%M:%S')
    const dataWithDates = data.map((d) => ({
      ...d,
      date: parseTime(d.time) || new Date(),
    }))

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dataWithDates, (d) => d.date) as [Date, Date])
      .range([0, innerWidth])

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(dataWithDates, (d) => Math.min(d.temp, d.feels_like))! - 5,
        d3.max(dataWithDates, (d) => Math.max(d.temp, d.feels_like))! + 5,
      ])
      .range([innerHeight, 0])

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )

    // Create gradient for temperature line
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'temp-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', yScale(yScale.domain()[1]))
      .attr('x2', 0)
      .attr('y2', yScale(yScale.domain()[0]))

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ff5722')

    gradient
      .append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#ffa726')

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#1976d2')

    // Create area under curve
    const area = d3
      .area<{ date: Date; temp: number }>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.temp))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(dataWithDates)
      .attr('fill', 'url(#temp-gradient)')
      .attr('fill-opacity', 0.2)
      .attr('d', area)

    // Create temperature line
    const line = d3
      .line<{ date: Date; temp: number }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.temp))
      .curve(d3.curveMonotoneX)

    const path = g
      .append('path')
      .datum(dataWithDates)
      .attr('fill', 'none')
      .attr('stroke', 'url(#temp-gradient)')
      .attr('stroke-width', 3)
      .attr('d', line)

    // Animate line drawing
    const totalLength = path.node()?.getTotalLength() || 0
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeQuadInOut)
      .attr('stroke-dashoffset', 0)

    // Create feels-like line
    const feelsLikeLine = d3
      .line<{ date: Date; feels_like: number }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.feels_like))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(dataWithDates)
      .attr('fill', 'none')
      .attr('stroke', '#9c27b0')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('d', feelsLikeLine)
      .attr('opacity', 0)
      .transition()
      .delay(500)
      .duration(1000)
      .attr('opacity', 0.6)

    // Add data points
    const circles = g
      .selectAll('circle')
      .data(dataWithDates)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.date))
      .attr('cy', (d) => yScale(d.temp))
      .attr('r', 0)
      .attr('fill', '#1976d2')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')

    circles
      .transition()
      .delay((d, i) => i * 50)
      .duration(300)
      .attr('r', 5)

    // Add interactivity
    circles
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)
          .attr('fill', '#ff5722')

        if (tooltipRef.current) {
          const tooltip = d3.select(tooltipRef.current)
          tooltip
            .style('opacity', 1)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .html(`
              <div style="font-weight: bold">${d.time}</div>
              <div>🌡️ Temperature: ${d.temp.toFixed(1)}°F</div>
              <div>🤚 Feels like: ${d.feels_like.toFixed(1)}°F</div>
              <div>💧 Humidity: ${d.humidity}%</div>
              <div>💨 Wind: ${d.windSpeed.toFixed(1)} mph</div>
              <div>🌧️ Precipitation: ${d.precipitation}%</div>
            `)
        }
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 5)
          .attr('fill', '#1976d2')

        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style('opacity', 0)
        }
      })

    // Add axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(8)
      .tickFormat((d) => d3.timeFormat('%a %H:%M')(d as Date))

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

    const yAxis = d3.axisLeft(yScale).ticks(8).tickFormat((d) => `${d}°F`)

    g.append('g').call(yAxis)

    // Add axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 45)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Time')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Temperature (°F)')

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 5])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('zoom', (event) => {
        const newXScale = event.transform.rescaleX(xScale)
        g.select<SVGGElement>('.x-axis').call(
          d3
            .axisBottom(newXScale)
            .ticks(8)
            .tickFormat((d) => d3.timeFormat('%a %H:%M')(d as Date))
        )

        g.selectAll<SVGPathElement, { date: Date; temp: number }[]>('path')
          .filter(function () {
            return d3.select(this).attr('stroke') !== null
          })
          .attr('d', (d) => {
            const newLine = d3
              .line<{ date: Date; temp: number }>()
              .x((pt) => newXScale(pt.date))
              .y((pt) => yScale(pt.temp))
              .curve(d3.curveMonotoneX)
            return newLine(d) || ''
          })

        g.selectAll<SVGCircleElement, { date: Date; temp: number }>('circle').attr(
          'cx',
          (d) => newXScale(d.date)
        )
      })

    svg.call(zoom)
  }, [data, width, height])

  return (
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
          lineHeight: '1.6',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          transition: 'opacity 0.2s',
          zIndex: 1000,
        }}
      />
    </Box>
  )
}

export default D3TemperatureChart
