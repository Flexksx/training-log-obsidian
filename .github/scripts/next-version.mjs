const version = process.argv[2];
if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version ?? "")) {
  throw new Error("Expected a version in the form x.y.z");
}

const [major, minor, patch] = version.split(".");
console.log(`${major}.${minor}.${BigInt(patch) + 1n}`);
