export const jp = (body: string) => {
    try {
        return JSON.parse(body);
    } catch (e) {
        console.log("Error parsing JSON", e);
        return {};
    }
}