import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const BASE_URL = 'https://restcountries.com/v3.1';

const extraFacts = {
  "PRT": { drink: "Port Wine / Ginjinha", animals: "Iberian Lynx, Wolf" },
  "ESP": { drink: "Sangria / Sherry", animals: "Iberian Lynx, Brown Bear" },
  "FRA": { drink: "Wine / Champagne", animals: "Alpine Ibex, Chamois" },
  "ITA": { drink: "Grappa / Limoncello", animals: "Italian Wolf, Alpine Marmot" },
  "DEU": { drink: "Beer / Riesling", animals: "Red Fox, Roe Deer" },
  "GBR": { drink: "Gin / Scotch Whisky", animals: "Red Deer, European Badger" },
  "IRL": { drink: "Guinness / Whiskey", animals: "Red Fox, Pine Marten" },
  "NLD": { drink: "Jenever / Heineken", animals: "Red Deer, Harbor Seal" },
  "BEL": { drink: "Trappist Beer", animals: "Wild Boar, Red Fox" },
  "CHE": { drink: "Absinthe / Rivella", animals: "Steinbock, Chamois" },
  "AUT": { drink: "Schnapps / Almdudler", animals: "Golden Eagle, Alpine Marmot" },
  "GRC": { drink: "Ouzo / Retsina", animals: "Loggerhead Turtle, Monk Seal" },
  "PRY": { drink: "Tereré", animals: "Jaguar, Giant Anteater" },
  "RUS": { drink: "Vodka / Kvass", animals: "Siberian Tiger, Brown Bear" },
  "SWE": { drink: "Akvavit", animals: "Moose, Reindeer" },
  "NOR": { drink: "Aquavit", animals: "Polar Bear (Svalbard), Reindeer" },
  "FIN": { drink: "Koskenkorva / Lonkero", animals: "Saimaa Ringed Seal, Brown Bear" },
  "ISL": { drink: "Brennivín", animals: "Arctic Fox, Puffin" },
  "POL": { drink: "Wódka / Mead", animals: "European Bison, White Eagle" },
  "CZE": { drink: "Pilsner Beer / Becherovka", animals: "Red Deer, Wild Boar" },
  "HUN": { drink: "Pálinka / Tokaji", animals: "Grey Cattle, Racka Sheep" },
  "ROU": { drink: "Țuică", animals: "Brown Bear, Carpathian Lynx" },
  "HRV": { drink: "Rakija / Pelinkovac", animals: "Brown Bear, Gray Wolf" },
  "TUR": { drink: "Rakı / Ayran", animals: "Anatolian Leopard, Caretta Caretta" },
  "USA": { drink: "Bourbon / Craft Beer", animals: "Bald Eagle, Grizzly Bear, Bison" },
  "CAN": { drink: "Ice Wine / Caesar", animals: "Moose, Polar Bear, Beaver" },
  "MEX": { drink: "Tequila / Mezcal", animals: "Jaguar, Axolotl, Golden Eagle" },
  "BRA": { drink: "Cachaça (Caipirinha)", animals: "Jaguar, Capybara, Toucan" },
  "ARG": { drink: "Fernet / Malbec Wine", animals: "Jaguar, Puma, Andean Condor" },
  "CHL": { drink: "Pisco / Carménère", animals: "Puma, Huemul Deer" },
  "COL": { drink: "Aguardiente / Coffee", animals: "Andean Condor, Spectacled Bear" },
  "PER": { drink: "Pisco Sour", animals: "Llama, Alpaca, Andean Condor" },
  "CUB": { drink: "Rum (Mojito / Daiquiri)", animals: "Cuban Crocodile, Bee Hummingbird" },
  "JAM": { drink: "Rum", animals: "Doctor Bird, Jamaican Boa" },
  "JPN": { drink: "Sake / Shochu", animals: "Snow Monkey, Tanuki, Sika Deer" },
  "CHN": { drink: "Baijiu / Tsingtao Beer", animals: "Giant Panda, Red Panda" },
  "KOR": { drink: "Soju / Makgeolli", animals: "Korean Tiger (in lore), Red-crowned Crane" },
  "IND": { drink: "Feni / Toddy", animals: "Bengal Tiger, Indian Elephant" },
  "THA": { drink: "Thai Tea / SangSom", animals: "Elephants, Clouded Leopard" },
  "VNM": { drink: "Rice Wine / Bia Hoi", animals: "Saola, Water Buffalo" },
  "IDN": { drink: "Arak / Kopi Luwak", animals: "Komodo Dragon, Orangutan" },
  "PHL": { drink: "Lambanog / San Miguel", animals: "Philippine Eagle, Tarsier" },
  "AUS": { drink: "Shiraz / Bundaberg Rum", animals: "Kangaroo, Koala, Platypus" },
  "NZL": { drink: "Sauvignon Blanc / L&P", animals: "Kiwi Bird, Tuatara" },
  "ZAF": { drink: "Amarula / Pinotage", animals: "Lion, Elephant, Rhinoceros" },
  "EGY": { drink: "Karkade / Arak", animals: "Nile Crocodile, Dorcas Gazelle" },
  "MAR": { drink: "Mint Tea", animals: "Barbary Macaque, Fennec Fox" },
  "KEN": { drink: "Dawa / Tusker Beer", animals: "Lion, Cheetah, Masai Giraffe" },
  "ETH": { drink: "Tej (Honey Wine)", animals: "Gelada Baboon, Ethiopian Wolf" },
  "NGA": { drink: "Palm Wine", animals: "Cross River Gorilla, Lion" },
  "ISR": { drink: "Arak", animals: "Nubian Ibex, Arabian Oryx" },
  "ARE": { drink: "Arabic Coffee", animals: "Arabian Oryx, Falcon" },
  "SAU": { drink: "Arabic Coffee / Sobia", animals: "Arabian Leopard, Oryx" }
};

export const fetchCountryData = async (id, name) => {
  try {
    let response = await fetch(`${BASE_URL}/alpha/${id}`);
    
    if (!response.ok) {
      response = await fetch(`${BASE_URL}/name/${name}?fullText=true`);
    }

    if (!response.ok) throw new Error('Country not found');

    const data = await response.json();
    const country = data[0];
    const cca3 = country.cca3;

    // Fetch popularity from Firestore
    const globalRef = doc(db, 'global', 'stats');
    const globalSnap = await getDoc(globalRef);
    let popularity = 0;
    if (globalSnap.exists()) {
      popularity = globalSnap.data().popularity?.[id] || globalSnap.data().popularity?.[cca3] || 0;
    }

    return {
      capital: country.capitals ? country.capitals[0] : (country.capital ? country.capital[0] : "N/A"),
      drink: extraFacts[cca3]?.drink || "Local Specialty",
      animals: extraFacts[cca3]?.animals || "Local Wildlife",
      flag: country.flags.svg,
      population: country.population.toLocaleString(),
      region: country.subregion || country.region,
      popularity: popularity
    };
  } catch (error) {
    console.error("Error fetching country data:", error);
    return {
      capital: "Unknown",
      drink: "Local Specialty",
      animals: "Local Wildlife",
      flag: null,
      population: "Unknown",
      region: "Global",
      popularity: 0
    };
  }
};
