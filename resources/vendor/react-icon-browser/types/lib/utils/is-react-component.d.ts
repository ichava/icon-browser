import type React from "react";
type ReactComponent = React.FC<any> | React.ComponentClass<any, any>;
/**
 * Checks if a given value is a function component.
 */
export declare const isFunctionComponent: (component: any) => component is React.FC<any>;
/**
 * Checks if a given value is a class component.
 */
export declare const isClassComponent: (component: any) => component is React.ComponentClass<any, any>;
/**
 * Checks if a given value is a forward ref component.
 */
export declare const isForwardRefComponent: (component: any) => component is React.ForwardRefExoticComponent<any>;
/**
 * Checks if a given value is a valid React component.
 */
export declare const isReactComponent: (component: any) => component is ReactComponent;
export {};
