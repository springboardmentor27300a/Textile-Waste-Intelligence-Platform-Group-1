import ProfileCard from "../../components/settings/ProfileCard";
import OrganizationCard from "../../components/settings/OrganizationCard";
import SecurityCard from "../../components/settings/SecurityCard";
import PreferenceCard from "../../components/settings/PreferenceCard";
import AIConfigurationCard from "../../components/settings/AIConfigurationCard";
import SystemInfoCard from "../../components/settings/SystemInfoCard";
import SettingsFooter from "../../components/settings/SettingsFooter";
import useSettings from "../../hooks/useSettings";

function Settings() {
  const {
    settings,
    loading,
    saving,
    handleChange,
    handleCancel,
    handleSave,
  } = useSettings();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 animate-pulse rounded-xl bg-gray-200" />

        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-72 animate-pulse rounded-2xl bg-white shadow-sm"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold text-heading">
          System Settings
        </h1>

        <p className="mt-2 text-muted">
          Manage your account, organization, application preferences and AI
          configuration.
        </p>

      </div>

      {/* Profile & Organization */}

      <div className="grid gap-8 xl:grid-cols-2">

        <ProfileCard
          data={settings.profile}
          onChange={handleChange}
        />

        <OrganizationCard
          data={settings.organization}
          onChange={handleChange}
        />

      </div>

      {/* Security & Preferences */}

      <div className="grid gap-8 xl:grid-cols-2">

        <SecurityCard
          data={settings.security}
          onChange={handleChange}
        />

        <PreferenceCard
          data={settings.preferences}
          onChange={handleChange}
        />

      </div>

      {/* AI */}

      <AIConfigurationCard
        data={settings.ai}
        onChange={handleChange}
      />

      {/* System */}

      <SystemInfoCard
        data={settings.system}
      />

      {/* Footer */}

      <SettingsFooter
        saving={saving}
        onCancel={handleCancel}
        onSave={handleSave}
      />

    </div>
  );
}

export default Settings;