import { useEffect, useState } from "react";
import settingsService from "../services/settingsService";

const defaultSettings = {
  profile: {
    full_name: "",
    email: "",
    role: "",
  },

  organization: {
    organization_name: "",
    organization_type: "",
    business_category: "",
    organization_contact: "",
  },

  security: {
    current_password: "",
    new_password: "",
    confirm_password: "",
    two_factor: false,
  },

  preferences: {
    theme: "light",
    language: "English",
    date_format: "DD/MM/YYYY",
    timezone: "Asia/Colombo",
    session_timeout: "30",
  },

  ai: {
    model: "EfficientNetB0",
    confidence: 80,
    auto_analyze: true,
    auto_reports: true,
    dashboard_ai: true,
  },

  system: {
    backend_online: true,
    database_online: true,
    storage: 0,
    version: "v1.0.0",
  },
};

export default function useSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [originalSettings, setOriginalSettings] =
    useState(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const user = await settingsService.getProfile();

      const mapped = {
        ...defaultSettings,

        profile: {
          full_name: user.full_name || "",
          email: user.email || "",
          role: user.role || "",
        },

        organization: {
          organization_name:
            user.organization_name || "",
          organization_type:
            user.organization_type || "",
          business_category:
            user.business_category || "",
          organization_contact:
            user.organization_contact || "",
        },
      };

      setSettings(mapped);
      setOriginalSettings(mapped);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleCancel = () => {
    setSettings(originalSettings);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update profile
      await settingsService.updateProfile({
        full_name: settings.profile.full_name,

        organization_name:
          settings.organization.organization_name,

        organization_type:
          settings.organization.organization_type,

        business_category:
          settings.organization.business_category,

        organization_contact:
          settings.organization.organization_contact,
      });

      // Update password only if user entered one
      if (
        settings.security.current_password &&
        settings.security.new_password
      ) {
        if (
          settings.security.new_password !==
          settings.security.confirm_password
        ) {
          alert("New passwords do not match.");
          return;
        }

        await settingsService.updatePassword({
          current_password:
            settings.security.current_password,

          new_password:
            settings.security.new_password,
        });

        setSettings((prev) => ({
          ...prev,
          security: {
            ...prev.security,
            current_password: "",
            new_password: "",
            confirm_password: "",
          },
        }));
      }

      await loadProfile();

      alert("Settings updated successfully.");
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.detail ||
          "Failed to update settings."
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    handleChange,
    handleCancel,
    handleSave,
    refreshSettings: loadProfile,
  };
}