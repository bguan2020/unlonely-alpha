const swears = [
    "nigger",
    "nigga",
    "negro",
    "coon",
    "kike",
    "cunt",
    "slut",
    "faggot",
    "retard"
]

export const containsSwears = (sentence: string) => {
    return swears.some((swear) => {
        const regex = new RegExp(`\\b${swear}\\b`, "i"); // Use word boundaries to detect whole words
        return regex.test(sentence); // Return true if the word is found
      });
}