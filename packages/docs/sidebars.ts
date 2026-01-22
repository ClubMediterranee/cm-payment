import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'index',
    {
      type: 'html',
      value: '<div class="sidebar-section-title">Démarrage</div>',
      defaultStyle: false,
    },
    'getting-started/quick-start',
    {
      type: 'html',
      value: '<div class="sidebar-section-title">Mode Redirection</div>',
      defaultStyle: false,
    },
    'integration/redirect/configuration',
    'integration/redirect/callback',
    'integration/redirect/examples',
    {
      type: 'html',
      value: '<div class="sidebar-section-title">Mode Intégré</div>',
      defaultStyle: false,
    },
    'integration/integrated/installation',
    'integration/integrated/form-setup',
    'integration/integrated/examples',
  ],
};

export default sidebars;
