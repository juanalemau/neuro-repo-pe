function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

export function globToRegex(glob) {
  let source = "";

  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index];
    const next = glob[index + 1];

    if (char === "*" && next === "*") {
      source += ".*";
      index += 1;
    } else if (char === "*") {
      source += "[^/]*";
    } else if (char === "?") {
      source += "[^/]";
    } else {
      source += escapeRegex(char);
    }
  }

  return new RegExp(`^${source}(?:/.*)?$`);
}

export function matchesAny(file, patterns) {
  return patterns.some((pattern) => globToRegex(normalizePattern(pattern)).test(file));
}

function normalizePattern(pattern) {
  return pattern.replace(/^\.\//, "").replace(/\/$/, "");
}
