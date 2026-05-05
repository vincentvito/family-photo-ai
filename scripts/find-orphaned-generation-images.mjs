/**
 * Find R2 objects under generations/ that are not referenced by db.images.
 *
 * Dry run:
 *   node scripts/find-orphaned-generation-images.mjs
 *
 * Delete orphaned objects:
 *   node scripts/find-orphaned-generation-images.mjs --delete
 *
 * Optional flags:
 *   --prefix=generations/<generationId>/
 *   --json
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DeleteObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

loadDotEnv(path.join(root, ".env"));

const args = new Set(process.argv.slice(2).filter((arg) => !arg.startsWith("--prefix=")));
const prefixArg = process.argv.slice(2).find((arg) => arg.startsWith("--prefix="));
const deleteMode = args.has("--delete");
const jsonMode = args.has("--json");
const prefix = prefixArg?.slice("--prefix=".length) || "generations/";

if (!prefix.startsWith("generations/")) {
  throw new Error(`Refusing to scan outside generations/: ${prefix}`);
}

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DIRECT_URL or DATABASE_URL is required");

const sql = postgres(databaseUrl, { max: 1, prepare: false });

try {
  const rows = await sql`
    select generation_id as "generationId", file_name as "fileName"
    from familyphotoai.images
  `;

  const referencedKeys = new Set(
    rows.map((row) => `generations/${row.generationId}/${row.fileName}`),
  );
  const storedKeys = await listStoredKeys(prefix);
  const imageKeys = storedKeys.filter(isGenerationImageKey);
  const orphanedKeys = imageKeys.filter((key) => !referencedKeys.has(key));

  const result = {
    mode: deleteMode ? "delete" : "dry-run",
    prefix,
    storedGenerationImages: imageKeys.length,
    referencedGenerationImages: referencedKeys.size,
    orphanedImages: orphanedKeys.length,
    orphanedKeys,
    deletedKeys: [],
  };

  if (deleteMode) {
    for (const key of orphanedKeys) {
      await deleteStoredImage(key);
      result.deletedKeys.push(key);
    }
  }

  if (jsonMode) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      `${deleteMode ? "Deleted" : "Found"} ${orphanedKeys.length} orphaned generation image${orphanedKeys.length === 1 ? "" : "s"} under ${prefix}`,
    );
    console.log(`Stored image objects: ${imageKeys.length}`);
    console.log(`Referenced DB image objects: ${referencedKeys.size}`);
    if (!deleteMode && orphanedKeys.length > 0) {
      console.log("Dry run only. Re-run with --delete to remove these objects.");
    }
    for (const key of orphanedKeys) console.log(`- ${key}`);
  }
} finally {
  await sql.end();
}

async function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = unquoteEnv(rawValue.trim());
  }
}

function unquoteEnv(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function isGenerationImageKey(key) {
  return /^generations\/[^/]+\/[^/]+\.(jpe?g|png|webp)$/i.test(key);
}

function bucket() {
  const name = process.env.CLOUDFLARE_BUCKET_NAME;
  if (!name) throw new Error("CLOUDFLARE_BUCKET_NAME is required");
  return name;
}

function s3() {
  const endpoint = process.env.CLOUDFLARE_BUCKET_API;
  const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing Cloudflare R2 env: CLOUDFLARE_BUCKET_API, CLOUDFLARE_ACCESS_KEY_ID, CLOUDFLARE_SECRET_ACCESS_KEY",
    );
  }
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

async function listStoredKeys(objectPrefix) {
  const client = s3();
  try {
    const keys = [];
    let token;
    do {
      const list = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket(),
          Prefix: objectPrefix,
          ContinuationToken: token,
        }),
      );
      for (const object of list.Contents ?? []) {
        if (typeof object.Key === "string") keys.push(object.Key);
      }
      token = list.IsTruncated ? list.NextContinuationToken : undefined;
    } while (token);
    return keys;
  } finally {
    client.destroy();
  }
}

async function deleteStoredImage(key) {
  const client = s3();
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
  } finally {
    client.destroy();
  }
}
