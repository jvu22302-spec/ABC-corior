import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { Tabs } from '../Tabs';
import { MotionProvider } from '@/motion';

describe('UI Motion & Interaction: Button', () => {
  it('calls onClick when clicked in normal state', () => {
    const handleClick = vi.fn();
    render(
      <MotionProvider>
        <Button onClick={handleClick}>Click Me</Button>
      </MotionProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Click Me' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <MotionProvider>
        <Button disabled onClick={handleClick}>
          Disabled Button
        </Button>
      </MotionProvider>
    );

    const btn = screen.getByRole('button', { name: 'Disabled Button' });
    expect(btn.hasAttribute('disabled')).toBe(true);
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not trigger onClick when isLoading is true and renders loading spinner', () => {
    const handleClick = vi.fn();
    render(
      <MotionProvider>
        <Button isLoading onClick={handleClick}>
          Submit Parcel
        </Button>
      </MotionProvider>
    );

    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('UI Motion & Interaction: Modal', () => {
  it('closes when Esc key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <MotionProvider>
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal body content</p>
        </Modal>
      </MotionProvider>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('traps focus between first and last focusable elements on Tab key', () => {
    render(
      <MotionProvider>
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Focus Trap Modal"
          footer={
            <Button id="btn-cancel">Cancel</Button>
          }
        >
          <input data-testid="modal-input" placeholder="Enter name" />
        </Modal>
      </MotionProvider>
    );

    const closeBtn = screen.getByLabelText('Close dialog');
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });

    // Focus last button and press Tab -> should wrap to first focusable element (close button)
    cancelBtn.focus();
    expect(document.activeElement).toBe(cancelBtn);

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(closeBtn);

    // Press Shift+Tab on first element -> should wrap to last focusable element
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(cancelBtn);
  });
});

describe('UI Motion & Interaction: Tabs keyboard navigation', () => {
  function TabsWrapper() {
    const [activeTab, setActiveTab] = useState('tab-1');
    return (
      <Tabs
        tabs={[
          { id: 'tab-1', label: 'First Tab' },
          { id: 'tab-2', label: 'Second Tab' },
          { id: 'tab-3', label: 'Third Tab' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    );
  }

  it('navigates with arrow keys and Home/End across tabs', () => {
    render(
      <MotionProvider>
        <TabsWrapper />
      </MotionProvider>
    );

    const tablist = screen.getByRole('tablist');
    const firstTab = screen.getByRole('tab', { name: 'First Tab' });
    const secondTab = screen.getByRole('tab', { name: 'Second Tab' });
    const thirdTab = screen.getByRole('tab', { name: 'Third Tab' });

    expect(firstTab.getAttribute('aria-selected')).toBe('true');

    // ArrowRight moves to next tab
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(secondTab.getAttribute('aria-selected')).toBe('true');

    // ArrowRight moves to third tab
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(thirdTab.getAttribute('aria-selected')).toBe('true');

    // ArrowLeft moves back to second tab
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(secondTab.getAttribute('aria-selected')).toBe('true');

    // Home key jumps to first tab
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(firstTab.getAttribute('aria-selected')).toBe('true');

    // End key jumps to last tab
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(thirdTab.getAttribute('aria-selected')).toBe('true');
  });
});
