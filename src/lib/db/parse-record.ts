export function parseRecord(record: Record<string, unknown>, stringifiedKeys: string[]) {
  const parsedRecord = { ...record } as any;
  for (const key of stringifiedKeys) {
    if (!(key in record)) continue;
    const value = record[key];
    const parsedValue = JSON.parse(value?.toString() || "{}");
    parsedRecord[key] = parsedValue;
  }
  return parsedRecord;
}
