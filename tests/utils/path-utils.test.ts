import { describe, it, expect } from 'vitest'
import {
  extractPathInfo,
  toPascalCase,
  calculatePrefix,
  hasSignificantOverlap,
  calculatePrefixWithTypeName,
} from '../../src/utils/path-utils.js'

describe('path-utils', () => {
  describe('toPascalCase', () => {
    it('should convert hyphenated string to PascalCase', () => {
      expect(toPascalCase('user-card')).toBe('UserCard')
    })

    it('should convert underscored string to PascalCase', () => {
      expect(toPascalCase('user_list')).toBe('UserList')
    })

    it('should handle brackets', () => {
      expect(toPascalCase('[id]')).toBe('Id')
    })

    it('should handle already PascalCase', () => {
      expect(toPascalCase('UserCard')).toBe('UserCard')
    })

    it('should handle lowercase', () => {
      expect(toPascalCase('users')).toBe('Users')
    })

    it('should handle mixed case with hyphens', () => {
      expect(toPascalCase('user-Profile-card')).toBe('UserProfileCard')
    })
  })

  describe('extractPathInfo', () => {
    it('should extract dir and file name from Vue component path', () => {
      const result = extractPathInfo(
        '/path/to/features/users/components/UserCard.vue'
      )
      expect(result.dirName).toBe('users')
      expect(result.fileName).toBe('UserCard')
    })

    it('should extract dir and file name from nested component path', () => {
      const result = extractPathInfo(
        '/path/to/engine/components/organisms/OrderDetail/Main/Header/OrderTask.client.fragment.ts'
      )
      expect(result.dirName).toBe('Header')
      expect(result.fileName).toBe('OrderTask')
    })

    it('should skip [id] directory', () => {
      const result = extractPathInfo(
        '/path/to/features/orders/[id]/components/OrderForm.vue'
      )
      // [id] is skipped, so we look at components, which is also skipped
      expect(result.dirName).toBe('id')
      expect(result.fileName).toBe('OrderForm')
    })

    it('should handle file without extension dots', () => {
      const result = extractPathInfo('/path/to/users/UserList.vue')
      expect(result.dirName).toBe('users')
      expect(result.fileName).toBe('UserList')
    })

    it('should handle custom skipDirs', () => {
      const result = extractPathInfo(
        '/path/to/features/users/pages/UserPage.vue',
        { skipDirs: ['pages'] }
      )
      expect(result.dirName).toBe('users')
      expect(result.fileName).toBe('UserPage')
    })

    it('should handle brackets in file name', () => {
      const result = extractPathInfo('/path/to/pages/[userId].vue')
      expect(result.fileName).toBe('userId')
    })
  })

  describe('calculatePrefix', () => {
    it('should calculate prefix from components path', () => {
      const result = calculatePrefix(
        '/path/to/features/users/components/UserCard.vue'
      )
      expect(result).toBe('UsersUserCard')
    })

    it('should calculate prefix from nested path', () => {
      const result = calculatePrefix(
        '/path/to/engine/components/organisms/OrderDetail/Main/Header/OrderTask.client.fragment.ts'
      )
      expect(result).toBe('HeaderOrderTask')
    })

    it('should avoid duplication when dir and file names are same', () => {
      const result = calculatePrefix('/path/to/features/users/Users.vue')
      expect(result).toBe('Users')
    })

    it('should handle PascalCase directory names', () => {
      const result = calculatePrefix(
        '/path/to/features/UserProfile/components/Avatar.vue'
      )
      expect(result).toBe('UserProfileAvatar')
    })
  })

  describe('hasSignificantOverlap', () => {
    it('should detect overlap when type contains file name', () => {
      expect(hasSignificantOverlap('AssignmentMessage', 'AssignmentMessages')).toBe(true)
    })

    it('should detect overlap when file name contains type', () => {
      expect(hasSignificantOverlap('User', 'UserList')).toBe(true)
    })

    it('should detect exact match after stripping suffix', () => {
      expect(hasSignificantOverlap('User', 'Users')).toBe(true)
    })

    it('should return false for unrelated names', () => {
      expect(hasSignificantOverlap('User', 'OrderCard')).toBe(false)
    })

    it('should handle complex type names', () => {
      expect(hasSignificantOverlap('OrderForClient', 'Orders')).toBe(true)
    })
  })

  describe('calculatePrefixWithTypeName', () => {
    it('should return empty prefix when type overlaps with file name in queries dir', () => {
      const result = calculatePrefixWithTypeName(
        '/path/to/src/queries/AssignmentMessages.gql',
        'AssignmentMessage'
      )
      expect(result).toBe('')
    })

    it('should return file name as prefix when no overlap', () => {
      const result = calculatePrefixWithTypeName(
        '/path/to/features/users/components/UserCard.vue',
        'Order'
      )
      expect(result).toBe('UsersUserCard')
    })

    it('should return dir only when type overlaps with file but dir is different', () => {
      const result = calculatePrefixWithTypeName(
        '/path/to/features/users/components/UserList.vue',
        'User'
      )
      // 'User' overlaps with 'UserList', so only dir is returned
      expect(result).toBe('Users')
    })

    it('should handle nested directory paths', () => {
      const result = calculatePrefixWithTypeName(
        '/path/to/engine/organisms/OrderDetail/Main/Header/OrderTask.fragment.ts',
        'Order'
      )
      // 'Order' overlaps with 'OrderTask', so only dir 'Header' is returned
      expect(result).toBe('Header')
    })
  })
})

