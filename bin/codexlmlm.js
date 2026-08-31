#!/usr/bin/env node
// @ts-check

/**
 * Modernized Entry Point for OpenAI Codex CLI.
 * Spawns the native target binary while proxying OS signals and standard I/O.
 */

import { spawn } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

// Construct ESM directory contexts
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const codexPackageRoot = realpathSync(path.join(__dirname, ".."));

/** @type {Record<string, string>} */
const PLATFORM_PACKAGE_BY_TARGET = Object.freeze({
  "x86_64-unknown-linux-musl": "@openai/codex-linux-x64",
  "aarch64-unknown-linux-musl": "@openai/codex-linux-arm64",
  "x86_64-apple-darwin": "@openai/codex-darwin-x64",
  "aarch64-apple-darwin": "@openai/codex-darwin-arm64",
  "x86_64-pc-windows-msvc": "@openai/codex-win32-x64",
  "aarch64-pc-windows-msvc": "@openai/codex-win32-arm64",
});

/**
 * Determines the target double or triple string for the host system.
 * @returns {string}
 */
function getTargetTriple() {
  const { platform, arch } = process;

  const targetMap = {
    linux: { x64: "x86_64-unknown-linux-musl", arm64: "aarch64-unknown-linux-musl" },
    android: { x64: "x86_64-unknown-linux-musl", arm64: "aarch64-unknown-linux-musl" },
    darwin: { x64: "x86_64-apple-darwin", arm64: "aarch64-apple-darwin" },
    win32: { x64: "x86_64-pc-windows-msvc", arm64: "aarch64-pc-windows-msvc" },
  };

  const targetTriple = targetMap[platform]?.[arch];
  if (!targetTriple) {
    throw new Error(`Unsupported platform/architecture combination: ${platform} (${arch})`);
  }
  return targetTriple;
}

/**
 * Checks if a specific node_modules location is owned by pnpm.
 * @param {string} nodeModulesDir
 * @returns {boolean}
 */
function isPnpmOwnedInstall(nodeModulesDir) {
  if (!existsSync(path.join(nodeModulesDir, ".modules.yaml"))) {
    return false;
  }
  try {
    return realpathSync(path.join(nodeModulesDir, "@openai", "codex")) === codexPackageRoot;
  } catch {
    return false;
  }
}

/**
 * Detects the active package manager driving the script environment.
 * @returns {"pnpm" | "bun" | "npm" | null}
 */
function detectPackageManager() {
  const entrypointDir = path.dirname(path.resolve(process.argv[1]));
  const startDirs = new Set([codexPackageRoot, entrypointDir]);

  for (const startDir of startDirs) {
    const root = path.parse(startDir).root;
    let currentDir = startDir;

    while (currentDir !== root) {
      if (isPnpmOwnedInstall(path.join(currentDir, "node_modules"))) {
        return "pnpm";
      }
      currentDir = path.dirname(currentDir);
    }

    if (isPnpmOwnedInstall(path.join(root, "node_modules"))) {
      return "pnpm";
    }
  }

  const userAgent = process.env.npm_config_user_agent || "";
  const execPath = process.env.npm_execpath || "";

  if (/\bbun\//.test(userAgent) || execPath.includes("bun") || __dirname.includes(".bun")) {
    return "bun";
  }

  return userAgent ? "npm" : null;
}

/**
 * Resolves the absolute path to the prebuilt native binary.
 * @param {string} targetTriple
 * @returns {string}
 */
function findCodexExecutable(targetTriple) {
  const platformPackage = PLATFORM_PACKAGE_BY_TARGET[targetTriple];
  let vendorRoot;

  try {
    const packageJsonPath = require.resolve(`${platformPackage}/package.json`);
    vendorRoot = path.join(path.dirname(packageJsonPath), "vendor");
  } catch {
    vendorRoot = path.join(codexPackageRoot, "vendor");
  }

  const binaryName = process.platform === "win32" ? "codex.exe" : "codex";
  const codexExecutable = path.join(vendorRoot, targetTriple, "bin", binaryName);

  if (existsSync(codexExecutable)) {
    return codexExecutable;
  }

  const pm = detectPackageManager();
  const updateCmd =
    pm === "bun"
      ? "bun install -g @openai/codex@latest"
      : pm === "pnpm"
        ? "pnpm add -g @openai/codex@latest"
        : "npm install -g @openai/codex@latest";

  throw new Error(`Missing optional native binary for ${platformPackage}.\nReinstall using: ${updateCmd}`);
}

/**
 * Launches the native executable, proxying process arguments and signals.
 */
async function main() {
  const targetTriple = getTargetTriple();
  const binaryPath = findCodexExecutable(targetTriple);
  const packageManager = detectPackageManager();

  const pmEnvVar =
    packageManager === "bun"
      ? "CODEX_MANAGED_BY_BUN"
      : packageManager === "pnpm"
        ? "CODEX_MANAGED_BY_PNPM"
        : "CODEX_MANAGED_BY_NPM";

  const env = {
    ...process.env,
    CODEX_MANAGED_PACKAGE_ROOT: codexPackageRoot,
  };

  delete env.CODEX_MANAGED_BY_NPM;
  delete env.CODEX_MANAGED_BY_BUN;
  delete env.CODEX_MANAGED_BY_PNPM;
  env[pmEnvVar] = "1";

  const child = spawn(binaryPath, process.argv.slice(2), {
    stdio: "inherit",
    env,
  });

  child.on("error", (err) => {
    console.error(`Failed to start Codex process: ${err.message}`);
    process.exit(1);
  });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      try {
        child.kill(signal);
      } catch {
        /* ignore */
      }
    }
  };

  ["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
    process.on(signal, () => forwardSignal(signal));
  });

  const result = await new Promise((resolve) => {
    child.on("exit", (code, signal) => {
      if (signal) {
        resolve({ type: "signal", signal });
      } else {
        resolve({ type: "code", exitCode: code ?? 1 });
      }
    });
  });

  if (result.type === "signal") {
    process.kill(process.pid, result.signal);
  } else {
    process.exit(result.exitCode);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
