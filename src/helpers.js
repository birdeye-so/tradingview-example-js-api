export const BE_API_KEY = 'your_api_key';

// Make requests to CryptoCompare API
export async function makeApiRequest(path) {
	try {
		const response = await fetch(
      `https://public-api.birdeye.so/${path}`,
      {
        headers: {
          "X-API-KEY": BE_API_KEY,
        }
      }
    );
		return response.json();
	} catch (error) {
		throw new Error(`CryptoCompare request error: ${error.status}`);
	}
}

const RESOLUTION_MAPPING = {
  "1": "1m",
  "3": "3m",
  "5": "5m",
  "15": "15m",
  "30": "30m",
  "60": "1H",
  "120": "2H",
  "240": "4H",
  "1D": "1D",
  "1W": "1W",
};

export function parseResolution(resolution) {
  if (!resolution || !RESOLUTION_MAPPING[resolution])
    return RESOLUTION_MAPPING[0];

  return RESOLUTION_MAPPING[resolution];
}

export function getNextBarTime(lastBar, resolution = "1D") {
  if (!lastBar) return;

  const lastCharacter = resolution.slice(-1);
  let nextBarTime;

  switch (true) {
    case lastCharacter === "W":
      nextBarTime = 7 * 24 * 60 * 60 * 1000 + lastBar.time;
      break;

    case lastCharacter === "D":
      nextBarTime = 1 * 24 * 60 * 60 * 1000 + lastBar.time;
      break;

    default:
      nextBarTime = resolution * 60 * 1000 + lastBar.time;
      break;
  }

  return nextBarTime;
}
