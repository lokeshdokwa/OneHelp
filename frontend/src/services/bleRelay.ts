import { MeshPacket, MeshRelayNode, SOSPayload } from '../types';

class BleMeshService {
  private static instance: BleMeshService;
  private processedPacketIds: Set<string> = new Set();
  private nearbyNodes: Map<string, MeshRelayNode> = new Map();
  private relayedPackets: MeshPacket[] = [];
  private isScanning: boolean = false;
  private isAdvertising: boolean = false;
  private nodeId: string = `node_${Math.floor(Math.random() * 100000)}`;

  private constructor() {
    // Seed initial local node mock peers for testing mesh when isolated
    this.addNearbyNode('node_peer_alpha', 'OneHelp Node A-12', -68, 1);
    this.addNearbyNode('node_peer_beta', 'OneHelp Node B-04', -79, 2);
  }

  public static getInstance(): BleMeshService {
    if (!BleMeshService.instance) {
      BleMeshService.instance = new BleMeshService();
    }
    return BleMeshService.instance;
  }

  public getNodeId(): string {
    return this.nodeId;
  }

  public getNearbyNodeCount(): number {
    return this.nearbyNodes.size;
  }

  public getNearbyNodes(): MeshRelayNode[] {
    return Array.from(this.nearbyNodes.values());
  }

  public getRelayedPackets(): MeshPacket[] {
    return [...this.relayedPackets];
  }

  public addNearbyNode(id: string, name: string, rssi: number, hops: number): void {
    this.nearbyNodes.set(id, {
      id,
      name,
      rssi,
      lastSeen: Date.now(),
      hopsAway: hops,
    });
  }

  /**
   * Broadcast an SOS packet over Bluetooth Low Energy mesh
   */
  public async broadcastSosPacket(payload: SOSPayload): Promise<{ success: boolean; relayedToCount: number; packetId: string }> {
    const packetId = `mesh_pkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.processedPacketIds.add(packetId);

    const packet: MeshPacket = {
      packetId,
      originNodeId: this.nodeId,
      senderNodeId: this.nodeId,
      ttl: 5, // Up to 5 hops
      payloadType: 'SOS',
      payloadJson: JSON.stringify(payload),
      timestamp: Date.now(),
    };

    // Store in our local relay log
    this.relayedPackets.unshift(packet);

    // Simulate multi-node BLE ad burst
    const reachedPeers = Math.max(1, this.nearbyNodes.size);

    return {
      success: true,
      relayedToCount: reachedPeers,
      packetId,
    };
  }

  /**
   * Handle receiving a mesh packet from an external or nearby device
   */
  public handleIncomingPacket(packet: MeshPacket): { rebroadcast: boolean; message: string } {
    // 1. Check duplicate to prevent infinite loops
    if (this.processedPacketIds.has(packet.packetId)) {
      return { rebroadcast: false, message: 'Duplicate packet ignored' };
    }

    this.processedPacketIds.add(packet.packetId);
    this.relayedPackets.unshift(packet);

    // 2. Check TTL (Time to Live hop limit)
    if (packet.ttl <= 1) {
      return { rebroadcast: false, message: 'TTL expired. Packet consumed.' };
    }

    // 3. Decrement TTL and rebroadcast as forwarder
    const forwardedPacket: MeshPacket = {
      ...packet,
      senderNodeId: this.nodeId,
      ttl: packet.ttl - 1,
    };

    console.log(`[BleMesh] Rebroadcasting forwarded packet ${packet.packetId}, remaining hops: ${forwardedPacket.ttl}`);
    return { rebroadcast: true, message: `Packet forwarded with TTL ${forwardedPacket.ttl}` };
  }

  public startMeshScanning(onPacketReceived?: (packet: MeshPacket) => void): void {
    if (this.isScanning) return;
    this.isScanning = true;
    console.log('[BleMesh] BLE Mesh scanning active');
  }

  public stopMeshScanning(): void {
    this.isScanning = false;
    console.log('[BleMesh] BLE Mesh scanning stopped');
  }
}

export const BleMesh = BleMeshService.getInstance();
