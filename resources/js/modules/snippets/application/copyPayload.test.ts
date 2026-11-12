import { describe, expect, it, vi } from 'vitest';

import { copyPayload } from './copyPayload';

const snippets = {
  build: vi.fn((format: string, icon: string) => `${format}:${icon}`),
  svgFromParts: vi.fn((icon: string, parts: { body: string }) => `<svg data-icon="${icon}">${parts.body}</svg>`),
};

describe('copyPayload', () => {
  it('builds the svg format from the real parts, sync or async', async () => {
    expect(await copyPayload('home', 'svg', {}, { snippets, svgParts: () => ({ body: '<path/>' }) })).toBe('<svg data-icon="home"><path/></svg>');
    expect(await copyPayload('home', 'svg', {}, { snippets, svgParts: async () => ({ body: '<g/>' }) })).toBe('<svg data-icon="home"><g/></svg>');
  });

  it('builds every other format as a snippet, without fetching parts', async () => {
    const svgParts = vi.fn(() => ({ body: '' }));
    expect(await copyPayload('home', 'blade', { size: 24 }, { snippets, svgParts })).toBe('blade:home');
    expect(svgParts).not.toHaveBeenCalled();
    expect(snippets.build).toHaveBeenLastCalledWith('blade', 'home', { size: 24 });
  });
});
