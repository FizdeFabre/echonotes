export const ensureUtcISOString = (input: string | Date): string => {
  const date =
    typeof input === "string"
      ? new Date(input.endsWith("Z") ? input : input + "Z")
      : input;
  return date.toISOString();
};