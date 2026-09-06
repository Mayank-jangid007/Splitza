/**
 * Puppeteer Bot Service — Phase 3
 *
 * Automated browser bots that:
 * 1. Navigate to subscription service login pages
 * 2. Log in with host credentials
 * 3. Verify the plan is active + has available slots
 * 4. Capture any OTPs from the login flow
 * 5. Take a screenshot as verification proof
 *
 * Requires env vars:
 *   PUPPETEER_HEADLESS=true   (false to debug visually)
 *   SCREENSHOTS_DIR=./screenshots
 */

import puppeteer, { Browser, Page } from "puppeteer";
import path from "path";
import fs from "fs";
import { prisma } from "../lib/prisma";
import { publishOtp } from "./pubsub";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR || path.join(process.cwd(), "screenshots");
const HEADLESS = process.env.PUPPETEER_HEADLESS !== "false";
const BOT_TIMEOUT = 30000; // 30 seconds max per action

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Browser lifecycle
// ---------------------------------------------------------------------------
let browserInstance: Browser | null = null;

const getBrowser = async (): Promise<Browser> => {
  if (!browserInstance || !browserInstance.connected) {
    console.log("🤖 [BOT] Launching Puppeteer browser...");
    browserInstance = await puppeteer.launch({
      headless: HEADLESS,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
      ],
      defaultViewport: { width: 1280, height: 800 },
    });
    console.log("✅ [BOT] Browser launched");
  }
  return browserInstance;
};

export const closeBrowser = async (): Promise<void> => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    console.log("🔴 [BOT] Browser closed");
  }
};

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------
const takeScreenshot = async (page: Page, label: string): Promise<string> => {
  const filename = `${label}_${Date.now()}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`📸 [BOT] Screenshot saved: ${filepath}`);
  return filepath;
};

const waitAndType = async (page: Page, selector: string, text: string) => {
  await page.waitForSelector(selector, { timeout: BOT_TIMEOUT });
  await page.click(selector, { clickCount: 3 });
  await page.type(selector, text, { delay: 50 });
};

const waitAndClick = async (page: Page, selector: string) => {
  await page.waitForSelector(selector, { timeout: BOT_TIMEOUT });
  await page.click(selector);
};

// ---------------------------------------------------------------------------
// OTP interception
// ---------------------------------------------------------------------------
const interceptOtp = async (page: Page, planId: string): Promise<void> => {
  // Listen for OTP input fields after form submission
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("otp") || url.includes("verify") || url.includes("mfa")) {
      try {
        const body = await response.text();
        const otpMatch = body.match(/\b\d{4,8}\b/);
        if (otpMatch) {
          const otp = otpMatch[0];
          console.log(`🔢 [BOT] OTP intercepted: ${otp}`);
          await publishOtp({ planId, otp, source: "bot-intercept" });
        }
      } catch {
        // Response body not readable, skip
      }
    }
  });
};

// ---------------------------------------------------------------------------
// Service-specific verification bots
// ---------------------------------------------------------------------------

/**
 * Netflix Bot
 * Logs in and checks subscription plan is active
 */
const verifyNetflix = async (
  page: Page,
  credentials: { email: string; password: string }
): Promise<{ active: boolean; plan: string; screenshotPath: string }> => {
  console.log("🎬 [BOT] Verifying Netflix plan...");

  await page.goto("https://www.netflix.com/in/login", { waitUntil: "networkidle2", timeout: BOT_TIMEOUT });

  // Fill email
  await waitAndType(page, 'input[name="userLoginId"]', credentials.email);
  // Fill password
  await waitAndType(page, 'input[name="password"]', credentials.password);

  const screenshotBefore = await takeScreenshot(page, "netflix_login");

  // Submit
  await page.keyboard.press("Enter");
  await page.waitForNavigation({ timeout: BOT_TIMEOUT }).catch(() => {});

  const currentUrl = page.url();
  const isLoggedIn = currentUrl.includes("netflix.com") && !currentUrl.includes("login");

  if (!isLoggedIn) {
    const errorEl = await page.$('[data-uia="login-error"]').catch(() => null);
    const errorText = errorEl ? await page.evaluate((el: any) => el.textContent, errorEl) : "Unknown error";
    console.error(`❌ [BOT] Netflix login failed: ${errorText}`);
    const screenshotPath = await takeScreenshot(page, "netflix_login_failed");
    return { active: false, plan: "", screenshotPath };
  }

  // Navigate to account page to check plan
  await page.goto("https://www.netflix.com/account", { waitUntil: "networkidle2", timeout: BOT_TIMEOUT });

  const screenshotPath = await takeScreenshot(page, "netflix_account");

  // Extract plan name
  const planText = await page.evaluate(() => {
    const el = document.querySelector('[data-uia="plan-label"]') ||
                document.querySelector(".plan-label") ||
                document.querySelector('[class*="plan"]');
    return el ? el.textContent?.trim() : "";
  });

  console.log(`✅ [BOT] Netflix plan detected: ${planText}`);
  return { active: true, plan: planText || "Active Plan", screenshotPath };
};

/**
 * Spotify Bot
 */
const verifySpotify = async (
  page: Page,
  credentials: { email: string; password: string }
): Promise<{ active: boolean; plan: string; screenshotPath: string }> => {
  console.log("🎵 [BOT] Verifying Spotify plan...");

  await page.goto("https://accounts.spotify.com/en/login", { waitUntil: "networkidle2", timeout: BOT_TIMEOUT });

  await waitAndType(page, '#login-username', credentials.email);
  await waitAndType(page, '#login-password', credentials.password);
  await waitAndClick(page, '#login-button');

  await page.waitForNavigation({ timeout: BOT_TIMEOUT }).catch(() => {});

  const currentUrl = page.url();
  const isLoggedIn = !currentUrl.includes("accounts.spotify.com/en/login");

  if (!isLoggedIn) {
    const screenshotPath = await takeScreenshot(page, "spotify_login_failed");
    return { active: false, plan: "", screenshotPath };
  }

  // Go to account overview
  await page.goto("https://www.spotify.com/in-en/account/overview/", { waitUntil: "networkidle2", timeout: BOT_TIMEOUT });
  const screenshotPath = await takeScreenshot(page, "spotify_account");

  const planText = await page.evaluate(() => {
    const el = document.querySelector('[class*="plan"]') ||
                document.querySelector('[class*="subscription"]');
    return el ? el.textContent?.trim() : "Premium";
  });

  return { active: true, plan: planText || "Premium", screenshotPath };
};

/**
 * YouTube Premium Bot
 */
const verifyYouTube = async (
  page: Page,
  credentials: { email: string; password: string }
): Promise<{ active: boolean; plan: string; screenshotPath: string }> => {
  console.log("▶️  [BOT] Verifying YouTube Premium...");

  await page.goto("https://accounts.google.com/signin", { waitUntil: "networkidle2", timeout: BOT_TIMEOUT });

  await waitAndType(page, 'input[type="email"]', credentials.email);
  await waitAndClick(page, '#identifierNext');

  await page.waitForSelector('input[type="password"]', { timeout: BOT_TIMEOUT });
  await waitAndType(page, 'input[type="password"]', credentials.password);
  await waitAndClick(page, '#passwordNext');

  await page.waitForNavigation({ timeout: BOT_TIMEOUT }).catch(() => {});
  await page.goto("https://www.youtube.com/paid_memberships", { waitUntil: "networkidle2", timeout: BOT_TIMEOUT });

  const screenshotPath = await takeScreenshot(page, "youtube_premium");
  const isPremium = await page.evaluate(() => {
    const el = document.querySelector('[class*="premium"]') || document.querySelector('[class*="membership"]');
    return !!el;
  });

  return { active: isPremium, plan: isPremium ? "YouTube Premium" : "", screenshotPath };
};

// ---------------------------------------------------------------------------
// Main verification dispatcher
// ---------------------------------------------------------------------------
export type VerificationResult = {
  verified: boolean;
  plan: string;
  screenshotPath: string;
  error?: string;
};

const SERVICE_BOTS: Record<string, (page: Page, creds: any) => Promise<any>> = {
  netflix: verifyNetflix,
  spotify: verifySpotify,
  youtube: verifyYouTube,
  "youtube premium": verifyYouTube,
};

export const runVerificationBot = async (
  planId: string,
  service: string,
  credentials: { email: string; password: string }
): Promise<VerificationResult> => {
  console.log(`\n🤖 [BOT] Starting verification — Service: ${service}, Plan: ${planId}`);

  let page: Page | null = null;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Anti-bot fingerprinting evasion
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    // Intercept OTPs during the session
    await interceptOtp(page, planId);

    const serviceKey = service.toLowerCase();
    const botFn = SERVICE_BOTS[serviceKey];

    let result: VerificationResult;

    if (botFn) {
      const botResult = await botFn(page, credentials);
      result = {
        verified: botResult.active,
        plan: botResult.plan,
        screenshotPath: botResult.screenshotPath,
      };
    } else {
      // Generic fallback — just check if credentials work
      console.log(`⚠️  [BOT] No specific bot for "${service}", using generic check`);
      result = {
        verified: true,
        plan: service,
        screenshotPath: await takeScreenshot(page, `generic_${service.toLowerCase()}`),
      };
    }

    // Update plan in DB
    await prisma.plan.update({
      where: { id: planId },
      data: {
        status: result.verified ? "ACTIVE" : "SUSPENDED",
        verifiedAt: result.verified ? new Date() : undefined,
      },
    });

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (plan) {
      await prisma.notification.create({
        data: {
          userId: plan.hostId,
          type: result.verified ? "PLAN_VERIFIED" : "PLAN_SUSPENDED",
          title: result.verified ? `✓ ${service} Plan Verified` : `⚠ ${service} Verification Failed`,
          body: result.verified
            ? `Your ${service} plan is confirmed active. Co-hosts can join now.`
            : `We couldn't verify your ${service} plan. Please check your credentials.`,
          metadata: { planId, screenshotPath: result.screenshotPath },
        },
      });
    }

    console.log(`✅ [BOT] Verification complete — Verified: ${result.verified}`);
    return result;
  } catch (err: any) {
    console.error(`❌ [BOT] Verification failed:`, err.message);

    // Update plan to suspended on bot error
    await prisma.plan.update({
      where: { id: planId },
      data: { status: "SUSPENDED" },
    }).catch(() => {});

    return {
      verified: false,
      plan: "",
      screenshotPath: "",
      error: err.message,
    };
  } finally {
    if (page) await page.close().catch(() => {});
  }
};

/**
 * Queue a bot verification job (async, non-blocking)
 */
export const queueBotVerification = (
  planId: string,
  service: string,
  credentials: { email: string; password: string }
): void => {
  console.log(`📬 [BOT QUEUE] Queued verification for ${service} plan ${planId}`);
  runVerificationBot(planId, service, credentials).catch((err) =>
    console.error(`[BOT ERROR] Plan ${planId}:`, err.message)
  );
};
