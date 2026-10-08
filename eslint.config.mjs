import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from "eslint-config-next/typescript";


const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        'coverage/**',
        // Other checkouts of this repository, each with its own build output
        '.claude/worktrees/**',
    ]),
])

export default eslintConfig