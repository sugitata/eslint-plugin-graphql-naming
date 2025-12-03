import { describe, it, expect } from 'vitest'
import {
  capitalizeTypeName,
  isValidName,
  generateExpectedName,
} from '../../src/utils/naming-utils.js'

describe('naming-utils', () => {
  describe('capitalizeTypeName', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeTypeName('user')).toBe('User')
    })

    it('should handle already capitalized', () => {
      expect(capitalizeTypeName('User')).toBe('User')
    })

    it('should handle empty string', () => {
      expect(capitalizeTypeName('')).toBe('')
    })

    it('should preserve rest of the string', () => {
      expect(capitalizeTypeName('orderForClient')).toBe('OrderForClient')
    })
  })

  describe('isValidName', () => {
    it('should return true for valid fragment name', () => {
      expect(isValidName('UsersUserCardUser', 'UsersUserCard', 'User')).toBe(
        true
      )
    })

    it('should return true for name with suffix', () => {
      expect(
        isValidName('UsersUserCardUserWithDetails', 'UsersUserCard', 'User')
      ).toBe(true)
    })

    it('should return false for invalid name', () => {
      expect(isValidName('UserCard', 'UsersUserCard', 'User')).toBe(false)
    })

    it('should return false for partial match', () => {
      expect(isValidName('UsersUser', 'UsersUserCard', 'User')).toBe(false)
    })
  })

  describe('generateExpectedName', () => {
    it('should generate expected name from prefix and type', () => {
      expect(generateExpectedName('UsersUserCard', 'User')).toBe(
        'UsersUserCardUser'
      )
    })

    it('should handle complex type names', () => {
      expect(generateExpectedName('HeaderOrderTask', 'OrderForClient')).toBe(
        'HeaderOrderTaskOrderForClient'
      )
    })

    it('should handle lowercase type name', () => {
      expect(generateExpectedName('PostsPostCard', 'post')).toBe(
        'PostsPostCardPost'
      )
    })
  })
})

