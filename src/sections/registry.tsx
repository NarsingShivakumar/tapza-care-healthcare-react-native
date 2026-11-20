import React from 'react';
import type {Animated} from 'react-native';
import type {LayoutSection} from '../domain/models';
import {HeroSection} from './HeroSection';
import {CategorySection} from './CategorySection';
import {QuickActionsSection} from './QuickActionsSection';
import {ServiceGridSection} from './ServiceGridSection';
import {DoctorCarouselSection} from './DoctorCarouselSection';
import {OfferSection} from './OfferSection';

const sectionTypes = ['hero_banner', 'category_chips', 'quick_actions', 'service_grid', 'doctor_carousel', 'offer_strip'] as const;
export type SupportedSection = typeof sectionTypes[number];
export function isSupportedSection(type: string): type is SupportedSection {
  return (sectionTypes as readonly string[]).includes(type);
}
/** Unknown admin-supplied types intentionally render nothing, not a broken card. */
export function RenderSection({section, parallax}: {section: LayoutSection; parallax: Animated.AnimatedInterpolation<string | number>}) {
  switch (section.type) {
    case 'hero_banner': return <HeroSection section={section} parallax={parallax} />;
    case 'category_chips': return <CategorySection section={section} />;
    case 'quick_actions': return <QuickActionsSection section={section} />;
    case 'service_grid': return <ServiceGridSection section={section} />;
    case 'doctor_carousel': return <DoctorCarouselSection section={section} />;
    case 'offer_strip': return <OfferSection section={section} />;
    default: return null;
  }
}
