const { listStaleIncompleteLaunches, recoverStaleIncompleteLaunches } =
  await import("../src/lib/generate-queries.ts");
if (process.argv.includes("--apply")) {
  const count = await recoverStaleIncompleteLaunches();
  console.log(`Recovered ${count} stale shoots with missing provider jobs.`);
} else {
  const pending = await listStaleIncompleteLaunches();
  console.log(`${pending.length} stale shoots have missing provider jobs. No changes made.`);
}
