// Render the registry in isolation: child UI details have their own responsibilities.
jest.mock('../sections/HeroSection', () => ({HeroSection: () => null}));
jest.mock('../sections/CategorySection', () => ({CategorySection: () => null}));
jest.mock('../sections/QuickActionsSection', () => ({QuickActionsSection: () => null}));
jest.mock('../sections/ServiceGridSection', () => ({ServiceGridSection: () => null}));
jest.mock('../sections/DoctorCarouselSection', () => ({DoctorCarouselSection: () => null}));
jest.mock('../sections/OfferSection', () => ({OfferSection: () => null}));
import {isSupportedSection, RenderSection} from '../sections/registry';
import type {LayoutSection} from '../domain/models';
const unknown: LayoutSection = {id: 'cms-unsupported', type: 'unknown_cms_card', background: {kind: 'color', value: '#FFFFFF'}, items: []};
describe('config-driven renderer', () => {
  it('knows the six required section types', () => {
    expect(['hero_banner', 'category_chips', 'quick_actions', 'service_grid', 'doctor_carousel', 'offer_strip'].every(isSupportedSection)).toBe(true);
  });
  it('returns null for an unknown section without throwing', () => {
    expect(isSupportedSection(unknown.type)).toBe(false);
    expect(RenderSection({section: unknown, parallax: {} as never})).toBeNull();
  });
  it('returns a component for a known section', () => {
    const offer: LayoutSection = {...unknown, type: 'offer_strip'};
    expect(RenderSection({section: offer, parallax: {} as never})).not.toBeNull();
  });
});
