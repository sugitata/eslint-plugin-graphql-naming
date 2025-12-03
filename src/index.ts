import fragment from './rules/fragment.js'
import operation from './rules/operation.js'
import mutation from './rules/mutation.js'

/**
 * ESLint plugin for enforcing GraphQL naming conventions based on file paths.
 *
 * This plugin provides three rules:
 * - `graphql-naming/fragment`: Enforces naming convention for GraphQL Fragments
 * - `graphql-naming/operation`: Enforces naming convention for GraphQL Queries and Subscriptions
 * - `graphql-naming/mutation`: Enforces naming convention for GraphQL Mutations
 *
 * Each rule ensures that the operation/fragment name follows the pattern:
 * {Prefix}{TypeName}
 *
 * Where:
 * - Prefix = PascalCase(directoryName) + PascalCase(fileName)
 * - TypeName = The GraphQL type being queried/fragmented on
 *
 * @example
 * // eslint.config.js
 * import graphqlNaming from 'eslint-plugin-graphql-naming'
 *
 * export default [
 *   {
 *     plugins: {
 *       'graphql-naming': graphqlNaming,
 *     },
 *     rules: {
 *       'graphql-naming/fragment': 'error',
 *       'graphql-naming/operation': 'error',
 *       'graphql-naming/mutation': 'error',
 *     },
 *   },
 * ]
 */
const plugin = {
  meta: {
    name: 'eslint-plugin-graphql-naming',
    version: '0.1.0',
  },
  rules: {
    fragment,
    operation,
    mutation,
  },
  configs: {
    /**
     * Recommended configuration that enables all rules with default options.
     */
    recommended: {
      plugins: ['graphql-naming'],
      rules: {
        'graphql-naming/fragment': 'error',
        'graphql-naming/operation': 'error',
        'graphql-naming/mutation': 'error',
      },
    },
  },
}

export = plugin

