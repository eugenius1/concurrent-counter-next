import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from "eslint-config-next/typescript";


const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores([
        'coverage/**',
        // Other checkouts of this repository, each with its own build output
        '.claude/worktrees/**',
    ]),
])

export default eslintConfig