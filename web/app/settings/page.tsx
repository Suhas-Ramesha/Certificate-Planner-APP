'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Navbar from '@/components/Navbar'
import { Settings, Bell, Moon, Sun, Globe, Shield, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [emailUpdates, setEmailUpdates] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar activeTab="settings" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-primary-50">Manage your account preferences</p>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="p-8 space-y-6">
            {/* Notifications */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications about your learning progress</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-14 h-7 rounded-full transition-colors ${
                      notifications ? 'bg-primary-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                        notifications ? 'translate-x-7' : 'translate-x-1'
                      } mt-0.5`}></div>
                    </div>
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <p className="font-medium text-gray-900">Email Updates</p>
                    <p className="text-sm text-gray-600">Get weekly progress reports via email</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={emailUpdates}
                      onChange={(e) => setEmailUpdates(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-14 h-7 rounded-full transition-colors ${
                      emailUpdates ? 'bg-primary-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                        emailUpdates ? 'translate-x-7' : 'translate-x-1'
                      } mt-0.5`}></div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Appearance */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-4">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-primary-600" />
                ) : (
                  <Sun className="w-5 h-5 text-primary-600" />
                )}
                <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
              </div>
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="font-medium text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-600">Switch to dark theme</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-14 h-7 rounded-full transition-colors ${
                    darkMode ? 'bg-primary-600' : 'bg-gray-300'
                  }`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                      darkMode ? 'translate-x-7' : 'translate-x-1'
                    } mt-0.5`}></div>
                  </div>
                </div>
              </label>
            </div>

            {/* Privacy */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Privacy & Security</h2>
              </div>
              <div className="space-y-4">
                <button className="w-full text-left px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors">
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-600">Update your account password</p>
                </button>
                <button className="w-full text-left px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors">
                  <p className="font-medium text-gray-900">Data Export</p>
                  <p className="text-sm text-gray-600">Download your learning data</p>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
              </div>
              <button className="w-full text-left px-4 py-3 border-2 border-red-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors">
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-sm text-red-500">Permanently delete your account and all data</p>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
