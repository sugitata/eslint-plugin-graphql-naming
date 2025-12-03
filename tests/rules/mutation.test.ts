import { describe, it, expect, vi } from 'vitest'
import rule from '../../src/rules/mutation.js'

// Mock GraphQL schema
const createMockSchema = () => ({
  getQueryType: () => null,
  getSubscriptionType: () => null,
  getMutationType: () => ({
    getFields: () => ({
      createUser: {
        type: { name: 'User' },
      },
      updateUser: {
        type: { name: 'User' },
      },
      deletePost: {
        type: { name: 'Post' },
      },
    }),
  }),
})

describe('graphql-naming/mutation', () => {
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

    it('should report error for invalid mutation name', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserForm.vue'
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

      // With the overlap detection, 'UserForm' overlaps with 'User', so prefix is 'Users' only
      expect(context.report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('UsersUser'),
        })
      )
    })

    it('should not report for valid mutation name', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserForm.vue'
      )

      const listener = rule.create(context as any)

      const mockNode = {
        name: {
          value: 'UsersUserFormUser',
          range: [9, 26],
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

    it('should accept valid mutation name with suffix', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserForm.vue'
      )

      const listener = rule.create(context as any)

      const mockNode = {
        name: {
          value: 'UsersUserFormUserCreate',
          range: [9, 32],
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

    it('should skip query operations (handled by operation rule)', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserForm.vue'
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

      expect(context.report).not.toHaveBeenCalled()
    })

    it('should skip unnamed mutations', () => {
      const context = createMockContext(
        '/path/to/features/users/components/UserForm.vue'
      )

      const listener = rule.create(context as any)

      const mockNode = {
        name: null,
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

    it('should return empty listener when schema is not available', () => {
      const context = {
        physicalFilename: '/path/to/features/users/components/UserForm.vue',
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

    it('should handle nested directory paths', () => {
      const context = createMockContext(
        '/path/to/engine/organisms/OrderDetail/Main/Header/OrderForm.vue'
      )

      const listener = rule.create(context as any)

      // Invalid name
      const mockNode = {
        name: {
          value: 'UpdateOrder',
          range: [9, 20],
        },
        operation: 'mutation',
        selectionSet: {
          selections: [
            {
              name: { value: 'createUser' }, // Return type is User
            },
          ],
        },
      }

      listener.OperationDefinition!(mockNode as any)

      expect(context.report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('HeaderOrderFormUser'),
        })
      )
    })
  })
})
