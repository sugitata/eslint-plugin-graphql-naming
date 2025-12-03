import type { GraphQLSchema, GraphQLObjectType, GraphQLType } from 'graphql'

/**
 * Unwrap GraphQL wrapper types (NonNull, List) to get the underlying named type.
 *
 * @param type - The GraphQL type to unwrap
 * @returns The underlying named type
 */
export function unwrapType(type: GraphQLType): GraphQLType {
  // GraphQL types can be wrapped in NonNull or List types
  // We need to recursively unwrap to get the actual type name
  let current = type as { ofType?: GraphQLType; name?: string }

  while (current.ofType) {
    current = current.ofType as { ofType?: GraphQLType; name?: string }
  }

  return current as GraphQLType
}

/**
 * Get the return type name from a GraphQL operation's first selection.
 *
 * @param schema - The GraphQL schema
 * @param operationType - The operation type ('query', 'mutation', 'subscription')
 * @param firstFieldName - The name of the first field in the selection set
 * @returns The type name or null if not found
 */
export function getOperationTypeName(
  schema: GraphQLSchema,
  operationType: 'query' | 'mutation' | 'subscription',
  firstFieldName: string
): string | null {
  let rootType: GraphQLObjectType | undefined | null

  switch (operationType) {
    case 'query':
      rootType = schema.getQueryType()
      break
    case 'mutation':
      rootType = schema.getMutationType()
      break
    case 'subscription':
      rootType = schema.getSubscriptionType()
      break
  }

  if (!rootType) {
    return null
  }

  const fields = rootType.getFields()
  const field = fields[firstFieldName]

  if (!field || !field.type) {
    return null
  }

  const unwrapped = unwrapType(field.type) as { name?: string }

  return unwrapped.name ?? null
}

/**
 * Capitalize the first letter of a type name.
 *
 * @param typeName - The type name
 * @returns The type name with first letter capitalized
 */
export function capitalizeTypeName(typeName: string): string {
  if (!typeName) return ''
  return typeName.charAt(0).toUpperCase() + typeName.slice(1)
}

/**
 * Check if an operation name follows the expected naming convention.
 *
 * @param actualName - The actual operation name
 * @param expectedPrefix - The expected prefix (e.g., 'UsersUserCard')
 * @param typeName - The GraphQL type name (e.g., 'User')
 * @returns Whether the name follows the convention
 */
export function isValidName(
  actualName: string,
  expectedPrefix: string,
  typeName: string
): boolean {
  const expectedName = expectedPrefix + capitalizeTypeName(typeName)
  return actualName.startsWith(expectedName)
}

/**
 * Generate the expected operation/fragment name.
 *
 * @param prefix - The prefix calculated from file path
 * @param typeName - The GraphQL type name
 * @returns The expected name
 */
export function generateExpectedName(prefix: string, typeName: string): string {
  return prefix + capitalizeTypeName(typeName)
}

