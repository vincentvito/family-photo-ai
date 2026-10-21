const [major, minor, patch] = process.versions.node.split(".").map(Number);

if (major !== 24 || minor < 22 || (minor === 22 && patch < 1)) {
  throw new Error(
    `Node.js ${process.versions.node} is not supported. Use Node.js 24.22.1 or a newer 24.x release with the October 2026 security fixes.`,
  );
}

console.log(`Security runtime check passed: Node.js ${process.versions.node}`);
