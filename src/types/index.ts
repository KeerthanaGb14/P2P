export interface Peer {
  id: string;
  ip: string;
  port: number;
  uploadSpeed: number;
  downloadSpeed: number;
  bandwidth: number;
  stability: number;
  churnRate: number;
  isSeeder: boolean;
  downloadProgress: number;
  connectionTime: number;
  region: string;
}

export interface SwarmMetrics {
  totalPeers: number;
  seeders: number;
  leechers: number;
  averageDownloadSpeed: number;
  averageUploadSpeed: number;
  swarmStability: number;
  redundantTransfers: number;
  completionRate: number;
}

export interface NetworkStats {
  totalBandwidthUsed: number;
  redundancyReduction: number;
  downloadTimeImprovement: number;
  swarmStabilityScore: number;
  packetTransferEfficiency: number;
}

export interface SimulationConfig {
  peerCount: number;
  fileSize: number;
  networkCondition: 'optimal' | 'moderate' | 'poor';
  useANATE: boolean;
  simulationSpeed: number;
}

export interface TorrentFile {
  id: string;
  name: string;
  size: number;
  seeders: number;
  leechers: number;
  downloadSpeed: number;
  uploadSpeed: number;
  eta: string;
  progress: number;
  status: 'downloading' | 'seeding' | 'paused' | 'completed';
}