// import SvgUseActions from '@clubmed/trident-icons/svg-use/Actions';
// import SvgUseActivities from '@clubmed/trident-icons/svg-use/Activities';
// import SvgUseBrand from '@clubmed/trident-icons/svg-use/Brand';
// import SvgUseCovid from '@clubmed/trident-icons/svg-use/Covid';
// import SvgUseFood from '@clubmed/trident-icons/svg-use/Food';
// import SvgUseHappyToCare from '@clubmed/trident-icons/svg-use/HappyToCare';
// import SvgUsePlaces from '@clubmed/trident-icons/svg-use/Places';
// import SvgUseResortFill from '@clubmed/trident-icons/svg-use/ResortFill';
// import SvgUseResortFillEC from '@clubmed/trident-icons/svg-use/ResortFill-EC';
// import SvgUseResortOutline from '@clubmed/trident-icons/svg-use/ResortOutline';
// import SvgUseResortOutlineEC from '@clubmed/trident-icons/svg-use/ResortOutline-EC';
// import SvgUseRoom from '@clubmed/trident-icons/svg-use/Room';
// import SvgUseServices from '@clubmed/trident-icons/svg-use/Services';
// import SvgUseSocials from '@clubmed/trident-icons/svg-use/Socials';
// import SvgUseTransports from '@clubmed/trident-icons/svg-use/Transports';
// import SvgUseUtilities from '@clubmed/trident-icons/svg-use/Utilities';
import { IconsProvider } from '@clubmed/trident-icons/contexts/IconsContext';
import SvgActions from '@clubmed/trident-icons/svg/Actions';
import SvgActivities from '@clubmed/trident-icons/svg/Activities';
import SvgBrand from '@clubmed/trident-icons/svg/Brand';
import SvgCovid from '@clubmed/trident-icons/svg/Covid';
import SvgFood from '@clubmed/trident-icons/svg/Food';
import SvgHappyToCare from '@clubmed/trident-icons/svg/HappyToCare';
import SvgPlaces from '@clubmed/trident-icons/svg/Places';
import SvgResortFill from '@clubmed/trident-icons/svg/ResortFill';
import SvgResortFillEC from '@clubmed/trident-icons/svg/ResortFill-EC';
import SvgResortOutline from '@clubmed/trident-icons/svg/ResortOutline';
import SvgResortOutlineEC from '@clubmed/trident-icons/svg/ResortOutline-EC';
import SvgRoom from '@clubmed/trident-icons/svg/Room';
import SvgServices from '@clubmed/trident-icons/svg/Services';
import SvgSocials from '@clubmed/trident-icons/svg/Socials';
import SvgTransports from '@clubmed/trident-icons/svg/Transports';
import SvgUtilities from '@clubmed/trident-icons/svg/Utilities';
import type { FunctionComponent } from 'react';

export const iconsDecorator = (Story: FunctionComponent) => {
  return (
    <IconsProvider
      icons={[
        SvgActions,
        SvgActivities,
        SvgBrand,
        SvgCovid,
        SvgFood,
        SvgHappyToCare,
        SvgPlaces,
        SvgResortFill,
        SvgResortFillEC,
        SvgResortOutline,
        SvgResortOutlineEC,
        SvgRoom,
        SvgServices,
        SvgSocials,
        SvgTransports,
        SvgUtilities,
        // SvgUseActions,
        // SvgUseActivities,
        // SvgUseBrand,
        // SvgUseCovid,
        // SvgUseFood,
        // SvgUseHappyToCare,
        // SvgUsePlaces,
        // SvgUseResortFill,
        // SvgUseResortFillEC,
        // SvgUseResortOutline,
        // SvgUseResortOutlineEC,
        // SvgUseRoom,
        // SvgUseServices,
        // SvgUseSocials,
        // SvgUseTransports,
        // SvgUseUtilities,
      ]}
    >
      <Story />
    </IconsProvider>
  );
};
