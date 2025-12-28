'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface CandleGroup {
  open: number;
  close?: number;
  max: number;
  min: number;
  valueList: number[];
  startTime: number;
  durationMs: number;
  isComplete: boolean;
}

interface CandlestickChartCanvasProps {
  previousCandles: CandleGroup[];
  currentCandle?: CandleGroup;
  currentPrice: number;
  gameEnded: boolean;
  isHistoryMode?: boolean; // false = Live Mode, true = History Mode
  historyMergeCount?: number; // How many candles to show in history mode (default 20)
}

export function CandlestickChartCanvas({
  previousCandles,
  currentCandle,
  currentPrice,
  gameEnded,
  isHistoryMode = false,
  historyMergeCount = 20,
}: CandlestickChartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [yRange, setYRange] = useState<{ min: number; max: number }>({ min: 0.5, max: 1.5 });
  const [rugAnimationProgress, setRugAnimationProgress] = useState(0); // 0 to 1
  const rugAnimationStartTime = useRef<number | null>(null);

  // Start rug animation when game ends
  useEffect(() => {
    if (gameEnded && !isHistoryMode) {
      rugAnimationStartTime.current = Date.now();
    }
  }, [gameEnded, isHistoryMode]);

  // Merge candles for history mode
  const getMergedCandles = (candles: CandleGroup[], targetCount: number): CandleGroup[] => {
    if (candles.length <= targetCount) return candles;

    let merged = [...candles];

    while (merged.length > targetCount) {
      const newMerged: CandleGroup[] = [];

      // Merge pairs
      for (let i = 0; i < merged.length - 1; i += 2) {
        const c1 = merged[i];
        const c2 = merged[i + 1];

        newMerged.push({
          open: c1.open,
          close: c2.close,
          max: Math.max(c1.max, c2.max),
          min: Math.min(c1.min, c2.min),
          valueList: [],
          startTime: c1.startTime,
          durationMs: c1.durationMs + c2.durationMs,
          isComplete: true,
        });
      }

      // Handle odd candle
      if (merged.length % 2 === 1) {
        newMerged.push(merged[merged.length - 1]);
      }

      merged = newMerged;
    }

    return merged;
  };

  // Get candles to display based on mode
  const getDisplayCandles = (): CandleGroup[] => {
    if (isHistoryMode) {
      return getMergedCandles(previousCandles, historyMergeCount);
    }

    // Live mode: previous + current
    const candles = [...previousCandles];
    if (currentCandle) {
      candles.push(currentCandle);
    }
    return candles;
  };

  // Update Y-axis range based on current price
  useEffect(() => {
    const allCandles = getDisplayCandles();
    if (allCandles.length === 0 && currentPrice === 0) return;

    // Find price range
    let minPrice = currentPrice;
    let maxPrice = currentPrice;

    allCandles.forEach((candle) => {
      minPrice = Math.min(minPrice, candle.min);
      maxPrice = Math.max(maxPrice, candle.max);
    });

    // Check if we need to expand range (within 15% of edge)
    const currentMin = yRange.min;
    const currentMax = yRange.max;
    const range = currentMax - currentMin;
    const threshold = range * 0.15;

    let needsUpdate = false;
    let newMin = currentMin;
    let newMax = currentMax;

    // Expand upward if needed
    if (maxPrice >= currentMax - threshold) {
      newMax = maxPrice + range * 0.2;
      needsUpdate = true;
    }

    // Expand downward if needed
    if (minPrice <= currentMin + threshold) {
      newMin = Math.max(0, minPrice - range * 0.2); // Never go below 0
      needsUpdate = true;
    }

    if (needsUpdate) {
      setYRange({ min: newMin, max: newMax });
    }
  }, [currentPrice, previousCandles, currentCandle, isHistoryMode]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = { top: 40, right: 80, bottom: 40, left: 60 };

    const render = () => {
      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const width = rect.width;
      const height = rect.height;
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Clear canvas
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      // Value to Y coordinate converter
      const valueToY = (value: number) => {
        const normalized = (value - yRange.min) / (yRange.max - yRange.min);
        return padding.top + chartHeight * (1 - normalized);
      };

      // Draw grid lines
      drawGrid(ctx, padding, chartWidth, chartHeight, yRange.min, yRange.max, valueToY);

      // Draw Y-axis
      drawYAxis(ctx, padding, chartWidth, chartHeight, yRange.min, yRange.max);

      // Get candles to draw
      const displayCandles = getDisplayCandles();

      // Draw candles
      if (displayCandles.length > 0) {
        drawCandles(ctx, displayCandles, currentCandle, padding, chartWidth, chartHeight, valueToY, isHistoryMode);
      }

      // Draw current price line (live mode only)
      if (!isHistoryMode && currentPrice > 0) {
        let displayPrice = currentPrice;

        // Rug animation
        if (gameEnded) {
          const now = Date.now();
          if (rugAnimationStartTime.current) {
            const elapsed = now - rugAnimationStartTime.current;
            const progress = Math.min(elapsed / 500, 1); // 500ms animation
            setRugAnimationProgress(progress);
            displayPrice = currentPrice * (1 - progress); // Drop to 0
          }
        }

        drawCurrentPriceLine(ctx, displayPrice, padding, chartWidth, valueToY);
      }

      // Draw game over text (behind candles, so draw after clearing but before candles)
      if (gameEnded && !isHistoryMode && rugAnimationProgress >= 1) {
        drawGameOverText(ctx, width, height);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [previousCandles, currentCandle, currentPrice, gameEnded, yRange, isHistoryMode, rugAnimationProgress, historyMergeCount]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}

// Helper Functions

function drawGrid(
  ctx: CanvasRenderingContext2D,
  padding: any,
  chartWidth: number,
  chartHeight: number,
  yMin: number,
  yMax: number,
  valueToY: (value: number) => number
) {
  ctx.strokeStyle = '#1a1e24';
  ctx.lineWidth = 1;

  // Horizontal grid lines (price levels)
  const priceRange = yMax - yMin;
  const numLines = 8;
  const priceStep = priceRange / numLines;

  for (let i = 0; i <= numLines; i++) {
    const price = yMin + priceStep * i;
    const y = valueToY(price);

    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartWidth, y);
    ctx.stroke();
  }

  // Vertical grid lines
  const numVerticalLines = 10;
  for (let i = 0; i <= numVerticalLines; i++) {
    const x = padding.left + (chartWidth / numVerticalLines) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, padding.top + chartHeight);
    ctx.stroke();
  }
}

function drawYAxis(
  ctx: CanvasRenderingContext2D,
  padding: any,
  chartWidth: number,
  chartHeight: number,
  yMin: number,
  yMax: number
) {
  ctx.font = '12px monospace';
  ctx.fillStyle = '#8b949e';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  const priceRange = yMax - yMin;
  const numLabels = 8;
  const priceStep = priceRange / numLabels;

  for (let i = 0; i <= numLabels; i++) {
    const price = yMin + priceStep * i;
    const y = padding.top + chartHeight * (1 - i / numLabels);
    ctx.fillText(price.toFixed(2) + 'x', padding.left - 10, y);
  }
}

function drawCandles(
  ctx: CanvasRenderingContext2D,
  candles: CandleGroup[],
  currentCandle: CandleGroup | undefined,
  padding: any,
  chartWidth: number,
  chartHeight: number,
  valueToY: (value: number) => number,
  isHistoryMode: boolean
) {
  const totalCandles = candles.length;
  if (totalCandles === 0) return;

  const candleWidth = Math.max(4, Math.min(20, chartWidth / (totalCandles * 1.5)));
  const spacing = candleWidth * 0.3;
  const totalWidth = totalCandles * (candleWidth + spacing) - spacing;
  const startX = padding.left + (chartWidth - totalWidth) / 2;

  candles.forEach((candle, index) => {
    const x = startX + index * (candleWidth + spacing);

    const open = candle.open;
    const close = candle.close ?? candle.open;
    const max = candle.max;
    const min = candle.min;

    // Determine if this is the current candle
    const isCurrent = !isHistoryMode && currentCandle && candle === currentCandle;

    // Color based on direction
    let isGreen = close >= open;

    // For current candle, use live price comparison
    if (isCurrent && candle.valueList.length > 0) {
      const latestPrice = candle.valueList[candle.valueList.length - 1];
      isGreen = latestPrice >= open;
    }

    const color = isGreen ? '#26a69a' : '#ef5350';
    const wickColor = color;

    const yOpen = valueToY(open);
    const yClose = valueToY(close);
    const yHigh = valueToY(max);
    const yLow = valueToY(min);

    const bodyTop = Math.min(yOpen, yClose);
    const bodyBottom = Math.max(yOpen, yClose);
    const bodyHeight = Math.max(2, bodyBottom - bodyTop);

    // Draw wick
    ctx.strokeStyle = wickColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + candleWidth / 2, yHigh);
    ctx.lineTo(x + candleWidth / 2, yLow);
    ctx.stroke();

    // Draw body
    if (bodyHeight < 3) {
      // Doji - draw horizontal line
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, bodyTop);
      ctx.lineTo(x + candleWidth, bodyTop);
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
    }

    // Add glow for current candle
    if (isCurrent) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.strokeRect(x - 2, bodyTop - 2, candleWidth + 4, bodyHeight + 4);
      ctx.globalAlpha = 1;
    }
  });
}

function drawCurrentPriceLine(
  ctx: CanvasRenderingContext2D,
  price: number,
  padding: any,
  chartWidth: number,
  valueToY: (value: number) => number
) {
  const y = valueToY(price);

  // Draw dotted line
  ctx.strokeStyle = '#58a6ff';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(padding.left, y);
  ctx.lineTo(padding.left + chartWidth, y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw price label (10px above the line)
  ctx.fillStyle = '#58a6ff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`${price.toFixed(2)}x`, padding.left + 10, y - 10);
}

function drawGameOverText(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.save();

  // Move to center
  ctx.translate(width / 2, height / 2);

  // Rotate 10 degrees left (counter-clockwise)
  ctx.rotate(-10 * Math.PI / 180);

  // Draw text
  ctx.font = 'bold 72px monospace';
  ctx.fillStyle = '#aa1122';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.3; // Semi-transparent (behind candles effect)

  ctx.fillText('GAME OVER', 0, 0);

  ctx.restore();
}
