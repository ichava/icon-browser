/**
 * ColorPicker — hue/lightness sliders + swatches + hex + alpha, no native OS
 * picker (mockup ColorEngine, condensed). `value=null` means "themed"
 * (currentColor); picking a swatch/hex sets an explicit preview color.
 */
export declare function ColorPicker({ value, onChange }: {
    value: string | null;
    onChange: (c: string | null) => void;
}): import("react").JSX.Element;
