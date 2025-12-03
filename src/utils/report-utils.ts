import type { Rule } from 'eslint'
import type { GraphQLESTreeNode } from '@graphql-eslint/eslint-plugin'
import type { NameNode } from 'graphql'

export type GraphQLRuleContext = Rule.RuleContext

export interface ReportOptions {
  /** The ESLint rule context */
  context: GraphQLRuleContext
  /** The AST node to report on */
  node: GraphQLESTreeNode<NameNode, true>
  /** The expected name */
  expectedName: string
  /** The error message */
  message: string
}

/**
 * Report a naming violation with auto-fix and suggestion.
 *
 * @param options - The report options
 */
export function reportNamingViolation(options: ReportOptions): void {
  const { context, node, expectedName, message } = options

  context.report({
    node: node as unknown as Rule.Node,
    message: `${message} (expected: ${expectedName})`,
    fix: (fixer: Rule.RuleFixer) => {
      if (!node.range) return null
      return fixer.replaceTextRange(
        [node.range[0], node.range[1]],
        expectedName
      )
    },
    suggest: [
      {
        desc: `Rename to \`${expectedName}\``,
        fix: (fixer: Rule.RuleFixer) => {
          if (!node.range) return null
          return fixer.replaceTextRange(
            [node.range[0], node.range[1]],
            expectedName
          )
        },
      },
    ],
  })
}

/**
 * Create a standard error message for fragment naming.
 */
export function createFragmentMessage(expectedName: string): string {
  return `Fragment name must start with "${expectedName}"`
}

/**
 * Create a standard error message for query naming.
 */
export function createQueryMessage(expectedName: string): string {
  return `Query name must start with "${expectedName}"`
}

/**
 * Create a standard error message for mutation naming.
 */
export function createMutationMessage(expectedName: string): string {
  return `Mutation name must start with "${expectedName}"`
}

/**
 * Create a standard error message for subscription naming.
 */
export function createSubscriptionMessage(expectedName: string): string {
  return `Subscription name must start with "${expectedName}"`
}

