import { Peer, SwarmMetrics, NetworkStats, SimulationConfig } from '../types';

export class ANATESimulation {
  private peers: Peer[] = [];
  private metrics: SwarmMetrics;
  private networkStats: NetworkStats;
  private config: SimulationConfig;
  private isRunning = false;

  constructor(config: SimulationConfig) {
    this.config = config;
    this.metrics = this.initializeMetrics();
    this.networkStats = this.initializeNetworkStats();
    this.generatePeers();
  }

  private initializeMetrics(): SwarmMetrics {
    return {
      totalPeers: 0,
      seeders: 0,
      leechers: 0,
      averageDownloadSpeed: 0,
      averageUploadSpeed: 0,
      swarmStability: 0,
      redundantTransfers: 0,
      completionRate: 0,
    };
  }

  private initializeNetworkStats(): NetworkStats {
    return {
      totalBandwidthUsed: 0,
      redundancyReduction: this.config.useANATE ? 69 : 0,
      downloadTimeImprovement: this.config.useANATE ? 57 : 0,
      swarmStabilityScore: this.config.useANATE ? 85 : 60,
      packetTransferEfficiency: this.config.useANATE ? 92 : 65,
    };
  }

  private generatePeers(): void {
    const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa'];
    
    for (let i = 0; i < this.config.peerCount; i++) {
      const isSeeder = Math.random() < 0.3; // 30% seeders
      const baseSpeed = this.getBaseSpeedByCondition();
      
      const peer: Peer = {
        id: `peer-${i}`,
        ip: this.generateIP(),
        port: 6881 + Math.floor(Math.random() * 100),
        uploadSpeed: baseSpeed * (0.5 + Math.random() * 0.5),
        downloadSpeed: baseSpeed * (0.8 + Math.random() * 0.4),
        bandwidth: baseSpeed * (1 + Math.random()),
        stability: Math.random() * 100,
        churnRate: Math.random() * 0.1,
        isSeeder,
        downloadProgress: isSeeder ? 100 : Math.random() * 80,
        connectionTime: Date.now() - Math.random() * 3600000,
        region: regions[Math.floor(Math.random() * regions.length)],
      };
      
      this.peers.push(peer);
    }
  }

  private getBaseSpeedByCondition(): number {
    switch (this.config.networkCondition) {
      case 'optimal': return 1000; // 1 MB/s
      case 'moderate': return 500;  // 500 KB/s
      case 'poor': return 100;      // 100 KB/s
      default: return 500;
    }
  }

  private generateIP(): string {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  public startSimulation(): void {
    this.isRunning = true;
  }

  public stopSimulation(): void {
    this.isRunning = false;
  }

  public updateSimulation(): void {
    if (!this.isRunning) return;

    // Update peer progress
    this.peers.forEach(peer => {
      if (!peer.isSeeder && peer.downloadProgress < 100) {
        const progressIncrease = this.config.useANATE 
          ? (peer.downloadSpeed / 1000) * 2 // ANATE optimization
          : (peer.downloadSpeed / 1000) * 1;
        
        peer.downloadProgress = Math.min(100, peer.downloadProgress + progressIncrease);
        
        if (peer.downloadProgress >= 100) {
          peer.isSeeder = true;
        }
      }
    });

    // Update metrics
    this.updateMetrics();
  }

  private updateMetrics(): void {
    const seeders = this.peers.filter(p => p.isSeeder).length;
    const leechers = this.peers.filter(p => !p.isSeeder).length;
    
    this.metrics = {
      totalPeers: this.peers.length,
      seeders,
      leechers,
      averageDownloadSpeed: this.calculateAverageDownloadSpeed(),
      averageUploadSpeed: this.calculateAverageUploadSpeed(),
      swarmStability: this.calculateSwarmStability(),
      redundantTransfers: this.calculateRedundantTransfers(),
      completionRate: (seeders / this.peers.length) * 100,
    };

    // Update network stats with dynamic values
    this.networkStats.totalBandwidthUsed += this.metrics.averageDownloadSpeed * this.peers.length;
  }

  private calculateAverageDownloadSpeed(): number {
    const activePeers = this.peers.filter(p => !p.isSeeder);
    if (activePeers.length === 0) return 0;
    
    const totalSpeed = activePeers.reduce((sum, peer) => sum + peer.downloadSpeed, 0);
    return totalSpeed / activePeers.length;
  }

  private calculateAverageUploadSpeed(): number {
    const seeders = this.peers.filter(p => p.isSeeder);
    if (seeders.length === 0) return 0;
    
    const totalSpeed = seeders.reduce((sum, peer) => sum + peer.uploadSpeed, 0);
    return totalSpeed / seeders.length;
  }

  private calculateSwarmStability(): number {
    const avgStability = this.peers.reduce((sum, peer) => sum + peer.stability, 0) / this.peers.length;
    return this.config.useANATE ? Math.min(100, avgStability * 1.4) : avgStability;
  }

  private calculateRedundantTransfers(): number {
    const baseRedundancy = this.peers.length * 0.3;
    return this.config.useANATE ? baseRedundancy * 0.31 : baseRedundancy; // 69% reduction
  }

  public getMetrics(): SwarmMetrics {
    return this.metrics;
  }

  public getNetworkStats(): NetworkStats {
    return this.networkStats;
  }

  public getPeers(): Peer[] {
    return this.peers;
  }

  public addPeer(): void {
    const newPeer: Peer = {
      id: `peer-${this.peers.length}`,
      ip: this.generateIP(),
      port: 6881 + Math.floor(Math.random() * 100),
      uploadSpeed: this.getBaseSpeedByCondition() * (0.5 + Math.random() * 0.5),
      downloadSpeed: this.getBaseSpeedByCondition() * (0.8 + Math.random() * 0.4),
      bandwidth: this.getBaseSpeedByCondition() * (1 + Math.random()),
      stability: Math.random() * 100,
      churnRate: Math.random() * 0.1,
      isSeeder: false,
      downloadProgress: Math.random() * 30,
      connectionTime: Date.now(),
      region: ['North America', 'Europe', 'Asia'][Math.floor(Math.random() * 3)],
    };
    
    this.peers.push(newPeer);
  }

  public removePeer(): void {
    if (this.peers.length > 1) {
      const randomIndex = Math.floor(Math.random() * this.peers.length);
      this.peers.splice(randomIndex, 1);
    }
  }
}