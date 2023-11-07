import config from "./config"

export const callFunction = async (): Promise<void> => {
    const endpoint = config.functions.testFunction;

    const response = await fetch(endpoint);
    const data = await response.json();
    console.log(data);
}
