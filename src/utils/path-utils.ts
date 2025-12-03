import * as path from 'path'

/**
 * Directories that should be skipped when calculating the prefix.
 * When the immediate parent directory matches one of these, we look one level up.
 */
const DEFAULT_SKIP_DIRS = ['components', '[id]', 'queries', 'mutations', 'fragments', 'subscriptions', 'graphql', 'gql', 'src']

export interface PathInfo {
  /** Directory name used for prefix calculation */
  dirName: string
  /** File name (without extension) used for prefix calculation */
  fileName: string
}

export interface PathOptions {
  /** Directories to skip when calculating prefix */
  skipDirs?: string[]
}

/**
 * Extract directory name and file name from a physical file path.
 *
 * @param physicalFilename - The full path to the file
 * @param options - Configuration options
 * @returns Object containing dirName and fileName for prefix calculation
 *
 * @example
 * // /path/to/features/users/components/UserCard.vue
 * // -> { dirName: 'users', fileName: 'UserCard' }
 *
 * // /path/to/engine/components/organisms/OrderDetail/Main/Header/OrderTask.client.fragment.ts
 * // -> { dirName: 'Header', fileName: 'OrderTask' }
 */
export function extractPathInfo(
  physicalFilename: string,
  options: PathOptions = {}
): PathInfo {
  const skipDirs = options.skipDirs ?? DEFAULT_SKIP_DIRS

  const parsed = path.parse(physicalFilename)
  const dirs = parsed.dir.split(path.sep)

  let dirName = dirs[dirs.length - 1]

  // If the immediate parent is a skipped directory, look one level up
  if (skipDirs.includes(dirName) && dirs.length > 1) {
    dirName = dirs[dirs.length - 2]
  }

  // Remove brackets from dynamic route segments like [id]
  dirName = dirName.replace(/[\[\]]/g, '')

  // Extract file name up to the first dot (handles .vue, .client.fragment.ts, etc.)
  // Also remove brackets from file names
  const fileName = parsed.name.split('.')[0].replace(/[\[\]]/g, '')

  return { dirName, fileName }
}

/**
 * Convert a string to PascalCase.
 *
 * @param str - The input string
 * @returns The string converted to PascalCase
 *
 * @example
 * toPascalCase('user-card') // -> 'UserCard'
 * toPascalCase('user_list') // -> 'UserList'
 * toPascalCase('[id]') // -> 'Id'
 */
export function toPascalCase(str: string): string {
  return str
    // Remove brackets
    .replace(/[\[\]]/g, '')
    // Replace hyphens and underscores with spaces
    .replace(/[-_]/g, ' ')
    // Capitalize first letter of each word
    .replace(/(?:^|\s)(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
    // Remove spaces
    .replace(/\s+/g, '')
    // Ensure first character is uppercase
    .replace(/^./, (c) => c.toUpperCase())
}

/**
 * Calculate the naming prefix from a file path.
 *
 * @param physicalFilename - The full path to the file
 * @param options - Configuration options
 * @returns The calculated prefix in PascalCase
 *
 * @example
 * // /path/to/features/users/components/UserCard.vue
 * // -> 'UsersUserCard'
 *
 * // /path/to/users/UserList.vue (dirName === fileName)
 * // -> 'Users' (no duplication)
 */
export function calculatePrefix(
  physicalFilename: string,
  options: PathOptions = {}
): string {
  const { dirName, fileName } = extractPathInfo(physicalFilename, options)

  const pascalDir = toPascalCase(dirName)
  const pascalFile = toPascalCase(fileName)

  // If directory and file names are the same, use only one to avoid duplication
  if (pascalDir === pascalFile) {
    return pascalDir
  }

  return pascalDir + pascalFile
}

/**
 * Check if typeName contains fileName (case-insensitive, ignoring pluralization).
 * Used to determine if fileName should be omitted from the prefix.
 *
 * @param typeName - The GraphQL type name (e.g., 'AssignmentMessage')
 * @param fileName - The file name (e.g., 'AssignmentMessages')
 * @returns Whether there is significant overlap
 */
export function hasSignificantOverlap(typeName: string, fileName: string): boolean {
  const normalizedType = typeName.toLowerCase()
  const normalizedFile = fileName.toLowerCase()

  // Remove common suffixes for comparison
  const stripSuffix = (str: string) =>
    str.replace(/(s|es|ies)$/, '').replace(/list$/, '').replace(/data$/, '')

  const strippedType = stripSuffix(normalizedType)
  const strippedFile = stripSuffix(normalizedFile)

  // Check if one contains the other
  return (
    strippedType.includes(strippedFile) ||
    strippedFile.includes(strippedType) ||
    strippedType === strippedFile
  )
}

/**
 * Calculate the naming prefix, considering overlap with type name.
 * If the type name significantly overlaps with the file name, the file name is omitted.
 *
 * @param physicalFilename - The full path to the file
 * @param typeName - The GraphQL type name
 * @param options - Configuration options
 * @returns The calculated prefix in PascalCase
 *
 * @example
 * // File: AssignmentMessages.gql, Type: AssignmentMessage
 * // -> '' (empty prefix, type name covers it)
 *
 * // File: UserCard.vue, Type: User
 * // -> 'UserCard' (no significant overlap)
 */
export function calculatePrefixWithTypeName(
  physicalFilename: string,
  typeName: string,
  options: PathOptions = {}
): string {
  const { dirName, fileName } = extractPathInfo(physicalFilename, options)

  const pascalDir = toPascalCase(dirName)
  const pascalFile = toPascalCase(fileName)

  // If directory is in skipDirs (already handled by extractPathInfo, dirName would be parent)
  // But if dirName is still a skipped pattern, return just the file part or empty

  // Check if type name overlaps with file name
  if (hasSignificantOverlap(typeName, fileName)) {
    // If dir and file are the same, and type overlaps, return empty
    if (pascalDir === pascalFile) {
      return ''
    }
    // Otherwise, return just the dir part (if it's meaningful)
    // But if dir is also empty or same as skipped, return empty
    if (pascalDir && !DEFAULT_SKIP_DIRS.includes(dirName.toLowerCase())) {
      return pascalDir
    }
    return ''
  }

  // If directory and file names are the same, use only one
  if (pascalDir === pascalFile) {
    return pascalDir
  }

  // Check if dir is meaningful
  if (!pascalDir || DEFAULT_SKIP_DIRS.includes(dirName.toLowerCase())) {
    return pascalFile
  }

  return pascalDir + pascalFile
}

