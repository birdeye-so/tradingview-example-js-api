export const BE_API_KEY = 'your_api_key';

// Make requests to Birdeye API
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
    throw new Error(`Birdeye request error: ${error.status}`);
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

export const SUBSCRIPT_NUMBER_MAP = {
  4: "₄",
  5: "₅",
  6: "₆",
  7: "₇",
  8: "₈",
  9: "₉",
  10: "₁₀",
  11: "₁₁",
  12: "₁₂",
  13: "₁₃",
  14: "₁₄",
  15: "₁₅",
};

export const calcPricePrecision = (num) => {
  if (!num) return 8;

  switch (true) {
    case Math.abs(+num) < 0.00000000001:
      return 16;

    case Math.abs(+num) < 0.000000001:
      return 14;

    case Math.abs(+num) < 0.0000001:
      return 12;

    case Math.abs(+num) < 0.00001:
      return 10;

    case Math.abs(+num) < 0.05:
      return 6;

    case Math.abs(+num) < 1:
      return 4;

    case Math.abs(+num) < 20:
      return 3;

    default:
      return 2;
  }
};

export const formatPrice = (num, precision, gr0 = true) => {
  if (!num) {
    return num;
  }

  if (!precision) {
    precision = calcPricePrecision(+num);
  }

  let formated = new BigNumber(num).toFormat(precision);

  if (formated.match(/^0\.[0]+$/g)) {
    formated = formated.replace(/\.[0]+$/g, "");
  }

  if (gr0 && formated.match(/\.0{4,15}[1-9]+/g)) {
    const match = formated.match(/\.0{4,15}/g);
    const matchString = match[0].slice(1);
    formated = formated.replace(
      /\.0{4,15}/g,
      `.0${SUBSCRIPT_NUMBER_MAP[matchString.length]}`,
    );
  }

  return formated;
};