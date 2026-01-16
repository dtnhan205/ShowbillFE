/**
 * Shortens a MongoDB ObjectId to 12 characters (half of the full 24-char ID)
 * @param id - Full MongoDB ObjectId (24 characters)
 * @returns Shortened ID (12 characters)
 */
export const shortenId = (id: string): string => {
  if (!id || id.length !== 24) return id;
  return id.substring(0, 12);
};

/**
 * Checks if an ID is already shortened (less than 24 characters)
 * @param id - ID to check
 * @returns true if ID is shortened
 */
export const isShortenedId = (id: string): boolean => {
  return id.length < 24;
};

