import { describe, it, expect } from 'vitest'
import { formatCurrency, formatNumber, formatDate, getHealthColor, getStatusColor } from '@/lib/utils'

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000')
      expect(formatCurrency(50000)).toBe('$50,000')
      expect(formatCurrency(0)).toBe('$0')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers correctly', () => {
      expect(formatNumber(1000000)).toBe('1,000,000')
      expect(formatNumber(50000)).toBe('50,000')
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      expect(formatDate('2024-01-15')).toBe('01/15/2024')
      expect(formatDate(new Date('2024-01-15'))).toBe('01/15/2024')
    })
  })

  describe('getHealthColor', () => {
    it('should return correct colors for health scores', () => {
      expect(getHealthColor(800)).toBe('text-green-600')
      expect(getHealthColor(600)).toBe('text-yellow-600')
      expect(getHealthColor(400)).toBe('text-red-600')
    })
  })

  describe('getStatusColor', () => {
    it('should return correct colors for status', () => {
      expect(getStatusColor('green')).toBe('status-green')
      expect(getStatusColor('yellow')).toBe('status-yellow')
      expect(getStatusColor('red')).toBe('status-red')
    })
  })
})
