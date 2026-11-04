export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Dependabot's commit bodies have a long first line that scales with the group and directory
    // names, so allow more than the default 100 characters.
    'body-max-line-length': [2, 'always', 120],
  },
};
