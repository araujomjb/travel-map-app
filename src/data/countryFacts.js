export const countryFacts = {
  "PRT": {
    capital: "Lisbon",
    drink: "Port Wine / Ginjinha",
    animals: "Iberian Lynx, Wolf, Flamingo"
  },
  "ESP": {
    capital: "Madrid",
    drink: "Sangria / Sherry",
    animals: "Iberian Lynx, Brown Bear, Spanish Imperial Eagle"
  },
  "FRA": {
    capital: "Paris",
    drink: "Wine / Champagne",
    animals: "Alpine Ibex, Chamois, Wild Boar"
  },
  "ITA": {
    capital: "Rome",
    drink: "Grappa / Limoncello",
    animals: "Italian Wolf, Marsican Brown Bear, Alpine Marmot"
  },
  "BRA": {
    capital: "Brasília",
    drink: "Cachaça (Caipirinha)",
    animals: "Jaguar, Capybara, Toucan"
  },
  "USA": {
    capital: "Washington, D.C.",
    drink: "Bourbon / Craft Beer",
    animals: "Bald Eagle, Grizzly Bear, Bison"
  },
  "GBR": {
    capital: "London",
    drink: "Gin / Scotch Whisky",
    animals: "Red Deer, European Badger, Red Fox"
  },
  "DEU": {
    capital: "Berlin",
    drink: "Beer / Riesling",
    animals: "Red Fox, European Hamster, Roe Deer"
  },
  "JPN": {
    capital: "Tokyo",
    drink: "Sake / Shochu",
    animals: "Japanese Macaque (Snow Monkey), Tanuki, Sika Deer"
  },
  "AUS": {
    capital: "Canberra",
    drink: "Shiraz / Bundaberg Rum",
    animals: "Kangaroo, Koala, Platypus"
  },
  "CAN": {
    capital: "Ottawa",
    drink: "Ice Wine / Caesar",
    animals: "Moose, Polar Bear, Beaver"
  },
  "MEX": {
    capital: "Mexico City",
    drink: "Tequila / Mezcal",
    animals: "Jaguar, Axolotl, Golden Eagle"
  },
  "ZAF": {
    capital: "Pretoria",
    drink: "Amarula / Pinotage",
    animals: "Lion, Elephant, Rhinoceros"
  },
  "IND": {
    capital: "New Delhi",
    drink: "Feni / Toddy",
    animals: "Bengal Tiger, Indian Elephant, Indian Peafowl"
  },
  "CHN": {
    capital: "Beijing",
    drink: "Baijiu / Tsingtao Beer",
    animals: "Giant Panda, Golden Snub-nosed Monkey, Red Panda"
  }
};

export const getCountryFacts = (id, name) => {
  // Try ID first, then fallback to name matching
  if (countryFacts[id]) return countryFacts[id];
  
  const foundByName = Object.entries(countryFacts).find(([key, val]) => 
    name.toLowerCase().includes(val.capital.toLowerCase()) || // Very loose check
    name.toLowerCase() === key.toLowerCase()
  );
  
  return foundByName ? foundByName[1] : {
    capital: "Discovering...",
    drink: "Local Specialty",
    animals: "Local Wildlife"
  };
};
