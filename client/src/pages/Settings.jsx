import { useEffect, useState } from "react";
import {
    Settings as SettingsIcon,
    Save,
    Palette,
    Code2,
    Bell,
    User,
    RotateCcw,
    LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const DEFAULT_SETTINGS = {
    autoSave: true,
    saveNotifications: true,
    theme: "dark",
    compactUI: false,
    fontSize: 14,
    wordWrap: true,
    minimap: true,
    collaborationNotifications: true,
    systemNotifications: true,
};

function Settings() {
    const navigate = useNavigate();

    const [settings, setSettings] = useState(
        DEFAULT_SETTINGS
    );

    const [saved, setSaved] = useState(true);

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const userName =
        user.name ||
        user.username ||
        user.email?.split("@")[0] ||
        "Developer";

    const userEmail =
        user.email ||
        "No email available";


    /* Load saved settings */

    useEffect(() => {
        try {
            const storedSettings =
                localStorage.getItem(
                    "codeSyncSettings"
                );

            if (storedSettings) {
                setSettings({
                    ...DEFAULT_SETTINGS,
                    ...JSON.parse(storedSettings),
                });
            }

        } catch (error) {
            console.error(
                "Failed to load settings:",
                error
            );
        }
    }, []);


    /* Update setting */

    const updateSetting = (key, value) => {
        setSettings((prev) => {
            const updatedSettings = {
                ...prev,
                [key]: value,
            };

            localStorage.setItem(
                "codeSyncSettings",
                JSON.stringify(updatedSettings)
            );

            window.dispatchEvent(
                new Event("codeSyncSettingsChanged")
            );

            return updatedSettings;
        });

        setSaved(false);
    };

    /* Save */

    const saveSettings = () => {
        try {
            localStorage.setItem(
                "codeSyncSettings",
                JSON.stringify(settings)
            );

            window.dispatchEvent(
                new Event("codeSyncSettingsChanged")
            );

            setSaved(true);

            toast.success(
                "Settings saved successfully"
            );

        } catch (error) {
            console.error(
                "Save settings error:",
                error
            );

            toast.error(
                "Unable to save settings"
            );
        }
    };


    /* Reset */

    const resetSettings = () => {
        const confirmed =
            window.confirm(
                "Reset all settings to their default values?"
            );

        if (!confirmed) {
            return;
        }

        setSettings({
            ...DEFAULT_SETTINGS,
        });

        localStorage.setItem(
            "codeSyncSettings",
            JSON.stringify(
                DEFAULT_SETTINGS
            )
        );

        setSaved(true);

        toast.success(
            "Settings reset to default"
        );
    };


    /* Logout */

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };


    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* Header */}

            <header className="h-20 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 lg:px-10">

                <div className="flex items-center gap-3">

                    <div className="p-2.5 bg-blue-600 rounded-xl">

                        <SettingsIcon
                            size={22}
                        />

                    </div>

                    <div>

                        <h1 className="text-xl font-bold">
                            Settings
                        </h1>

                        <p className="text-xs text-slate-500">
                            Manage your CodeSync preferences
                        </p>

                    </div>

                </div>


                <div className="flex items-center gap-3">

                    {!saved && (
                        <span className="text-sm text-yellow-400">
                            Unsaved changes
                        </span>
                    )}

                    <button
                        onClick={resetSettings}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >

                        <RotateCcw
                            size={17}
                        />

                        Reset

                    </button>

                    <button
                        onClick={saveSettings}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-medium"
                    >

                        <Save
                            size={17}
                        />

                        Save Changes

                    </button>

                </div>

            </header>


            {/* Main */}

            <main className="max-w-6xl mx-auto p-6 lg:p-10">

                {/* Intro */}

                <div className="mb-8">

                    <h2 className="text-3xl font-bold">
                        Application Settings
                    </h2>

                    <p className="text-slate-400 mt-2">
                        Customize your coding workspace and application preferences.
                    </p>

                </div>


                <div className="space-y-6">


                    {/* General */}

                    <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

                        <div className="p-6 border-b border-slate-800 flex items-center gap-3">

                            <div className="p-2.5 bg-blue-500/10 rounded-xl">

                                <SettingsIcon
                                    size={20}
                                    className="text-blue-400"
                                />

                            </div>

                            <div>

                                <h3 className="font-semibold text-lg">
                                    General
                                </h3>

                                <p className="text-sm text-slate-500">
                                    Basic application behavior
                                </p>

                            </div>

                        </div>


                        <div className="p-6 space-y-5">

                            <ToggleSetting
                                title="Auto Save"
                                description="Automatically save your file changes."
                                enabled={settings.autoSave}
                                onChange={(value) =>
                                    updateSetting(
                                        "autoSave",
                                        value
                                    )
                                }
                            />

                            <ToggleSetting
                                title="Save Notifications"
                                description="Show a notification when a file is saved."
                                enabled={
                                    settings.saveNotifications
                                }
                                onChange={(value) =>
                                    updateSetting(
                                        "saveNotifications",
                                        value
                                    )
                                }
                            />

                        </div>

                    </section>


                    {/* Appearance */}

                    <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

                        <div className="p-6 border-b border-slate-800 flex items-center gap-3">

                            <div className="p-2.5 bg-purple-500/10 rounded-xl">

                                <Palette
                                    size={20}
                                    className="text-purple-400"
                                />

                            </div>

                            <div>

                                <h3 className="font-semibold text-lg">
                                    Appearance
                                </h3>

                                <p className="text-sm text-slate-500">
                                    Customize the look of your workspace
                                </p>

                            </div>

                        </div>


                        <div className="p-6 space-y-6">

                            {/* Theme */}

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                <div>

                                    <p className="font-medium">
                                        Theme Preference
                                    </p>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Choose your preferred workspace theme.
                                    </p>

                                </div>


                                <select
                                    value={settings.theme}
                                    onChange={(e) =>
                                        updateSetting(
                                            "theme",
                                            e.target.value
                                        )
                                    }
                                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >

                                    <option value="dark">
                                        Dark
                                    </option>

                                    <option value="light">
                                        Light
                                    </option>

                                </select>

                            </div>


                            <ToggleSetting
                                title="Compact Interface"
                                description="Use smaller spacing throughout the workspace."
                                enabled={
                                    settings.compactUI
                                }
                                onChange={(value) =>
                                    updateSetting(
                                        "compactUI",
                                        value
                                    )
                                }
                            />

                        </div>

                    </section>


                    {/* Editor */}

                    <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

                        <div className="p-6 border-b border-slate-800 flex items-center gap-3">

                            <div className="p-2.5 bg-green-500/10 rounded-xl">

                                <Code2
                                    size={20}
                                    className="text-green-400"
                                />

                            </div>

                            <div>

                                <h3 className="font-semibold text-lg">
                                    Editor Preferences
                                </h3>

                                <p className="text-sm text-slate-500">
                                    Configure your coding editor
                                </p>

                            </div>

                        </div>


                        <div className="p-6 space-y-7">

                            {/* Font Size */}

                            <div>

                                <div className="flex justify-between mb-3">

                                    <div>

                                        <p className="font-medium">
                                            Font Size
                                        </p>

                                        <p className="text-sm text-slate-500 mt-1">
                                            Choose the code editor font size.
                                        </p>

                                    </div>

                                    <span className="text-blue-400 font-semibold">
                                        {settings.fontSize}px
                                    </span>

                                </div>


                                <input
                                    type="range"
                                    min="12"
                                    max="24"
                                    value={
                                        settings.fontSize
                                    }
                                    onChange={(e) =>
                                        updateSetting(
                                            "fontSize",
                                            Number(
                                                e.target.value
                                            )
                                        )
                                    }
                                    className="w-full accent-blue-500"
                                />

                                <div className="flex justify-between text-xs text-slate-500 mt-2">

                                    <span>
                                        12px
                                    </span>

                                    <span>
                                        18px
                                    </span>

                                    <span>
                                        24px
                                    </span>

                                </div>

                            </div>


                            <ToggleSetting
                                title="Word Wrap"
                                description="Wrap long lines inside the editor."
                                enabled={
                                    settings.wordWrap
                                }
                                onChange={(value) =>
                                    updateSetting(
                                        "wordWrap",
                                        value
                                    )
                                }
                            />


                            <ToggleSetting
                                title="Minimap"
                                description="Show the code minimap on the right side of the editor."
                                enabled={
                                    settings.minimap
                                }
                                onChange={(value) =>
                                    updateSetting(
                                        "minimap",
                                        value
                                    )
                                }
                            />

                        </div>

                    </section>


                    {/* Notifications */}

                    <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

                        <div className="p-6 border-b border-slate-800 flex items-center gap-3">

                            <div className="p-2.5 bg-yellow-500/10 rounded-xl">

                                <Bell
                                    size={20}
                                    className="text-yellow-400"
                                />

                            </div>

                            <div>

                                <h3 className="font-semibold text-lg">
                                    Notifications
                                </h3>

                                <p className="text-sm text-slate-500">
                                    Control the notifications you receive
                                </p>

                            </div>

                        </div>


                        <div className="p-6 space-y-5">

                            <ToggleSetting
                                title="Collaboration Notifications"
                                description="Receive updates about collaborative activity."
                                enabled={
                                    settings.collaborationNotifications
                                }
                                onChange={(value) =>
                                    updateSetting(
                                        "collaborationNotifications",
                                        value
                                    )
                                }
                            />

                            <ToggleSetting
                                title="System Notifications"
                                description="Receive important application notifications."
                                enabled={
                                    settings.systemNotifications
                                }
                                onChange={(value) =>
                                    updateSetting(
                                        "systemNotifications",
                                        value
                                    )
                                }
                            />

                        </div>

                    </section>


                    {/* Account */}

                    <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

                        <div className="p-6 border-b border-slate-800 flex items-center gap-3">

                            <div className="p-2.5 bg-cyan-500/10 rounded-xl">

                                <User
                                    size={20}
                                    className="text-cyan-400"
                                />

                            </div>

                            <div>

                                <h3 className="font-semibold text-lg">
                                    Account
                                </h3>

                                <p className="text-sm text-slate-500">
                                    Your current CodeSync account
                                </p>

                            </div>

                        </div>


                        <div className="p-6">

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

                                <div className="flex items-center gap-4">

                                    <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
                                        {userName
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div>

                                        <p className="font-semibold text-lg">
                                            {userName}
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {userEmail}
                                        </p>

                                        <p className="text-xs text-slate-600 mt-1">
                                            Developer
                                        </p>

                                    </div>

                                </div>


                                <button
                                    onClick={
                                        handleLogout
                                    }
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 transition"
                                >

                                    <LogOut
                                        size={17}
                                    />

                                    Logout

                                </button>

                            </div>

                        </div>

                    </section>


                    {/* Bottom Save */}

                    <div className="flex justify-end pt-2 pb-10">

                        <button
                            onClick={saveSettings}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold"
                        >

                            <Save
                                size={18}
                            />

                            Save Settings

                        </button>

                    </div>

                </div>

            </main>

        </div>
    );
}


/* Toggle Component */

function ToggleSetting({
    title,
    description,
    enabled,
    onChange,
}) {
    return (
        <div className="flex items-center justify-between gap-5">

            <div>

                <p className="font-medium">
                    {title}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                    {description}
                </p>

            </div>


            <button
                type="button"
                onClick={() =>
                    onChange(!enabled)
                }
                className={`relative flex-shrink-0 w-12 h-7 rounded-full transition ${enabled
                    ? "bg-blue-600"
                    : "bg-slate-700"
                    }`}
            >

                <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${enabled
                        ? "left-6"
                        : "left-1"
                        }`}
                />

            </button>

        </div>
    );
}

export default Settings;