module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correção de bug
        'docs',     // Mudanças na documentação
        'style',    // Formatação, sem mudança de código
        'refactor', // Refatoração de código
        'perf',     // Melhorias de performance
        'test',     // Adição ou correção de testes
        'build',    // Mudanças no sistema de build
        'ci',       // Mudanças em CI/CD
        'chore',    // Outras mudanças (atualização de deps, etc)
        'revert',   // Reversão de commit anterior
      ],
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
  },
};
