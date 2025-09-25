export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [0, 'always', 200],
    'footer-max-length': [0, 'always', 200],
  },
};
