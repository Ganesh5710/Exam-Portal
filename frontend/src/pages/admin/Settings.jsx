import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Save,
  Download,
  Database,
  RefreshCw,
  Settings as SettingsIcon,
  Mail,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

export const Settings = () => {
  const [settings, setSettings] = useState({
    INSTITUTION_NAME: "",
    INSTITUTION_LOGO: "",
    THEME: "dark",
    SMTP_HOST: "",
    SMTP_PORT: "",
    SMTP_USER: "",
    SMTP_PASS: "",
    SESSION_TIMEOUT: "60",
    MAINTENANCE_MODE: "false",
  });

  const [backups, setBackups] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      setSettings(res.data.data);
    } catch (e) {
      toast.error("Failed to load system settings.");
    } finally {
      setLoadingSettings(false);
    }
  };

  const fetchBackups = async () => {
    setLoadingBackups(true);
    try {
      const res = await api.get("/backups");
      setBackups(res.data.data);
    } catch (e) {
      toast.error("Failed to retrieve database backups list.");
    } finally {
      setLoadingBackups(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchBackups();
  }, []);

  const handleUpdateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put("/settings", settings);
      toast.success("System configurations updated successfully.");
    } catch (e) {
      toast.error("Failed to save settings.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const res = await api.post("/backups", {});
      toast.success(`Backup generated: ${res.data.data.fileName}`);
      fetchBackups();
    } catch (e) {
      toast.error("Failed to trigger database backup.");
    }
  };

  const handleRestoreBackup = async (fileName) => {
    const confirm = window.confirm(
      `Warning: Restoring backup "${fileName}" will overwrite current data. Proceed?`,
    );
    if (!confirm) return;

    try {
      await api.post("/backups/restore", { fileName });
      toast.success("Database successfully restored from backup.");
      fetchSettings();
    } catch (e) {
      toast.error("Failed to restore database from backup.");
    }
  };

  const handleDownloadBackup = (fileName) => {
    window.open(`/api/v1/backups/${fileName}`, "_blank");
  };

  if (loadingSettings) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          System Settings & Backups
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure global portal parameters and manage database rollbacks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings form Column */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveSettings}
            className="glass-card p-6 rounded-xl border border-border space-y-6"
          >
            <div className="flex items-center gap-2.5 pb-4 border-b border-border">
              <SettingsIcon className="text-primary" size={20} />
              <h3 className="font-bold text-lg">General Configurations</h3>
            </div>

            {/* Institution Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={settings.INSTITUTION_NAME}
                  onChange={(e) =>
                    handleUpdateSetting("INSTITUTION_NAME", e.target.value)
                  }
                  className="w-full bg-background border border-border text-foreground rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Portal Theme
                  </label>
                  <select
                    value={settings.THEME}
                    onChange={(e) =>
                      handleUpdateSetting("THEME", e.target.value)
                    }
                    className="w-full bg-background border border-border text-foreground rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="dark">Dark Theme</option>
                    <option value="light">Light Theme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Session Timeout (m)
                  </label>
                  <input
                    type="number"
                    value={settings.SESSION_TIMEOUT}
                    onChange={(e) =>
                      handleUpdateSetting("SESSION_TIMEOUT", e.target.value)
                    }
                    className="w-full bg-background border border-border text-foreground rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SMTP Mail settings */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold mb-2">
                <Mail size={16} /> SMTP Dispatch Parameters
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={settings.SMTP_HOST || ""}
                    onChange={(e) =>
                      handleUpdateSetting("SMTP_HOST", e.target.value)
                    }
                    placeholder="e.g. smtp.gmail.com"
                    className="w-full bg-background border border-border text-foreground rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    value={settings.SMTP_PORT || ""}
                    onChange={(e) =>
                      handleUpdateSetting("SMTP_PORT", e.target.value)
                    }
                    placeholder="e.g. 587 or 465"
                    className="w-full bg-background border border-border text-foreground rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    SMTP Username (Email)
                  </label>
                  <input
                    type="text"
                    value={settings.SMTP_USER || ""}
                    onChange={(e) =>
                      handleUpdateSetting("SMTP_USER", e.target.value)
                    }
                    placeholder="e.g. your-email@gmail.com"
                    className="w-full bg-background border border-border text-foreground rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    SMTP Password / App Password
                  </label>
                  <input
                    type="password"
                    value={settings.SMTP_PASS || ""}
                    onChange={(e) =>
                      handleUpdateSetting("SMTP_PASS", e.target.value)
                    }
                    placeholder="••••••••••••"
                    className="w-full bg-background border border-border text-foreground rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Mode triggers */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">
                    System Maintenance Mode
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Blocks all student access immediately.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateSetting(
                      "MAINTENANCE_MODE",
                      settings.MAINTENANCE_MODE === "true" ? "false" : "true",
                    )
                  }
                  className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all
                    ${
                      settings.MAINTENANCE_MODE === "true"
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : "bg-accent/40 border-border text-muted-foreground hover:bg-accent/80"
                    }
                  `}
                >
                  {settings.MAINTENANCE_MODE === "true" ? "Active" : "Disabled"}
                </button>
              </div>
            </div>

            {/* Save trigger */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              <Save size={16} />{" "}
              {submitting ? "Saving settings..." : "Commit Configurations"}
            </button>
          </form>
        </div>

        {/* Backups Panel Column */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl border border-border space-y-6 flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <Database className="text-primary" size={20} />
                  <h3 className="font-bold text-lg">System Backups</h3>
                </div>
                <button
                  onClick={fetchBackups}
                  className="p-1.5 hover:bg-accent rounded text-muted-foreground transition-all"
                  disabled={loadingBackups}
                >
                  <RefreshCw
                    size={14}
                    className={loadingBackups ? "animate-spin" : ""}
                  />
                </button>
              </div>

              {/* History list */}
              <div className="mt-6 space-y-4 overflow-y-auto max-h-[300px]">
                {backups.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No historical backups found.
                  </p>
                ) : (
                  backups.map((backup) => (
                    <div
                      key={backup.fileName}
                      className="flex justify-between items-center p-3 bg-accent/30 border border-border rounded-lg text-xs"
                    >
                      <div>
                        <p className="font-semibold truncate max-w-[150px]">
                          {backup.fileName}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          Size: {(backup.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadBackup(backup.fileName)}
                          className="p-1.5 hover:bg-accent text-primary rounded"
                          title="Download"
                        >
                          <Download size={12} />
                        </button>
                        <button
                          onClick={() => handleRestoreBackup(backup.fileName)}
                          className="p-1.5 hover:bg-emerald-500/10 text-emerald-400 rounded"
                          title="Restore"
                        >
                          <CheckCircle2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Create new backup trigger */}
            <button
              onClick={handleCreateBackup}
              className="w-full bg-accent hover:bg-accent/80 border border-border font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all mt-6"
            >
              <Database size={16} /> Create Database Backup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
