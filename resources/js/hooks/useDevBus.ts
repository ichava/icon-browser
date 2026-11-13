import { pageDevBus, type DevBus } from '@/modules/telemetry';
import { devBusOf } from '@/store';
import { useStoreApi } from '@/hooks/useStoreApi';

/** The bus this mount's store emits on (a child of the page bus); the page bus if it has none. */
export function useDevBus(): DevBus {
  return devBusOf(useStoreApi()) ?? pageDevBus;
}
