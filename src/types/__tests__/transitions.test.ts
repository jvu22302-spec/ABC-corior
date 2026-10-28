import { describe, it, expect } from 'vitest';
import { canTransition, isTerminalStatus, TERMINAL_STATUSES } from '../domain';

describe('Shipment State Transitions', () => {
  it('identifies terminal statuses correctly', () => {
    expect(isTerminalStatus('delivered')).toBe(true);
    expect(isTerminalStatus('returned_to_sender')).toBe(true);
    expect(isTerminalStatus('cancelled')).toBe(true);
    expect(isTerminalStatus('lost')).toBe(true);
    expect(isTerminalStatus('in_transit')).toBe(false);
    expect(isTerminalStatus('booking_created')).toBe(false);
  });

  it('prevents any transitions from terminal states', () => {
    for (const terminal of TERMINAL_STATUSES) {
      expect(canTransition(terminal, 'out_for_delivery', 'super_admin')).toBe(false);
      expect(canTransition(terminal, 'in_transit', 'ops_manager')).toBe(false);
    }
  });

  it('allows valid transitions for authorized roles', () => {
    // booking_created -> pickup_scheduled allowed for ops_manager, branch_staff, super_admin
    expect(canTransition('booking_created', 'pickup_scheduled', 'super_admin')).toBe(true);
    expect(canTransition('booking_created', 'pickup_scheduled', 'ops_manager')).toBe(true);
    expect(canTransition('booking_created', 'pickup_scheduled', 'branch_staff')).toBe(true);
    // Not allowed for customer or rider
    expect(canTransition('booking_created', 'pickup_scheduled', 'customer')).toBe(false);
    expect(canTransition('booking_created', 'pickup_scheduled', 'rider')).toBe(false);

    // out_for_delivery -> delivered allowed for rider, ops_manager, super_admin
    expect(canTransition('out_for_delivery', 'delivered', 'rider')).toBe(true);
    expect(canTransition('out_for_delivery', 'delivered', 'ops_manager')).toBe(true);
    expect(canTransition('out_for_delivery', 'delivered', 'super_admin')).toBe(true);
    expect(canTransition('out_for_delivery', 'delivered', 'branch_staff')).toBe(false);
  });

  it('supports hold and exception flows', () => {
    // Any non-terminal can transition to on_hold by ops_manager, branch_staff, super_admin
    expect(canTransition('in_transit', 'on_hold', 'branch_staff')).toBe(true);
    expect(canTransition('picked_up', 'on_hold', 'ops_manager')).toBe(true);

    // on_hold -> return_initiated | cancelled | lost allowed for ops_manager, super_admin
    expect(canTransition('on_hold', 'return_initiated', 'ops_manager')).toBe(true);
    expect(canTransition('on_hold', 'cancelled', 'super_admin')).toBe(true);
    expect(canTransition('on_hold', 'lost', 'ops_manager')).toBe(true);
    // branch_staff cannot cancel or mark lost from on_hold
    expect(canTransition('on_hold', 'lost', 'branch_staff')).toBe(false);
  });

  it('handles delivery attempts and failure loops', () => {
    expect(canTransition('out_for_delivery', 'delivery_attempted', 'rider')).toBe(true);
    expect(canTransition('delivery_attempted', 'out_for_delivery', 'branch_staff')).toBe(true);
    expect(canTransition('delivery_attempted', 'delivery_failed', 'ops_manager')).toBe(true);
    expect(canTransition('delivery_failed', 'return_initiated', 'ops_manager')).toBe(true);
  });
});
