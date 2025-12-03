# eslint-plugin-graphql-naming

ESLint plugin for enforcing GraphQL naming conventions based on file paths. Works with [@graphql-eslint/eslint-plugin](https://the-guild.dev/graphql/eslint).

## Features

- 🔧 **Auto-fixable**: All rules support automatic fixing
- 📁 **File path based**: Generates expected names from the file path
- 🎯 **Flexible**: Supports customization via options
- 📦 **Separate rules**: Individual rules for fragments, queries, and mutations

## Installation

```bash
npm install eslint-plugin-graphql-naming --save-dev
```

Make sure you have the peer dependencies installed:

```bash
npm install @graphql-eslint/eslint-plugin graphql eslint --save-dev
```

## Usage

### ESLint Flat Config (eslint.config.js) - ESLint v9+

```javascript
import graphqlNaming from 'eslint-plugin-graphql-naming'
import * as graphqlPlugin from '@graphql-eslint/eslint-plugin'

export default [
  {
    files: ['**/*.graphql', '**/*.gql'],
    languageOptions: {
      parser: graphqlPlugin,
      parserOptions: {
        schema: './schema.graphql',
      },
    },
    plugins: {
      '@graphql-eslint': graphqlPlugin,
      'graphql-naming': graphqlNaming,
    },
    rules: {
      'graphql-naming/fragment': 'error',
      'graphql-naming/operation': 'error',
      'graphql-naming/mutation': 'error',
    },
  },
]
```

### Legacy Config (.eslintrc.js) - ESLint v8 and below

```javascript
module.exports = {
  overrides: [
    {
      files: ['**/*.graphql', '**/*.gql'],
      parser: '@graphql-eslint/eslint-plugin',
      parserOptions: {
        schema: './schema.graphql',
      },
      plugins: ['@graphql-eslint', 'graphql-naming'],
      rules: {
        'graphql-naming/fragment': 'error',
        'graphql-naming/operation': 'error',
        'graphql-naming/mutation': 'error',
      },
    },
  ],
}
```

## Rules

### `graphql-naming/fragment`

Enforces naming convention for GraphQL Fragments.

Fragment names must follow the pattern: `{Prefix}{TypeName}`

#### Examples

```graphql
# File: features/users/components/UserCard.vue

# ✅ Valid
fragment UsersUserCardUser on User {
  id
  name
}

# ✅ Valid (with suffix)
fragment UsersUserCardUserWithDetails on User {
  id
  name
  email
}

# ❌ Invalid
fragment UserCard on User {
  id
  name
}
```

### `graphql-naming/operation`

Enforces naming convention for GraphQL Queries and Subscriptions.

Operation names must follow the pattern: `{Prefix}{TypeName}`

#### Examples

```graphql
# File: features/users/components/UserCard.vue

# ✅ Valid
query UsersUserCardUser {
  user {
    id
    name
  }
}

# ✅ Valid subscription
subscription UsersUserCardUser {
  userUpdated {
    id
    name
  }
}

# ❌ Invalid
query GetUser {
  user {
    id
    name
  }
}
```

### `graphql-naming/mutation`

Enforces naming convention for GraphQL Mutations.

Mutation names must follow the pattern: `{Prefix}{TypeName}`

#### Examples

```graphql
# File: features/users/components/UserForm.vue

# ✅ Valid
mutation UsersUserFormUser {
  createUser(name: "John") {
    id
    name
  }
}

# ❌ Invalid
mutation CreateUser {
  createUser(name: "John") {
    id
    name
  }
}
```

## Naming Convention

The expected name is calculated as: `{Prefix}{TypeName}`

### Prefix Calculation

The prefix is derived from the file path:

1. **Directory name**: The parent directory name (skipping `components` and `[id]` by default)
2. **File name**: The file name without extension (up to the first `.`)

Both are converted to PascalCase and concatenated.

#### Examples

| File Path | Prefix |
|-----------|--------|
| `features/users/components/UserCard.vue` | `UsersUserCard` |
| `engine/organisms/OrderDetail/Main/Header/OrderTask.client.fragment.ts` | `HeaderOrderTask` |
| `features/users/Users.vue` | `Users` (no duplication) |
| `pages/[id]/EditForm.vue` | `IdEditForm` |

### TypeName

- For **fragments**: The type being fragmented on (e.g., `User`, `OrderForClient`)
- For **operations**: The return type of the first field in the selection set

## Options

All rules accept the following options:

### `skipDirs`

An array of directory names to skip when calculating the prefix. When the immediate parent directory matches one of these, the rule looks one level up.

**Default:** `['components', '[id]']`

```javascript
{
  rules: {
    'graphql-naming/fragment': ['error', { skipDirs: ['components', 'pages', '[id]'] }],
  },
}
```

## Integration with Vue/React

This plugin works well with Vue SFC and React components that define GraphQL operations inline:

### Vue Example

```vue
<script setup lang="ts">
import { graphql } from '@/graphql'

// File: features/users/components/UserCard.vue
// Valid name: UsersUserCardUser
const userFragment = graphql(`
  fragment UsersUserCardUser on User {
    id
    name
    avatar
  }
`)
</script>
```

### React Example

```tsx
// File: features/users/components/UserCard.tsx
// Valid name: UsersUserCardUser
const USER_QUERY = gql`
  query UsersUserCardUser {
    user {
      id
      name
    }
  }
`
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

