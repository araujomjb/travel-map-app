// We use the REST Countries API to get real-time data about countries
const BASE_URL = 'https://restcountries.com/v3.1';

// Typical drinks and animals often require a custom mapping as they aren't in standard APIs
const extraFacts = {
  "PRT": { drink: "Port Wine / Ginjinha", animals: "Iberian Lynx, Wolf" },
  "ESP": { drink: "Sangria / Sherry", animals: "Iberian Lynx, Brown Bear" },
  "FRA": { drink: "Wine / Champagne", animals: "Alpine Ibex, Chamois" },
  "ITA": { drink: "Grappa / Limoncello", animals: "Italian Wolf, Marsican Brown Bear" },
  "BRA": { drink: "Cachaça (Caipirinha)", animals: "Jaguar, Capybara, Toucan" },
  "USA": { drink: "Bourbon / Craft Beer", animals: "Bald Eagle, Grizzly Bear" },
  "GBR": { drink: "Gin / Scotch Whisky", animals: "Red Deer, European Badger" },
  "DEU": { drink: "Beer / Riesling", animals: "Red Fox, Roe Deer" },
  "JPN": { drink: "Sake / Shochu", animals: "Snow Monkey, Tanuki" },
  "AUS": { drink: "Shiraz / Bundaberg Rum", animals: "Kangaroo, Koala" },
  "CAN": { drink: "Ice Wine / Caesar", animals: "Moose, Polar Bear" },
  "MEX": { drink: "Tequila / Mezcal", animals: "Jaguar, Axolotl" },
  "ZAF": { drink: "Amarula / Pinotage", animals: "Lion, Elephant, Rhinoceros" },
  "IND": { drink: "Feni / Toddy", animals: "Bengal Tiger, Indian Elephant" },
  "CHN": { drink: "Baijiu / Tsingtao Beer", animals: "Giant Panda, Red Panda" }
};

export const fetchCountryData = async (id, name) => {
  try {
    // We try to fetch by the ISO code (id) first as it's most reliable
    let response = await fetch(`${BASE_URL}/alpha/${id}`);
    
    // If that fails, try searching by name
    if (!response.ok) {
      response = await fetch(`${BASE_URL}/name/${name}?fullText=true`);
    }

    if (!response.ok) throw new Error('Country not found');

    const data = await response.json();
    const country = data[0];

    return {
      capital: country.capitals ? country.capitals[0] : (country.capital ? country.capital[0] : "N/A"),
      drink: extraFacts[id]?.drink || "Local Specialty",
      animals: extraFacts[id]?.animals || "Local Wildlife",
      flag: country.flags.svg,
      population: country.population.toLocaleString(),
      region: country.subregion || country.region
    };
  } catch (error) {
    console.error("Error fetching country data:", error);
    return {
      capital: "Unknown",
      drink: "Local Specialty",
      animals: "Local Wildlife",
      flag: null,
      population: "Unknown",
      region: "Global"
    };
  }
};
