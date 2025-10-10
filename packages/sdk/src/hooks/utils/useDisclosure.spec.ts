import { act, renderHook } from '@testing-library/react';

import { useDisclosure } from './useDisclosure';

describe('useDisclosure', () => {
  it('should initialize with isOpen false by default', () => {
    const { result } = renderHook(() => useDisclosure());

    expect(result.current.isOpen).toBe(false);
  });

  it('should open when onOpen is called', () => {
    const { result } = renderHook(() => useDisclosure());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should close when onClose is called', () => {
    const { result } = renderHook(() => useDisclosure());

    // First open it
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);

    // Then close it
    act(() => {
      result.current.onClose();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('should work with multiple open/close cycles', () => {
    const { result } = renderHook(() => useDisclosure());

    // Start closed
    expect(result.current.isOpen).toBe(false);

    // Open -> Close -> Open
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onClose();
    });
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it('should call onOpen multiple times without side effects', () => {
    const { result } = renderHook(() => useDisclosure());

    act(() => {
      result.current.onOpen();
      result.current.onOpen();
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should call onClose multiple times without side effects', () => {
    const { result } = renderHook(() => useDisclosure());

    act(() => {
      result.current.onClose();
      result.current.onClose();
      result.current.onClose();
    });

    expect(result.current.isOpen).toBe(false);
  });
});
