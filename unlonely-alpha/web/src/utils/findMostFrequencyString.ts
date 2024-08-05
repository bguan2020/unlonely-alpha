export function findMostFrequentString(strings: string[]): string | null {
    const countMap: Map<string, number> = new Map();
  
    // Count the occurrences of each string
    for (const str of strings) {
      if (countMap.has(str)) {
        countMap.set(str, (countMap.get(str) as number) + 1);
      } else {
        countMap.set(str, 1);
      }
    }
  
    // Find the string with the highest count
    let mostFrequentString: string | null = null;
    let maxCount = 0;
  
    for (const [str, count] of countMap.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentString = str;
      }
    }
  
    return mostFrequentString;
  }