import { type GraphQLESLintRule } from '@graphql-eslint/eslint-plugin'
import { calculatePrefixWithTypeName, type PathOptions } from '../utils/path-utils.js'
import { generateExpectedName, isValidName } from '../utils/naming-utils.js'
import {
  reportNamingViolation,
  createFragmentMessage,
} from '../utils/report-utils.js'

export interface FragmentRuleOptions {
  /** Directories to skip when calculating prefix */
  skipDirs?: string[]
}

type RuleOptions = [FragmentRuleOptions?]

/**
 * ESLint rule for enforcing GraphQL Fragment naming conventions.
 *
 * Fragment names must follow the pattern: {Prefix}{TypeName}
 * Where Prefix is derived from the file path (directory + filename in PascalCase)
 * and TypeName is the GraphQL type being fragmented on.
 *
 * @example
 * // File: features/users/components/UserCard.vue
 * // ✅ Valid
 * fragment UsersUserCardUser on User { id name }
 *
 * // ❌ Invalid
 * fragment UserCard on User { id name }
 */
const rule: GraphQLESLintRule<RuleOptions, true> = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Enforce naming convention for GraphQL Fragments based on file path.',
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
    const options = context.options[0] ?? {}
    const pathOptions: PathOptions = {
      skipDirs: options.skipDirs,
    }

    return {
      FragmentDefinition(node) {
        // Skip fragments without name or type condition
        if (!node.name || !node.typeCondition) {
          return
        }

        const fragmentName = node.name.value
        const typeName = node.typeCondition.name.value

        // Calculate prefix considering type name overlap
        const prefix = calculatePrefixWithTypeName(
          context.physicalFilename,
          typeName,
          pathOptions
        )

        // Check if the fragment name follows the convention
        if (!isValidName(fragmentName, prefix, typeName)) {
          const expectedName = generateExpectedName(prefix, typeName)

          reportNamingViolation({
            context: context as unknown as Parameters<
              typeof reportNamingViolation
            >[0]['context'],
            node: node.name,
            expectedName,
            message: createFragmentMessage(expectedName),
          })
        }
      },
    }
  },
}

export default rule

