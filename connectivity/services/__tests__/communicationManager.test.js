/**
 * OneHelp Emergency Communication Layer - Automated Unit Tests
 * Verifies Fallback Hierarchy: Internet -> SMS -> Bluetooth/P2P -> Local Queue
 */

import { communicationManager } from '../communicationManager.js';
import { connectivityDetector } from '../connectivityDetector.js';
import { offlineQueue } from '../offlineQueue.js';
import { clearSeenMessageIdsCache, sendViaBluetoothP2P } from '../transports/bleTransport.js';
import { DELIVERY_STATES, createEmergencyPacket } from '../emergencyPacket.js';

export async function runCommunicationLayerTests() {
  const testResults = [];

  function assert(condition, testName, detail = '') {
    if (condition) {
      testResults.push({ name: testName, status: 'PASSED', detail });
    } else {
      testResults.push({ name: testName, status: 'FAILED', detail });
      console.error(`❌ Test Failed: ${testName}`, detail);
    }
  }

  console.log('🧪 Starting Emergency Communication Layer Test Suite...');

  // Reset state
  offlineQueue.clear();
  clearSeenMessageIdsCache();

  // -------------------------------------------------------------
  // Test 1: Internet available -> Selects Internet (HTTP) Transport
  // -------------------------------------------------------------
  connectivityDetector.setForcedState('online');
  let result1 = await communicationManager.dispatchEmergencySOS({
    messageId: 'test_pkt_online_001',
    userIdentifier: 'Test User 1'
  });
  assert(
    result1.success && result1.transport === 'HTTP' && result1.status === DELIVERY_STATES.DELIVERED,
    'Test 1: Internet available -> Selects Internet (HTTP) Transport',
    `Transport used: ${result1.transport}, Status: ${result1.status}`
  );

  // -------------------------------------------------------------
  // Test 2: Internet unavailable + SMS available -> Selects SMS Transport
  // -------------------------------------------------------------
  connectivityDetector.setForcedState('sms_only');
  let result2 = await communicationManager.dispatchEmergencySOS({
    messageId: 'test_pkt_sms_002',
    userIdentifier: 'Test User 2'
  });
  assert(
    result2.success && result2.transport === 'SMS' && result2.status === DELIVERY_STATES.DELIVERED,
    'Test 2: Internet unavailable + SMS available -> Selects SMS Transport',
    `Transport used: ${result2.transport}, Status: ${result2.status}`
  );

  // -------------------------------------------------------------
  // Test 3: Internet & SMS unavailable + Bluetooth available -> Selects Bluetooth P2P
  // -------------------------------------------------------------
  connectivityDetector.setForcedState('mesh');
  let result3 = await communicationManager.dispatchEmergencySOS({
    messageId: 'test_pkt_mesh_003',
    userIdentifier: 'Test User 3'
  });
  assert(
    result3.success && result3.transport === 'BLE_P2P' && result3.status === DELIVERY_STATES.RELAYED,
    'Test 3: Internet/SMS unavailable + Bluetooth available -> Selects Bluetooth P2P Relay',
    `Transport used: ${result3.transport}, Status: ${result3.status}`
  );

  // -------------------------------------------------------------
  // Test 4: All Transports Unavailable -> Saves to Local Queue
  // -------------------------------------------------------------
  connectivityDetector.setForcedState('offline');
  let result4 = await communicationManager.dispatchEmergencySOS({
    messageId: 'test_pkt_queue_004',
    userIdentifier: 'Test User 4'
  });
  assert(
    result4.status === DELIVERY_STATES.QUEUED && result4.transport === 'LOCAL_QUEUE',
    'Test 4: All Transports Unavailable -> Enqueues to Local Storage Queue',
    `Status: ${result4.status}, Transport: ${result4.transport}`
  );

  // -------------------------------------------------------------
  // Test 5: Connectivity Restoration -> Queued Message Retries & Delivers
  // -------------------------------------------------------------
  const initialPendingCount = offlineQueue.getPendingPackets().length;
  assert(initialPendingCount > 0, 'Test 5a: Queue contains pending packets before reconnection');

  connectivityDetector.setForcedState('online');
  await communicationManager.processPendingQueue();
  
  const remainingPendingCount = offlineQueue.getPendingPackets().length;
  assert(
    remainingPendingCount === 0,
    'Test 5b: Connectivity Restoration -> Automatically retries and drains local queue',
    `Remaining in queue: ${remainingPendingCount}`
  );

  // -------------------------------------------------------------
  // Test 6: Duplicate Message Protection (Prevents duplicate delivery)
  // -------------------------------------------------------------
  clearSeenMessageIdsCache();
  const dupPacket = createEmergencyPacket({ messageId: 'dup_msg_999' });

  let dupResult1 = await sendViaBluetoothP2P(dupPacket, { isBluetoothAvailable: true, peersAvailable: true });
  assert(dupResult1.success === true, 'Test 6a: First reception of packet [dup_msg_999] accepted');

  let dupResult2 = await sendViaBluetoothP2P(dupPacket, { isBluetoothAvailable: true, peersAvailable: true });
  assert(
    dupResult2.success === false && dupResult2.isDuplicate === true,
    'Test 6b: Second reception of packet [dup_msg_999] rejected by duplicate filter',
    `Error message: ${dupResult2.error}`
  );

  connectivityDetector.setForcedState('online');

  const totalPassed = testResults.filter(t => t.status === 'PASSED').length;
  console.log(`\n✅ Test Suite Execution Complete: ${totalPassed}/${testResults.length} Tests Passed.`);
  
  return testResults;
}
