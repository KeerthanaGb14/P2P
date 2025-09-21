import React, { useState } from 'react'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const UserProfile: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile, signOut } = useAuth()

  if (!user || !profile) return null

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <p className="text-white font-medium text-sm">
            {profile.full_name || profile.username}
          </p>
          <p className="text-blue-200 text-xs capitalize">{profile.role}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-blue-200" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="font-medium text-gray-800">{profile.full_name || profile.username}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          
          <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-gray-700">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-red-600"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default UserProfile