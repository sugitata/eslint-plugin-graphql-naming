import { describe, it, expect, vi } from 'vitest'
import rule from '../../src/rules/operation.js'

// Mock GraphQL schema
const createMockSchema = () => ({
  getQueryType: () => ({
    getFields: () => ({
      user: {
        type: { name: 'User' },
      },
      users: {
        type: {
          ofType: { name: 'User' },
        },
      },
      post: {
        type: { name: 'Post' },
      },
    }),
  }),
  getSubscriptionType: () => ({
    getFields: () => ({
      userUpdated: {
        type: { name: 'User' },
      },
    }),
  }),
  getMutationType: () => null,
})

describe('graphql-naming/operation', () => {
  describe('meta', () => {
    it('should have correct meta properties', () => {
      expect(rule.meta.type).toBe('suggestion')
      expect(rule.meta.fixable).toBe('code')
      expect(rule.meta.hasSuggestions).toBe(true)
    })
  })

  describe('create', () => {
    const createMockContext = (
      physicalFilename: string,
      options: any[] = []
    ) => ({
      physicalFilename,
      options,
      report: vi.fn(),
      parserServices: {
        schema: createMockSchema(),
        siblingOperations: {},
      },
    })

    it('should report error for invalid query name', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserCard.vue'
      )

      const listener = rule.create(context as any)

      const mockNode = {
        name: {
          value: 'GetUser',
          range: [6, 13],
        },
        operation: 'query',
        selectionSet: {
          selections: [
            {
              name: { value: 'user' },
            },
          ],
        },
      }

      listener.OperationDefinition!(mockNode as any)

      // With the overlap detection, 'UserCard' overlaps with 'User', so prefix is 'Users' only
      expect(context.report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('UsersUser'),
        })
      )
    })

    it('should not report for valid query name', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserCard.vue'
      )

      const listener = rule.create(context as any)

      const mockNode = {
        name: {
          value: 'UsersUserCardUser',
          range: [6, 23],
        },
        operation: 'query',
        selectionSet: {
          selections: [
            {
              name: { value: 'user' },
            },
          ],
        },
      }

      listener.OperationDefinition!(mockNode as any)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should accept valid query name with suffix', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserCard.vue'
      )

      const listener = rule.create(context as any)

      const mockNode = {
        name: {
          value: 'UsersUserCardUserList',
          range: [6, 27],
        },
        operation: 'query',
        selectionSet: {
          selections: [
            {
              name: { value: 'users' },
            },
          ],
        },
      }

      listener.OperationDefinition!(mockNode as any)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should handle subscription operations', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserCard.vue'
      )

      const listener = rule.create(context as any)

      // Invalid subscription
      const mockNode = {
        name: {
          value: 'OnUserUpdated',
          range: [13, 26],
        },
        operation: 'subscription',
        selectionSet: {
          selections: [
            {
              name: { value: 'userUpdated' },
            },
          ],
        },
      }

      listener.OperationDefinition!(mockNode as any)

      // With the overlap detection, 'UserCard' overlaps with 'User', so prefix is 'Users' only
      expect(context.report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('UsersUser'),
        })
      )
    })

    it('should skip mutation operations (handled by mutation rule)', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserCard.vue'
      )

      const listener = rule.create(context as any)

      const mockNode = {
        name: {
          value: 'CreateUser',
          range: [9, 19],
        },
        operation: 'mutation',
        selectionSet: {
          selections: [
            {
              name: { value: 'createUser' },
            },
          ],
        },
      }

      listener.OperationDefinition!(mockNode as any)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should skip unnamed operations', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserCard.vue'
      )

      const listener = rule.create(context as any)

      const mockNode = {
        name: null,
        operation: 'query',
        selectionSet: {
          selections: [
            {
              name: { value: 'user' },
            },
          ],
        },
      }

      listener.OperationDefinition!(mockNode as any)

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should return empty listener when schema is not available', () => {
      const context = {
        physicalFilename: '/path/to/features/users/components/UserCard.vue',
        options: [],
        report: vi.fn(),
        parserServices: {
          schema: null,
          siblingOperations: {},
        },
      }

      const listener = rule.create(context as any)

      expect(listener).toEqual({})
    })
  })
})
