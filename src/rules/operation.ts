import { type GraphQLESLintRule } from '@graphql-eslint/eslint-plugin'
import { calculatePrefixWithTypeName, type PathOptions } from '../utils/path-utils.js'
import {
  generateExpectedName,
  isValidName,
  getOperationTypeName,
} from '../utils/naming-utils.js'
import {
  reportNamingViolation,
  createQueryMessage,
  createSubscriptionMessage,
} from '../utils/report-utils.js'

export interface OperationRuleOptions {
  /** Directories to skip when calculating prefix */
  skipDirs?: string[]
}

type RuleOptions = [OperationRuleOptions?]

/**
 * ESLint rule for enforcing GraphQL Query and Subscription naming conventions.
 *
 * Operation names must follow the pattern: {Prefix}{TypeName}
 * Where Prefix is derived from the file path (directory + filename in PascalCase)
 * and TypeName is the return type of the first field in the operation.
 *
 * @example
 * // File: features/users/components/UserCard.vue
 * // ✅ Valid
 * query UsersUserCardUser { user { id name } }
 *
 * // ❌ Invalid
 * query GetUser { user { id name } }
 */
const rule: GraphQLESLintRule<RuleOptions, true> = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Enforce naming convention for GraphQL Queries and Subscriptions based on file path.',
      category: ['Operations'],
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          skipDirs: {
            type: 'array',
            items: { type: 'string' },
            description: 'Directories to skip when calculating prefix',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    // Get schema from parser services
    const schema = context.parserServices?.schema
    if (!schema) {
      return {}
    }

    const options = context.options[0] ?? {}
    const pathOptions: PathOptions = {
      skipDirs: options.skipDirs,
    }

    return {
      OperationDefinition(node) {
        // Skip unnamed operations
        if (!node.name) {
          return
        }

        // Only handle query and subscription (mutation has its own rule)
        const operationType = node.operation
        if (operationType !== 'query' && operationType !== 'subscription') {
          return
        }

        // Get the first field name to determine the return type
        if (
          !node.selectionSet ||
          !node.selectionSet.selections ||
          node.selectionSet.selections.length === 0
        ) {
          return
        }

        const firstSelection = node.selectionSet.selections[0] as {
          name?: { value: string }
        }
        if (!firstSelection.name) {
          return
        }

        // Get the return type name from schema
        const typeName = getOperationTypeName(
          schema,
          operationType,
          firstSelection.name.value
        )

        // Skip if we can't determine the type
        if (!typeName) {
          return
        }

        // Calculate prefix considering type name overlap
        const prefix = calculatePrefixWithTypeName(
          context.physicalFilename,
          typeName,
          pathOptions
        )

        const operationName = node.name.value

        // Check if the operation name follows the convention
        if (!isValidName(operationName, prefix, typeName)) {
          const expectedName = generateExpectedName(prefix, typeName)
          const messageCreator =
            operationType === 'query'
              ? createQueryMessage
              : createSubscriptionMessage

          reportNamingViolation({
            context: context as unknown as Parameters<
              typeof reportNamingViolation
            >[0]['context'],
            node: node.name,
            expectedName,
            message: messageCreator(expectedName),
          })
        }
      },
    }
  },
}

export default rule

