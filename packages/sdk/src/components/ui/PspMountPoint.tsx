import { usePspMountPoint } from '../../hooks/utils/usePspMountPoint';

/**
 * Element where a PSP SDK mounts its UI, reachable from `document` even inside a shadow root.
 */
export const PspMountPoint = ({ id, className }: { id: string; className?: string }) => {
  const { ref, slotted } = usePspMountPoint(id);

  return (
    <div ref={ref} id={slotted ? undefined : id} className={className}>
      {slotted && <slot name={id} />}
    </div>
  );
};
