import { Modal } from '@/components/ui/Modal';
import { glyphIcon } from '@/components/ui/glyphIcon';
import { Button } from '@/components/base/buttons/button';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { ModalFooter, ModalHeader } from '@/components/application/modal-layouts/modal-layouts';
import { useT } from '@/hooks/useT';
import { useAppStore } from '@/hooks/useStoreApi';

/**
 * ConfirmDialog — one shared confirmation modal driven by the store's `confirm`
 * slice (plan Part A). Reused by reset-filters, factory-reset, sign-out.
 *
 * Laid out as Untitled UI PRO's destructive-stacked-left-aligned modal (inventory #37):
 * a featured icon, the title as the dialog's heading, the body, and Cancel / Confirm in
 * two equal columns. The danger variant takes the error icon and a destructive button.
 */
export function ConfirmDialog() {
  const confirm = useAppStore((s) => s.confirm);
  const close = useAppStore((s) => s.closeConfirm);
  const t = useT();
  if (!confirm) return null;
  const { title, body, confirmLabel, cancelLabel = t('common.cancel'), danger, onConfirm } = confirm;

  return (
    <Modal onClose={close} width={400} label={title}>
      <ModalHeader
        icon={<FeaturedIcon color={danger ? 'error' : 'brand'} size="md" theme="modern" icon={glyphIcon('alert-circle')} />}
        title={title}
        description={body}
      />
      <ModalFooter layout="grid">
        <Button color="secondary" size="md" onClick={close}>
          {cancelLabel}
        </Button>
        <Button
          color={danger ? 'primary-destructive' : 'primary'}
          size="md"
          onClick={() => {
            onConfirm();
            close();
          }}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
