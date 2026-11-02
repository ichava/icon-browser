import type { SliderProps as AriaSliderProps } from "react-aria-components";
declare const styles: {
    default: string;
    bottom: string;
    "top-floating": string;
};
interface SliderProps extends AriaSliderProps {
    labelPosition?: keyof typeof styles;
    labelFormatter?: (value: number) => string;
}
export declare const Slider: ({ labelPosition, minValue, maxValue, labelFormatter, formatOptions, ...rest }: SliderProps) => import("react").JSX.Element;
export {};
