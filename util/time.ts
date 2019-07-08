export const ONE_SECOND = 1000;

export async function sleep(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
}
