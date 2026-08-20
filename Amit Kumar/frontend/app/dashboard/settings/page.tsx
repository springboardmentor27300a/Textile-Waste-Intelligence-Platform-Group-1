"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Bell, Globe, Palette, Save, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Password", icon: Lock },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "language", label: "Language", icon: Globe },
];

const LANGUAGES = [
  { code: "en", name: "English" }, { code: "hi", name: "Hindi (हिंदी)" },
  { code: "gu", name: "Gujarati (ગુજરાતી)" }, { code: "mr", name: "Marathi (मराठी)" },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [profile, setProfile] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    company: user?.company || "",
    phone: user?.phone || "",
  });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [language, setLanguage] = useState("en");
  const [notifSettings, setNotifSettings] = useState({
    waste_alerts: true, recycling_opportunities: true, low_inventory: true,
    sustainability_achievements: true, admin_notifications: true, email_digest: false
  });

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success("Settings saved successfully!");
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account preferences and platform settings</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs */}
        <div className="md:w-48 flex-shrink-0">
          <div className="glass-card p-3 space-y-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`sidebar-item w-full ${activeTab === tab.id ? "active" : ""}`}>
                <tab.icon style={{width: 18, height: 18}} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }} className="glass-card p-8">

            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="font-bold text-white text-lg">Profile Information</h2>
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl">
                    {user?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{user?.full_name}</p>
                    <p className="text-gray-400 text-sm capitalize">{user?.role?.replace(/_/g," ")}</p>
                    <button className="text-xs text-primary-400 hover:text-primary-300 mt-1">Change Avatar</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Full Name</label>
                    <input value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Email</label>
                    <input value={profile.email} className="input-field text-sm opacity-50" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Company</label>
                    <input value={profile.company} onChange={e => setProfile({...profile, company: e.target.value})} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Phone</label>
                    <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="input-field text-sm" />
                  </div>
                </div>
                <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 text-sm py-2.5">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Profile</>}
                </button>
              </div>
            )}

            {activeTab === "password" && (
              <div className="space-y-6">
                <h2 className="font-bold text-white text-lg">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  {[
                    { label: "Current Password", key: "current" },
                    { label: "New Password", key: "new" },
                    { label: "Confirm New Password", key: "confirm" }
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs text-gray-400 mb-2">{field.label}</label>
                      <div className="relative">
                        <input type={showPass ? "text" : "password"} value={(passwords as any)[field.key]}
                          onChange={e => setPasswords({...passwords, [field.key]: e.target.value})}
                          className="input-field text-sm pr-11" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 text-sm py-2.5 mt-2">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Update Password</>}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "theme" && (
              <div className="space-y-6">
                <h2 className="font-bold text-white text-lg">Appearance</h2>
                <div className="grid grid-cols-2 gap-4 max-w-sm">
                  {["dark","light"].map(t => (
                    <button key={t} onClick={() => setTheme(t)}
                      className={`p-6 rounded-2xl border-2 text-center transition-all capitalize font-semibold
                        ${theme === t ? "border-primary-500 bg-primary-500/10 text-white" : "border-white/10 text-gray-400 hover:border-white/20"}`}>
                      <span className="text-3xl block mb-2">{t === "dark" ? "🌙" : "☀️"}</span>
                      {t} Mode
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="font-bold text-white text-lg">Notification Preferences</h2>
                <div className="space-y-4">
                  {Object.entries(notifSettings).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="font-medium text-white capitalize text-sm">{key.replace(/_/g," ")}</p>
                        <p className="text-xs text-gray-500">Receive alerts for {key.replace(/_/g," ").toLowerCase()}</p>
                      </div>
                      <button onClick={() => setNotifSettings(s => ({...s, [key]: !val}))}
                        className={`w-12 h-6 rounded-full transition-all relative ${val ? "bg-primary-500" : "bg-white/10"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${val ? "left-6.5" : "left-0.5"}`}
                          style={{left: val ? "calc(100% - 22px)" : "2px"}} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={save} className="btn-primary flex items-center gap-2 text-sm py-2.5">
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            )}

            {activeTab === "language" && (
              <div className="space-y-6">
                <h2 className="font-bold text-white text-lg">Language Settings</h2>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  {LANGUAGES.map(lang => (
                    <button key={lang.code} onClick={() => setLanguage(lang.code)}
                      className={`p-4 rounded-xl border-2 text-left transition-all
                        ${language === lang.code ? "border-primary-500 bg-primary-500/10" : "border-white/10 hover:border-white/20"}`}>
                      <p className="font-semibold text-white">{lang.name.split(" ")[0]}</p>
                      <p className="text-xs text-gray-400">{lang.name.split(" ").slice(1).join(" ")}</p>
                    </button>
                  ))}
                </div>
                <button onClick={save} className="btn-primary flex items-center gap-2 text-sm py-2.5">
                  <Save className="w-4 h-4" /> Save Language
                </button>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}
