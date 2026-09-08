import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ShiddatLogo } from '@/components/brand/ShiddatLogo';
import { ShiddatWordmark } from '@/components/brand/ShiddatWordmark';
import { ShiddatWaveform } from '@/components/brand/ShiddatWaveform';

describe('Shiddat Complete Brand Identity & Design System', () => {
  it('should render Primary Full Logo with abstract SVG components and no text', () => {
    const html = renderToString(React.createElement(ShiddatLogo, { variant: 'full', size: 48, themeOverride: 'dark' }));
    expect(html).toContain('svg');
    expect(html).toContain('rxRedGlowGrad');
    expect(html).toContain('rxSymbolGlow');
    // Ensure no alphabetic characters inside the symbol
    expect(html).not.toContain('>R<');
    expect(html).not.toContain('>X<');
    expect(html).not.toContain('>RX<');
  });

  it('should render Micro Mark variant for favicons and 16-24px UI', () => {
    const html = renderToString(React.createElement(ShiddatLogo, { variant: 'micro', size: 24, themeOverride: 'light' }));
    expect(html).toContain('svg');
    expect(html).toContain('fill="#E50914"');
  });

  it('should render Monochrome Red, Black, and White variants', () => {
    const redHtml = renderToString(React.createElement(ShiddatLogo, { variant: 'monochrome-red' }));
    const blackHtml = renderToString(React.createElement(ShiddatLogo, { variant: 'monochrome-black' }));
    const whiteHtml = renderToString(React.createElement(ShiddatLogo, { variant: 'monochrome-white' }));

    expect(redHtml).toContain('#E50914');
    expect(blackHtml).toContain('#0F172A');
    expect(whiteHtml).toContain('#FFFFFF');
  });

  it('should render ShiddatWordmark with separate geometric typography and brand red X', () => {
    const html = renderToString(React.createElement(ShiddatWordmark, { size: 'xl', showTagline: true, tagline: 'Music That Moves With You' }));
    expect(html.toLowerCase()).toContain('shiddat');
    expect(html.toLowerCase()).toContain('x');
    expect(html).toContain('Music That Moves With You');
    expect(html).toContain('text-[#E50914]');
  });

  it('should render ShiddatWaveform for all 7 player states', () => {
    const states = ['idle', 'loading', 'buffering', 'playing', 'paused', 'error', 'offline'] as const;
    
    for (const state of states) {
      const html = renderToString(React.createElement(ShiddatWaveform, { state, barCount: 7, height: 20 }));
      expect(html).toContain(`aria-label="Waveform state: ${state}"`);
    }
  });
});
