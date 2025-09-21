import React from 'react';
import { BookOpen, Target, Lightbulb, Award, TrendingUp, Users } from 'lucide-react';

const ResearchHighlights: React.FC = () => {
  const highlights = [
    {
      icon: Target,
      title: "Problem Identification",
      description: "Identified critical limitations in existing torrent systems including high redundancy, unstable swarm formation, and extended download times.",
      color: "text-red-600 bg-red-100"
    },
    {
      icon: Lightbulb,
      title: "Hybrid Architecture",
      description: "Developed innovative hybrid approach combining P2P decentralization with intelligent central coordination for optimal performance.",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: TrendingUp,
      title: "Performance Gains",
      description: "Achieved 69% reduction in redundant transfers and 57% improvement in download times through adaptive network awareness.",
      color: "text-green-600 bg-green-100"
    },
    {
      icon: Users,
      title: "Real-World Applications",
      description: "Designed for academic networks, ISP-level content delivery, disaster recovery systems, and media distribution platforms.",
      color: "text-purple-600 bg-purple-100"
    }
  ];

  const challenges = [
    "Handling peer churn dynamics in complex network environments",
    "Balancing centralized control without losing P2P scalability benefits",
    "Designing efficient broadcast-aware caching mechanisms",
    "Optimizing swarm stability across heterogeneous network conditions"
  ];

  return (
    <div className="space-y-8">
      {/* Research Overview */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Research Overview</h2>
        </div>
        
        <div className="prose max-w-none text-gray-600 leading-relaxed">
          <p className="text-lg mb-4">
            The Adaptive Network-Aware Torrent Ecosystem (ANATE) represents a breakthrough in 
            peer-to-peer file sharing technology, addressing fundamental inefficiencies in 
            traditional BitTorrent protocols through intelligent hybrid architecture.
          </p>
          
          <p className="mb-4">
            Our research identified that while decentralized P2P systems offer excellent resilience, 
            they introduce significant inefficiencies in heterogeneous network environments. ANATE 
            solves this by implementing a central tracker with advanced analytics capabilities, 
            broadcast-aware overlays, and hybrid peer selection strategies.
          </p>
        </div>
      </div>

      {/* Key Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {highlights.map((highlight, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${highlight.color}`}>
                <highlight.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {highlight.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Achievements */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg p-8 border border-green-100">
        <div className="flex items-center space-x-3 mb-6">
          <Award className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Technical Achievements</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">69%</div>
            <div className="text-gray-600">Reduction in Redundant Packet Transfers</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">57%</div>
            <div className="text-gray-600">Decrease in Overall Download Time</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
            <div className="text-gray-600">Improved Swarm Stability Score</div>
          </div>
        </div>
      </div>

      {/* Research Challenges */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Research Challenges Addressed</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700">{challenge}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Applications */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Real-World Applications</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Academic Networks</h3>
            <p className="text-sm text-gray-600">Efficient distribution of courseware and research materials</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">ISP Content Delivery</h3>
            <p className="text-sm text-gray-600">Hybrid P2P-broadcast optimization for service providers</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Disaster Recovery</h3>
            <p className="text-sm text-gray-600">Large-scale file distribution in emergency scenarios</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Media Platforms</h3>
            <p className="text-sm text-gray-600">Reduced backbone traffic for content distribution</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchHighlights;