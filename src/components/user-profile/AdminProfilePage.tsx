"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import { apiFetch } from "@/lib/api";
import { getProfilePictureUrl } from "@/lib/profilePicture";
import { updateStoredUser } from "@/lib/session";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";
import Swal from "sweetalert2";
import {
  Bell,
  CalendarDays,
  HelpCircle,
  ImagePlus,
  LayoutDashboard,
  MonitorCog,
  Shield,
  SlidersHorizontal,
  Upload,
} from "lucide-react";

type AdminProfile = {
  id?: number | string;
  full_name: string;
  email?: string;
  phone?: string;
  role?: string;
  profile_picture_url?: string | null;
  profile_picture_path?: string | null;
};

type AccountSettings = {
  appearance: {
    theme: "light" | "dark" | "system";
    compact_mode: boolean;
    sidebar_collapsed: boolean;
  };
  localization: {
    language: "sw" | "en";
    timezone: string;
    date_format: "d/m/Y" | "Y-m-d" | "m/d/Y";
    time_format: "12h" | "24h";
  };
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
    whatsapp_notifications: boolean;
    member_registration_alerts: boolean;
    contribution_alerts: boolean;
    event_reminders: boolean;
    support_updates: boolean;
  };
  dashboard: {
    default_date_range: "today" | "week" | "month" | "quarter" | "year";
    records_per_page: number;
    auto_refresh: boolean;
    show_dashboard_verse: boolean;
  };
  privacy: {
    show_phone_to_leaders: boolean;
    show_email_to_leaders: boolean;
    login_alerts: boolean;
  };
  support: {
    preferred_contact_method: "email" | "phone" | "whatsapp";
  };
};

const defaultSettings: AccountSettings = {
  appearance: {
    theme: "system",
    compact_mode: false,
    sidebar_collapsed: false,
  },
  localization: {
    language: "sw",
    timezone: "Africa/Dar_es_Salaam",
    date_format: "d/m/Y",
    time_format: "24h",
  },
  notifications: {
    email_notifications: true,
    sms_notifications: false,
    whatsapp_notifications: false,
    member_registration_alerts: true,
    contribution_alerts: true,
    event_reminders: true,
    support_updates: true,
  },
  dashboard: {
    default_date_range: "month",
    records_per_page: 25,
    auto_refresh: false,
    show_dashboard_verse: true,
  },
  privacy: {
    show_phone_to_leaders: true,
    show_email_to_leaders: true,
    login_alerts: true,
  },
  support: {
    preferred_contact_method: "email",
  },
};

const fieldClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function unwrap<T>(response: any, key: string, fallback: T): T {
  return response?.[key] ?? response?.data?.[key] ?? response?.data ?? fallback;
}

function mergeSettings(settings: Partial<AccountSettings> | undefined): AccountSettings {
  return {
    appearance: { ...defaultSettings.appearance, ...settings?.appearance },
    localization: { ...defaultSettings.localization, ...settings?.localization },
    notifications: { ...defaultSettings.notifications, ...settings?.notifications },
    dashboard: { ...defaultSettings.dashboard, ...settings?.dashboard },
    privacy: { ...defaultSettings.privacy, ...settings?.privacy },
    support: { ...defaultSettings.support, ...settings?.support },
  };
}

function changedSettings(current: AccountSettings, original: AccountSettings) {
  const patch: Record<string, Record<string, string | number | boolean>> = {};

  (Object.keys(current) as Array<keyof AccountSettings>).forEach((section) => {
    const sectionPatch: Record<string, string | number | boolean> = {};
    const values = current[section] as Record<string, string | number | boolean>;
    const previous = original[section] as Record<string, string | number | boolean>;

    Object.keys(values).forEach((key) => {
      if (values[key] !== previous[key]) {
        sectionPatch[key] = values[key];
      }
    });

    if (Object.keys(sectionPatch).length > 0) {
      patch[section] = sectionPatch;
    }
  });

  return patch;
}

export default function AdminProfilePage() {
  const { theme, setTheme, applySystemTheme } = useTheme();
  const { isExpanded, setIsExpanded } = useSidebar();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const [settings, setSettings] = useState<AccountSettings>(defaultSettings);
  const [savedSettings, setSavedSettings] = useState<AccountSettings>(defaultSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const imageSrc = previewUrl || getProfilePictureUrl(profile);
  const settingsPatch = useMemo(() => changedSettings(settings, savedSettings), [settings, savedSettings]);
  const hasSettingsChanges = Object.keys(settingsPatch).length > 0;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (profileLoaded || profileLoading) return;

    async function loadProfile() {
      try {
        setProfileLoading(true);
        const response = await apiFetch("/admin/profile");
        const nextProfile = unwrap<AdminProfile | null>(response, "profile", null);
        setProfile(nextProfile);
        setProfileName(nextProfile?.full_name || "");
        setProfileLoaded(true);
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Imeshindikana kupakia taarifa za profile.", "error");
      } finally {
        setProfileLoading(false);
      }
    }

    loadProfile();
  }, [profileLoaded, profileLoading]);

  useEffect(() => {
    if (settingsLoaded || settingsLoading) return;

    async function loadSettings() {
      try {
        setSettingsLoading(true);
        const response = await apiFetch("/admin/account-settings");
        const nextSettings = mergeSettings(unwrap<Partial<AccountSettings>>(response, "settings", {}));
        // Reflect the theme/sidebar state actually applied to the app right now,
        // instead of a possibly stale value saved earlier on the backend.
        nextSettings.appearance.theme = theme;
        nextSettings.appearance.sidebar_collapsed = !isExpanded;
        setSettings(nextSettings);
        setSavedSettings(nextSettings);
        setSettingsLoaded(true);
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Imeshindikana kupakia account settings.", "error");
      } finally {
        setSettingsLoading(false);
      }
    }

    loadSettings();
  }, [settingsLoaded, settingsLoading]);

  const updateSetting = <TSection extends keyof AccountSettings, TKey extends keyof AccountSettings[TSection]>(
    section: TSection,
    key: TKey,
    value: AccountSettings[TSection][TKey]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleProfileFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire("Tahadhari", "Chagua picha ya JPG, JPEG, PNG au WEBP.", "warning");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Tahadhari", "Picha isizidi 2MB.", "warning");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setProfileFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    if (!profileName.trim()) {
      Swal.fire("Tahadhari", "Jina kamili linahitajika.", "warning");
      return;
    }

    try {
      setProfileSaving(true);
      const formData = new FormData();
      formData.append("full_name", profileName.trim());
      if (profileFile) formData.append("profile_picture", profileFile);

      const response = await apiFetch("/admin/profile", {
        method: "POST",
        body: formData,
      });
      const nextProfile = unwrap<AdminProfile>(response, "profile", {
        ...profile,
        full_name: profileName.trim(),
      } as AdminProfile);

      setProfile(nextProfile);
      setProfileName(nextProfile.full_name || profileName.trim());
      updateStoredUser(nextProfile);
      setProfileFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      Swal.fire("Imefanikiwa", "Profile imehifadhiwa.", "success");
    } catch (error: any) {
      Swal.fire("Error", error?.message || "Imeshindikana kuhifadhi profile.", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  const saveSettings = async () => {
    if (!hasSettingsChanges) {
      Swal.fire("Hakuna mabadiliko", "Badilisha angalau setting moja kabla ya kuhifadhi.", "info");
      return;
    }

    try {
      setSettingsSaving(true);
      const response = await apiFetch("/admin/account-settings", {
        method: "PATCH",
        body: settingsPatch,
      });
      const nextSettings = mergeSettings(unwrap<Partial<AccountSettings>>(response, "settings", settings));
      setSettings(nextSettings);
      setSavedSettings(nextSettings);
      Swal.fire("Imefanikiwa", "Account settings zimehifadhiwa.", "success");
    } catch (error: any) {
      Swal.fire("Error", error?.message || "Imeshindikana kuhifadhi account settings.", "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Edit Profile</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Only full name and profile picture can be changed here.
            </p>
          </div>
          <Button onClick={saveProfile} disabled={profileSaving} startIcon={<Upload size={16} />}>
            {profileSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>

        {profileLoading ? (
          <SectionLoading message="Inapakia profile..." />
        ) : (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <div className="flex size-32 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              {imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageSrc} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="text-gray-400" size={38} />
              )}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">
              <ImagePlus size={16} />
              Upload Picture
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleProfileFile} />
            </label>
            <p className="text-center text-xs text-gray-500">JPG, JPEG, PNG or WEBP. Max 2MB.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full Name">
              <input className={fieldClass} value={profileName} onChange={(event) => setProfileName(event.target.value)} />
            </Field>
            <ReadOnly label="Email" value={profile?.email} />
            <ReadOnly label="Phone" value={profile?.phone} />
            <ReadOnly label="Role" value={profile?.role} />
          </div>
        </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Account Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Changes are sent as a partial PATCH payload.</p>
          </div>
          <Button onClick={saveSettings} disabled={settingsSaving || !hasSettingsChanges} startIcon={<SlidersHorizontal size={16} />}>
            {settingsSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        {settingsLoading ? (
          <SectionLoading message="Inapakia account settings..." />
        ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <SettingsGroup icon={<MonitorCog size={18} />} title="Appearance">
            <SelectField
              label="Theme"
              value={settings.appearance.theme}
              options={[
                ["light", "Light"],
                ["dark", "Dark"],
                ["system", "System"],
              ]}
              onChange={(value) => {
                const nextTheme = value as AccountSettings["appearance"]["theme"];
                updateSetting("appearance", "theme", nextTheme);
                if (nextTheme === "system") {
                  applySystemTheme();
                } else {
                  setTheme(nextTheme);
                }
              }}
            />
            <Toggle label="Compact Mode" checked={settings.appearance.compact_mode} onChange={(value) => updateSetting("appearance", "compact_mode", value)} />
            <Toggle
              label="Sidebar Collapsed"
              checked={settings.appearance.sidebar_collapsed}
              onChange={(value) => {
                updateSetting("appearance", "sidebar_collapsed", value);
                setIsExpanded(!value);
              }}
            />
          </SettingsGroup>

          <SettingsGroup icon={<CalendarDays size={18} />} title="Localization">
            <SelectField
              label="Language"
              value={settings.localization.language}
              options={[
                ["sw", "Swahili"],
                ["en", "English"],
              ]}
              onChange={(value) => updateSetting("localization", "language", value as AccountSettings["localization"]["language"])}
            />
            <Field label="Timezone">
              <input
                className={fieldClass}
                value={settings.localization.timezone}
                onChange={(event) => updateSetting("localization", "timezone", event.target.value)}
                placeholder="Africa/Dar_es_Salaam"
              />
            </Field>
            <SelectField
              label="Date Format"
              value={settings.localization.date_format}
              options={[
                ["d/m/Y", "d/m/Y"],
                ["Y-m-d", "Y-m-d"],
                ["m/d/Y", "m/d/Y"],
              ]}
              onChange={(value) => updateSetting("localization", "date_format", value as AccountSettings["localization"]["date_format"])}
            />
            <SelectField
              label="Time Format"
              value={settings.localization.time_format}
              options={[
                ["12h", "12h"],
                ["24h", "24h"],
              ]}
              onChange={(value) => updateSetting("localization", "time_format", value as AccountSettings["localization"]["time_format"])}
            />
          </SettingsGroup>

          <SettingsGroup icon={<Bell size={18} />} title="Notifications">
            <Toggle label="Email Notifications" checked={settings.notifications.email_notifications} onChange={(value) => updateSetting("notifications", "email_notifications", value)} />
            <Toggle label="SMS Notifications" checked={settings.notifications.sms_notifications} onChange={(value) => updateSetting("notifications", "sms_notifications", value)} />
            <Toggle label="WhatsApp Notifications" checked={settings.notifications.whatsapp_notifications} onChange={(value) => updateSetting("notifications", "whatsapp_notifications", value)} />
            <Toggle label="Member Registration Alerts" checked={settings.notifications.member_registration_alerts} onChange={(value) => updateSetting("notifications", "member_registration_alerts", value)} />
            <Toggle label="Contribution Alerts" checked={settings.notifications.contribution_alerts} onChange={(value) => updateSetting("notifications", "contribution_alerts", value)} />
            <Toggle label="Event Reminders" checked={settings.notifications.event_reminders} onChange={(value) => updateSetting("notifications", "event_reminders", value)} />
            <Toggle label="Support Updates" checked={settings.notifications.support_updates} onChange={(value) => updateSetting("notifications", "support_updates", value)} />
          </SettingsGroup>

          <SettingsGroup icon={<LayoutDashboard size={18} />} title="Dashboard">
            <SelectField
              label="Default Date Range"
              value={settings.dashboard.default_date_range}
              options={[
                ["today", "Today"],
                ["week", "Week"],
                ["month", "Month"],
                ["quarter", "Quarter"],
                ["year", "Year"],
              ]}
              onChange={(value) => updateSetting("dashboard", "default_date_range", value as AccountSettings["dashboard"]["default_date_range"])}
            />
            <Field label="Records Per Page">
              <input
                className={fieldClass}
                type="number"
                min={10}
                max={100}
                value={settings.dashboard.records_per_page}
                onChange={(event) => {
                  const value = Math.min(100, Math.max(10, Number(event.target.value) || 10));
                  updateSetting("dashboard", "records_per_page", value);
                }}
              />
            </Field>
            <Toggle label="Auto Refresh" checked={settings.dashboard.auto_refresh} onChange={(value) => updateSetting("dashboard", "auto_refresh", value)} />
            <Toggle label="Show Dashboard Verse" checked={settings.dashboard.show_dashboard_verse} onChange={(value) => updateSetting("dashboard", "show_dashboard_verse", value)} />
          </SettingsGroup>

          <SettingsGroup icon={<Shield size={18} />} title="Privacy">
            <Toggle label="Show Phone To Leaders" checked={settings.privacy.show_phone_to_leaders} onChange={(value) => updateSetting("privacy", "show_phone_to_leaders", value)} />
            <Toggle label="Show Email To Leaders" checked={settings.privacy.show_email_to_leaders} onChange={(value) => updateSetting("privacy", "show_email_to_leaders", value)} />
            <Toggle label="Login Alerts" checked={settings.privacy.login_alerts} onChange={(value) => updateSetting("privacy", "login_alerts", value)} />
          </SettingsGroup>

          <SettingsGroup icon={<HelpCircle size={18} />} title="Support Preferences">
            <SelectField
              label="Preferred Contact Method"
              value={settings.support.preferred_contact_method}
              options={[
                ["email", "Email"],
                ["phone", "Phone"],
                ["whatsapp", "WhatsApp"],
              ]}
              onChange={(value) => updateSetting("support", "preferred_contact_method", value as AccountSettings["support"]["preferred_contact_method"])}
            />
          </SettingsGroup>
        </div>
        )}
      </section>
    </div>
  );
}

function SectionLoading({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700">
      {message}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
      {children}
    </label>
  );
}

function ReadOnly({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
      <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
        {value || "-"}
      </p>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <select className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>
            {labelText}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-800 dark:text-gray-300">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
    </label>
  );
}

function SettingsGroup({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <div className="mb-4 flex items-center gap-2 text-gray-800 dark:text-white/90">
        {icon}
        <h4 className="text-base font-semibold">{title}</h4>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}
