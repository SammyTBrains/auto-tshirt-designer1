import React, { useEffect, useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  RefreshCcw,
  Save,
  FlaskConical,
} from "lucide-react";
import {
  RuntimeConfigPayload,
  runtimeConfigService,
} from "../../services/runtimeConfigService";

type SecretVisibility = Record<string, boolean>;

interface RuntimeConfigPanelProps {
  onConfigUpdated?: (config: RuntimeConfigPayload) => void;
}

const secretFields = [
  "stripe.publishable_key",
  "stripe.secret_key",
  "smtp.username",
  "smtp.password",
  "telegram.bot_token",
  "telegram.chat_id",
  "huggingface.token",
  "printify.api_key",
  "printify.shop_id",
];

const buildVisibilityKey = (path: string) => path;

const RuntimeConfigPanel: React.FC<RuntimeConfigPanelProps> = ({
  onConfigUpdated,
}) => {
  const [config, setConfig] = useState<RuntimeConfigPayload | null>(null);
  const [variantMapText, setVariantMapText] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [secretVisibility, setSecretVisibility] = useState<SecretVisibility>(
    {}
  );
  const [testingPrintify, setTestingPrintify] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const result = await runtimeConfigService.getAdminConfig();
        setConfig(result.settings);
        setVariantMapText(
          JSON.stringify(result.settings.printify.variant_map ?? {}, null, 2)
        );
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Failed to load configuration",
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const toggleSecretVisibility = (path: string) => {
    setSecretVisibility((prev) => ({
      ...prev,
      [buildVisibilityKey(path)]: !prev[buildVisibilityKey(path)],
    }));
  };

  const handleInputChange = (
    section: keyof RuntimeConfigPayload,
    field: string,
    value: string
  ) => {
    setConfig((prev) => {
      if (!prev) return prev;

      switch (section) {
        case "stripe":
          return {
            ...prev,
            stripe: {
              ...prev.stripe,
              [field]: value,
            },
          };
        case "smtp":
          return {
            ...prev,
            smtp: {
              ...prev.smtp,
              [field]: value,
            },
          };
        case "telegram":
          return {
            ...prev,
            telegram: {
              ...prev.telegram,
              [field]: value,
            },
          };
        case "huggingface":
          return {
            ...prev,
            huggingface: {
              ...prev.huggingface,
              [field]: value,
            },
          };
        case "printify":
          return {
            ...prev,
            printify: {
              ...prev.printify,
              [field]: value,
            },
          };
        case "features":
          return {
            ...prev,
            features: {
              ...prev.features,
              [field]: value,
            } as RuntimeConfigPayload["features"],
          };
        default:
          return prev;
      }
    });
  };

  const handleNumberChange = (
    section: keyof RuntimeConfigPayload,
    field: string,
    value: string
  ) => {
    handleInputChange(section, field, value.replace(/[^0-9.]/g, ""));
  };

  const handleBooleanToggle = (
    section: "features",
    field: keyof RuntimeConfigPayload["features"]
  ) => {
    if (!config) return;
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        features: {
          ...prev.features,
          [field]: !prev.features[field],
        },
      };
    });
  };

  const secretVisibilityMap = useMemo(
    () => secretVisibility,
    [secretVisibility]
  );

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);

    let parsedVariantMap: Record<string, number> | null = null;
    try {
      const sanitized = variantMapText.trim();
      parsedVariantMap = sanitized ? JSON.parse(sanitized) : {};
    } catch (error) {
      setSaving(false);
      setMessage({ type: "error", text: "Variant map must be valid JSON" });
      return;
    }

    const payload: RuntimeConfigPayload = {
      ...config,
      smtp: {
        ...config.smtp,
        port: Number(config.smtp.port) || 0,
      },
      huggingface: {
        ...config.huggingface,
        timeout: Number(config.huggingface.timeout) || 0,
      },
      printify: {
        ...config.printify,
        print_provider_id:
          config.printify.print_provider_id !== undefined &&
          config.printify.print_provider_id !== null
            ? Number(config.printify.print_provider_id) || null
            : null,
        blueprint_id:
          config.printify.blueprint_id !== undefined &&
          config.printify.blueprint_id !== null
            ? Number(config.printify.blueprint_id) || null
            : null,
        default_shipping_method:
          Number(config.printify.default_shipping_method) || 1,
        variant_map: parsedVariantMap,
      },
    };

    try {
      const response = await runtimeConfigService.updateAdminConfig(payload);
      setConfig(response.settings);
      setVariantMapText(
        JSON.stringify(response.settings.printify.variant_map ?? {}, null, 2)
      );
      onConfigUpdated?.(response.settings);
      setMessage({ type: "success", text: "Configuration updated" });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update configuration",
      });
    } finally {
      setSaving(false);
    }
  };

  const refreshConfig = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await runtimeConfigService.refreshAdminConfig();
      setConfig(response.settings);
      setVariantMapText(
        JSON.stringify(response.settings.printify.variant_map ?? {}, null, 2)
      );
      onConfigUpdated?.(response.settings);
      setMessage({ type: "success", text: "Configuration reloaded" });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to refresh configuration",
      });
    } finally {
      setLoading(false);
    }
  };

  const testPrintify = async () => {
    setTestingPrintify(true);
    setMessage(null);
    try {
      await runtimeConfigService.testPrintify();
      setMessage({ type: "success", text: "Printify connection succeeded" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Printify test failed",
      });
    } finally {
      setTestingPrintify(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="text-sm text-gray-600">
            Loading configuration...
          </span>
        </div>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Runtime Configuration
          </h2>
          <p className="text-sm text-gray-500">
            Manage API keys and service integrations without redeploying.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={refreshConfig}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}{" "}
            Save Changes
          </button>
          <button
            onClick={testPrintify}
            disabled={testingPrintify}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-60"
          >
            {testingPrintify ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FlaskConical className="h-4 w-4" />
            )}{" "}
            Test Printify
          </button>
        </div>
      </div>

      <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
        Tip: You don’t need to fill every field. Save applies whatever you’ve
        set and leaves the rest unchanged. Features that are missing required
        keys (e.g., Stripe or Hugging Face) will simply remain inactive until
        configured.
      </div>

      {message && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="space-y-4">
          <header>
            <h3 className="text-lg font-semibold text-gray-900">Stripe</h3>
            <p className="text-xs text-gray-500">
              Controls checkout and payment capabilities.
            </p>
          </header>
          {(["publishable_key", "secret_key"] as const).map((field) => {
            const path = `stripe.${field}`;
            const visible = secretVisibilityMap[buildVisibilityKey(path)];
            return (
              <label key={field} className="block">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {field.replace("_", " ")}
                </span>
                <div className="mt-1 relative">
                  <input
                    type={visible ? "text" : "password"}
                    value={config.stripe[field]}
                    onChange={(e) =>
                      handleInputChange("stripe", field, e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility(path)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                  >
                    {visible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>
            );
          })}
        </section>

        <section className="space-y-4">
          <header>
            <h3 className="text-lg font-semibold text-gray-900">SMTP</h3>
            <p className="text-xs text-gray-500">
              Email notifications for customers and admins.
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Host</span>
              <input
                value={config.smtp.host}
                onChange={(e) =>
                  handleInputChange("smtp", "host", e.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Port</span>
              <input
                value={config.smtp.port}
                onChange={(e) =>
                  handleNumberChange("smtp", "port", e.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Username
              </span>
              <div className="mt-1 relative">
                <input
                  type={
                    secretVisibilityMap[buildVisibilityKey("smtp.username")]
                      ? "text"
                      : "password"
                  }
                  value={config.smtp.username}
                  onChange={(e) =>
                    handleInputChange("smtp", "username", e.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility("smtp.username")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  {secretVisibilityMap[buildVisibilityKey("smtp.username")] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Password
              </span>
              <div className="mt-1 relative">
                <input
                  type={
                    secretVisibilityMap[buildVisibilityKey("smtp.password")]
                      ? "text"
                      : "password"
                  }
                  value={config.smtp.password}
                  onChange={(e) =>
                    handleInputChange("smtp", "password", e.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility("smtp.password")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  {secretVisibilityMap[buildVisibilityKey("smtp.password")] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                From Email
              </span>
              <input
                value={config.smtp.from_email}
                onChange={(e) =>
                  handleInputChange("smtp", "from_email", e.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                From Name
              </span>
              <input
                value={config.smtp.from_name}
                onChange={(e) =>
                  handleInputChange("smtp", "from_name", e.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <header>
            <h3 className="text-lg font-semibold text-gray-900">Telegram</h3>
            <p className="text-xs text-gray-500">
              Administrative alerts and daily analytics.
            </p>
          </header>
          {(["bot_token", "chat_id"] as const).map((field) => {
            const path = `telegram.${field}`;
            const visible = secretVisibilityMap[buildVisibilityKey(path)];
            return (
              <label key={field} className="block">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {field.replace("_", " ")}
                </span>
                <div className="mt-1 relative">
                  <input
                    type={visible ? "text" : "password"}
                    value={config.telegram[field]}
                    onChange={(e) =>
                      handleInputChange("telegram", field, e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility(path)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                  >
                    {visible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>
            );
          })}
        </section>

        <section className="space-y-4">
          <header>
            <h3 className="text-lg font-semibold text-gray-900">
              Hugging Face
            </h3>
            <p className="text-xs text-gray-500">
              Image generation provider configuration.
            </p>
          </header>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Token</span>
            <div className="mt-1 relative">
              <input
                type={
                  secretVisibilityMap[buildVisibilityKey("huggingface.token")]
                    ? "text"
                    : "password"
                }
                value={config.huggingface.token}
                onChange={(e) =>
                  handleInputChange("huggingface", "token", e.target.value)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => toggleSecretVisibility("huggingface.token")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
              >
                {secretVisibilityMap[
                  buildVisibilityKey("huggingface.token")
                ] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Model</span>
            <input
              value={config.huggingface.model}
              onChange={(e) =>
                handleInputChange("huggingface", "model", e.target.value)
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Base URL</span>
            <input
              value={config.huggingface.base_url}
              onChange={(e) =>
                handleInputChange("huggingface", "base_url", e.target.value)
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Timeout (seconds)
              </span>
              <input
                value={config.huggingface.timeout}
                onChange={(e) =>
                  handleNumberChange("huggingface", "timeout", e.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Provider Override
              </span>
              <input
                value={config.huggingface.provider ?? ""}
                onChange={(e) =>
                  handleInputChange("huggingface", "provider", e.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
          </div>
        </section>

        <section className="space-y-4 lg:col-span-2">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Printify</h3>
              <p className="text-xs text-gray-500">
                Configure fulfillment provider and variant mapping.
              </p>
            </div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["api_key", "shop_id"] as const).map((field) => {
              const path = `printify.${field}`;
              const visible = secretVisibilityMap[buildVisibilityKey(path)];
              return (
                <label key={field} className="block">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {field.replace("_", " ")}
                  </span>
                  <div className="mt-1 relative">
                    <input
                      type={visible ? "text" : "password"}
                      value={config.printify[field]}
                      onChange={(e) =>
                        handleInputChange("printify", field, e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecretVisibility(path)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                    >
                      {visible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>
              );
            })}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Print Provider ID
              </span>
              <input
                value={config.printify.print_provider_id ?? ""}
                onChange={(e) =>
                  handleNumberChange(
                    "printify",
                    "print_provider_id",
                    e.target.value
                  )
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Blueprint ID
              </span>
              <input
                value={config.printify.blueprint_id ?? ""}
                onChange={(e) =>
                  handleNumberChange("printify", "blueprint_id", e.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Default Shipping Method
              </span>
              <input
                value={config.printify.default_shipping_method}
                onChange={(e) =>
                  handleNumberChange(
                    "printify",
                    "default_shipping_method",
                    e.target.value
                  )
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Print Area
              </span>
              <input
                value={config.printify.print_area}
                onChange={(e) =>
                  handleInputChange("printify", "print_area", e.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Variant Map (size to variant ID JSON)
            </span>
            <textarea
              value={variantMapText}
              onChange={(e) => setVariantMapText(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>
        </section>

        <section className="space-y-4 lg:col-span-2">
          <header>
            <h3 className="text-lg font-semibold text-gray-900">
              Feature Flags
            </h3>
            <p className="text-xs text-gray-500">
              Toggle experimental and optional features.
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Marketplace
                </span>
                <p className="text-xs text-gray-500">
                  Controls public visibility of the design marketplace.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.features.marketplace_enabled}
                onChange={() =>
                  handleBooleanToggle("features", "marketplace_enabled")
                }
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Design Export
                </span>
                <p className="text-xs text-gray-500">
                  Enables PNG/PDF export options in the custom studio.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.features.design_export_enabled}
                onChange={() =>
                  handleBooleanToggle("features", "design_export_enabled")
                }
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RuntimeConfigPanel;
