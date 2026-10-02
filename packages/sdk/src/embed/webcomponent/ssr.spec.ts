// @vitest-environment node
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

describe('@clubmed/caps/webcomponent on the server', () => {
  it('can be imported and rendered without DOM, rendering the fallback only', async () => {
    expect(typeof window).toBe('undefined');

    const { CapsFormWebComponent } = await import('./index');

    const html = renderToString(
      createElement(CapsFormWebComponent, {
        issuerType: 'GM',
        type: 'booking',
        id: '123',
        callbackUrl: 'https://host.example/cb',
        fallback: createElement('span', null, 'loading'),
      }),
    );

    expect(html).toBe('<span>loading</span>');
  });
});
