import { describe, it, expect, vi } from 'vitest'
import rule from '../../src/rules/fragment.js'

describe('graphql-naming/fragment', () => {
  describe('meta', () => {
    it('should have correct meta properties', () => {
      expect(rule.meta.type).toBe('suggestion')
      expect(rule.meta.fixable).toBe('code')
      expect(rule.meta.hasSuggestions).toBe(true)
    })
  })

  describe('create', () => {
    const createMockContext = (physicalFilename: string, options: any[] = []) => ({
      physicalFilename,
      options,
      report: vi.fn(),
      parserServices: {
        schema: {},
        siblingOperations: {},
      },
    })

    it('should report error for invalid fragment name', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserCard.vue'
      )
      
      const listener = rule.create(context as any)
      
      const mockNode = {
        name: {
          value: 'UserCard',
          range: [9, 17],
        },
        typeCondition: {
          name: {
            value: 'User',
          },
        },
      }
      
      listener.FragmentDefinition!(mockNode as any)
      
      // With the overlap detection, 'UserCard' overlaps with 'User', so prefix is 'Users' only
      expect(context.report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('UsersUser'),
        })
      )
    })

    it('should not report for valid fragment name', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserCard.vue'
      )
      
      const listener = rule.create(context as any)
      
      const mockNode = {
        name: {
          value: 'UsersUserCardUser',
          range: [9, 26],
        },
        typeCondition: {
          name: {
            value: 'User',
          },
        },
      }
      
      listener.FragmentDefinition!(mockNode as any)
      
      expect(context.report).not.toHaveBeenCalled()
    })

    it('should accept valid fragment name with suffix', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserCard.vue'
      )
      
      const listener = rule.create(context as any)
      
      const mockNode = {
        name: {
          value: 'UsersUserCardUserWithDetails',
          range: [9, 37],
        },
        typeCondition: {
          name: {
            value: 'User',
          },
        },
      }
      
      listener.FragmentDefinition!(mockNode as any)
      
      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle nested directory paths', () => {
      const context = createMockContext(
        '/path/to/engine/organisms/OrderDetail/Main/Header/OrderTask.client.fragment.ts'
      )
      
      const listener = rule.create(context as any)
      
      // Invalid name
      const mockNode = {
        name: {
          value: 'TaskOrderFields',
          range: [9, 24],
        },
        typeCondition: {
          name: {
            value: 'OrderForClient',
          },
        },
      }
      
      listener.FragmentDefinition!(mockNode as any)
      
      expect(context.report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('HeaderOrderTaskOrderForClient'),
        })
      )
    })

    it('should skip fragments without name', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserCard.vue'
      )
      
      const listener = rule.create(context as any)
      
      const mockNode = {
        name: null,
        typeCondition: {
          name: {
            value: 'User',
          },
        },
      }
      
      listener.FragmentDefinition!(mockNode as any)
      
      expect(context.report).not.toHaveBeenCalled()
    })

    it('should respect custom skipDirs option', () => {
      const context = createMockContext(
        '/path/to/features/users/pages/UserPage.vue',
        [{ skipDirs: ['pages'] }]
      )
      
      const listener = rule.create(context as any)
      
      // Valid with custom skipDirs
      const mockNode = {
        name: {
          value: 'UsersUserPageUser',
          range: [9, 26],
        },
        typeCondition: {
          name: {
            value: 'User',
          },
        },
      }
      
      listener.FragmentDefinition!(mockNode as any)
      
      expect(context.report).not.toHaveBeenCalled()
    })
  })
})
