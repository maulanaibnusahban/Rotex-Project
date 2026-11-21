import { isIP } from "node:net";
import { headers } from "next/headers";
import { database } from "@/src/lib/db";
import { hashToken } from "./credentials.mjs";

export const authRateLimitWindowMinutes = 10;
const windowMs = authRateLimitWindowMinutes * 60 * 1000;

export async function acceptAuthAttempt(action: string, identifier?: string) {
  const header = process.env.AUTH_CLIENT_IP_HEADER;
  const ip = header ? (await headers()).get(header)?.trim() : undefined;
  const now = new Date();
  const ends = new Date(now.getTime() + windowMs);

  async function increment(scope: string, limit: number) {
    const key = hashToken(`${action}:${scope}`);
    return database().$transaction(async (tx) => {
      // Baris tetap terkunci hingga penghitung dibaca dalam transaksi ini.
      await tx.$executeRaw`
        INSERT INTO \`AuthRateLimit\` (\`key\`, attempts, windowEnds)
        VALUES (${key}, 1, ${ends})
        ON DUPLICATE KEY UPDATE
          attempts = IF(windowEnds <= ${now}, 1, LEAST(attempts + 1, ${limit + 1})),
          windowEnds = IF(windowEnds <= ${now}, ${ends}, windowEnds)
      `;
      const { attempts } = await tx.authRateLimit.findUniqueOrThrow({ where: { key }, select: { attempts: true } });
      return attempts <= limit;
    });
  }

  if (!(await increment(ip && isIP(ip) ? `ip:${ip}` : "shared", ip && isIP(ip) ? 30 : 120))) {
    return false;
  }

  return identifier === undefined || increment(`account:${identifier}`, 10);
}
