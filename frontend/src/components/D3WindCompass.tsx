import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { Box, Typography } from '@mui/material'

interface D3WindCompassProps {
  windSpeed: number // in mph
  windDeg: number // in degrees
  windGust?: number // in mph
  size?: number
}

const D3WindCompass = ({
  windSpeed,
  windDeg,
  windGust,
  size = 250,
}: D3WindCompassProps) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    const radius = size / 2 - 20
    const center = size / 2

    const svg = d3
      .select(svgRef.current)
      .attr('width', size)
      .attr('height', size)

    const g = svg.append('g').attr('transform', `translate(${center},${center})`)

    // Create radial gradient
    const gradient = svg
      .append('defs')
      .append('radialGradient')
      .attr('id', 'wind-gradient')

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#e3f2fd')
      .attr('stop-opacity', 0.8)

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#1976d2')
      .attr('stop-opacity', 0.1)

    // Draw outer circle (compass face)
    g.append('circle')
      .attr('r', radius)
      .attr('fill', 'url(#wind-gradient)')
      .attr('stroke', '#1976d2')
      .attr('stroke-width', 3)

    // Draw speed rings
    const speedRings = 3
    for (let i = 1; i <= speedRings; i++) {
      g.append('circle')
        .attr('r', (radius * i) / speedRings)
        .attr('fill', 'none')
        .attr('stroke', '#1976d2')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.2)
        .attr('stroke-dasharray', '3,3')
    }

    // Cardinal directions
    const directions = [
      { label: 'N', angle: 0 },
      { label: 'E', angle: 90 },
      { label: 'S', angle: 180 },
      { label: 'W', angle: 270 },
      { label: 'NE', angle: 45 },
      { label: 'SE', angle: 135 },
      { label: 'SW', angle: 225 },
      { label: 'NW', angle: 315 },
    ]

    // Draw direction markers
    directions.forEach((dir) => {
      const angle = ((dir.angle - 90) * Math.PI) / 180
      const x = Math.cos(angle) * (radius + 10)
      const y = Math.sin(angle) * (radius + 10)

      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', dir.label.length === 1 ? '18px' : '12px')
        .attr('font-weight', dir.label.length === 1 ? 'bold' : 'normal')
        .attr('fill', dir.label.length === 1 ? '#1976d2' : '#666')
        .text(dir.label)

      // Draw tick marks
      const tickStart = radius - 5
      const tickEnd = radius + 5
      const x1 = Math.cos(angle) * tickStart
      const y1 = Math.sin(angle) * tickStart
      const x2 = Math.cos(angle) * tickEnd
      const y2 = Math.sin(angle) * tickEnd

      g.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#1976d2')
        .attr('stroke-width', dir.label.length === 1 ? 3 : 1.5)
        .attr('opacity', 0.5)
    })

    // Calculate arrow path based on wind speed (longer for stronger wind)
    const maxArrowLength = radius * 0.7
    const arrowLength = Math.min((windSpeed / 50) * maxArrowLength, maxArrowLength)

    // Create arrow group
    const arrow = g.append('g').attr('class', 'wind-arrow')

    // Draw arrow shaft
    arrow
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', -arrowLength)
      .attr('stroke', '#ff5722')
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .attr('opacity', 1)

    // Draw arrow head
    const arrowHeadSize = 15
    arrow
      .append('polygon')
      .attr(
        'points',
        `0,${-arrowLength - arrowHeadSize} ${-arrowHeadSize / 2},${-arrowLength} ${arrowHeadSize / 2},${-arrowLength}`
      )
      .attr('fill', '#ff5722')
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .attr('opacity', 1)

    // Add glow effect for gust
    if (windGust && windGust > windSpeed) {
      arrow
        .append('circle')
        .attr('r', arrowLength / 3)
        .attr('fill', '#ff5722')
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .delay(500)
        .attr('opacity', 0.15)
        .transition()
        .duration(1500)
        .ease(d3.easeSinInOut)
        .attr('r', arrowLength / 2)
        .attr('opacity', 0)
        .on('end', function repeat() {
          d3.select(this)
            .attr('r', arrowLength / 3)
            .attr('opacity', 0.15)
            .transition()
            .duration(1500)
            .ease(d3.easeSinInOut)
            .attr('r', arrowLength / 2)
            .attr('opacity', 0)
            .on('end', repeat)
        })
    }

    // Rotate arrow to wind direction
    arrow
      .attr('transform', 'rotate(0)')
      .transition()
      .duration(1500)
      .ease(d3.easeBackOut)
      .attr('transform', `rotate(${windDeg})`)

    // Add center dot
    g.append('circle')
      .attr('r', 6)
      .attr('fill', '#1976d2')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)

    // Add speed indicator arc
    const arcGenerator = d3
      .arc()
      .innerRadius(radius - 30)
      .outerRadius(radius - 15)
      .startAngle(0)
      .endAngle((Math.min(windSpeed / 50, 1) * Math.PI * 2) as any)

    g.append('path')
      .attr('d', arcGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#4caf50')
      .attr('stroke-width', 3)
      .attr('opacity', 0)
      .transition()
      .duration(1500)
      .delay(500)
      .attr('opacity', 0.7)

    // Add speed scale labels
    const speedLabels = [0, 15, 30, 45]
    speedLabels.forEach((speed, i) => {
      const angle = ((speed / 50) * 360 - 90) * (Math.PI / 180)
      const labelRadius = radius - 22
      const x = Math.cos(angle) * labelRadius
      const y = Math.sin(angle) * labelRadius

      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .attr('opacity', 0)
        .text(`${speed}`)
        .transition()
        .delay(1500 + i * 100)
        .duration(500)
        .attr('opacity', 0.6)
    })
  }, [windSpeed, windDeg, windGust, size])

  const getWindDirection = (deg: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(deg / 22.5) % 16
    return directions[index]
  }

  const getWindCategory = (speed: number): { label: string; color: string } => {
    if (speed < 1) return { label: 'Calm', color: '#9e9e9e' }
    if (speed < 8) return { label: 'Light Air', color: '#4caf50' }
    if (speed < 13) return { label: 'Light Breeze', color: '#8bc34a' }
    if (speed < 19) return { label: 'Gentle Breeze', color: '#cddc39' }
    if (speed < 25) return { label: 'Moderate Breeze', color: '#ffeb3b' }
    if (speed < 32) return { label: 'Fresh Breeze', color: '#ffc107' }
    if (speed < 39) return { label: 'Strong Breeze', color: '#ff9800' }
    if (speed < 47) return { label: 'Near Gale', color: '#ff5722' }
    if (speed < 55) return { label: 'Gale', color: '#f44336' }
    if (speed < 64) return { label: 'Strong Gale', color: '#e91e63' }
    if (speed < 73) return { label: 'Storm', color: '#9c27b0' }
    return { label: 'Hurricane', color: '#673ab7' }
  }

  const windCategory = getWindCategory(windSpeed)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <svg ref={svgRef} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: windCategory.color, fontWeight: 'bold' }}>
          {windSpeed.toFixed(1)} mph
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          {getWindDirection(windDeg)} ({windDeg}°)
        </Typography>
        <Typography variant="caption" sx={{ color: windCategory.color }}>
          {windCategory.label}
        </Typography>
        {windGust && windGust > windSpeed && (
          <Typography variant="caption" sx={{ display: 'block', color: '#ff5722', mt: 0.5 }}>
            Gusts up to {windGust.toFixed(1)} mph
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default D3WindCompass
