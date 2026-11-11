import { HttpTransport } from '../../modules/catalog';
export { HttpError, HttpTransport, LARAVEL_SANCTUM_PRESET, RequestAbortedError, cleanPayload, type CsrfStrategy, type RequestOpts, type TransportConfig, } from '../../modules/catalog';
/** The default transport, on the shipped preset. */
export declare function getDefaultTransport(): HttpTransport;
