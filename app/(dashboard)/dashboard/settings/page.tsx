/**
 * Settings Page
 * Hesap ve uygulama ayarları
 */

'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, User, Bell, Shield, Palette, Save } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Geri</span>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-gray-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Ayarlar
              </span>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Ayarlar
          </h1>
          <p className="text-lg text-gray-600">
            Hesap ve uygulama tercihlerinizi yönetin
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Hesap Ayarları */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-blue-100 p-3">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Hesap Ayarları</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  value={session?.user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={session?.user?.name || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Bildirim Ayarları */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-purple-100 p-3">
                <Bell className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Bildirimler</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">E-posta Bildirimleri</div>
                  <div className="text-sm text-gray-600">Önemli güncellemeler için e-posta alın</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Çalışma Hatırlatıcıları</div>
                  <div className="text-sm text-gray-600">Günlük çalışma hedefleriniz için hatırlatıcılar</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Görünüm Ayarları */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-pink-100 p-3">
                <Palette className="h-6 w-6 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Görünüm</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tema
                </label>
                <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Açık</option>
                  <option>Koyu</option>
                  <option>Sistem</option>
                </select>
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all hover:scale-105">
              <Save className="h-5 w-5" />
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}