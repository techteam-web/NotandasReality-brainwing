/* One entry per ROW, set exactly as the row reads — the rows are the design
   (Playfair Display, centred, see BuildingPage), so they never wrap and the
   list is never re-flowed into a box. "|" separates two items on a row; a row
   never starts or ends with one. */
export const BUILDING_AMINITIES = {
  "notan-dc": {
    1: "Lobby & Reception | Rooftop Pool & Jacuzzi",
    2: "Rooftop Cabana & Sunset Deck | Rooftop Bar",
    3: "Fully Equipped Fitness Centre | Business Centre",
  },

  "notan-space": {
    1: "Grand Lobby with Reception and Lounge | Cafe and Lounge",
    2: "Decks & Break-Out Zones | Column-Less Floor Plates",
    3: "Dedicated Pantry and Washroom | Car Parking Tower",
    4: "3 High-Speed Elevators & Service Elevator",
  },

  "notan-jewel": {
    1: "Signature Lobby Lounge | Dedicated Reception Desks",
    2: "Intelligent Car Tower Parking | 3 High-Speed Elevators",
    3: "Refuge Zones & Double-Height Deck",
  },

  "notan-terrace": {
    1: "24-Hour Security & Surveillance | Outdoor Leisure Decks",
    2: "Coffee Lounge & Bar | Fitness Centre | Spa & Wellness",
    3: "Hospitality & Concierge Services | Open to Sky Pool",
    4: "6-Metre-Wide Access Ramp | Basement Parking",
    5: "High-Speed Elevators & Service Lift",
  },

  "notan-edge": {
    1: "Double-Glazed Façade System | Large Columnless Floor Plate",
    2: "Premium Security & Management | Curated F&B Spaces",
    3: "Double-Height Entrance Lobby | Flexible Workspaces",
    4: "State-of-the-Art Parking & Car Lift Access",
    5: "Energy Efficiency | High-Speed Elevators",
  },

  "notan-views": {
    1: "Outdoor Leisure Decks & Gazebos | Landscaped Green Pockets",
    2: "Multi-Purpose Banquet & Lounge | Grand Arrival Lobby",
    3: "State-of-the-Art Fitness Centre | Podium-Level Parking",
    4: "Open-to-Sky Walking Track | Dedicated Staff Facilities",
    5: "Hospitality & Concierge Services | 24-Hour Security",
    6: "High-Speed Elevators & Service Lift",
  },

  "notan-lands-end": {
    1: "Fully Equipped Fitness Centre | Salon & Spa Therapy Rooms",
    2: "Banquet & Private Dining Hall | Private Theatre & Lounge",
    3: "Rooftop Terrace with Panoramic Views | Pickleball Court",
    4: "Members’ Bar | Business Lounge & Conference Suite",
    5: "Temperature-Controlled Rooftop Pool & Jacuzzi",
    6: "Rooftop Sky Lounge & Bar | Library Café",
    7: "Hospitality-Led Concierge Services",
  },

  "notan-beach-house": {
    1: "Open-to-Sky Pool & Leisure Deck | Salon & Wellness Services",
    2: "Landscaped Garden with Beach Access | 24-Hour Security",
    3: "Grand Lobby & Reception | Fully Equipped Fitness Centre",
    4: "Dedicated Staff Facilities | Car Lift & Basement Parking",
    5: "High-Speed Elevators & Dedicated Service Lift",
    6: "Hospitality & Concierge Services",
  },

  "notan-tides": {
    1: "Rooftop Half-Olympic Infinity Pool with Panoramic Views",
    2: "Sea-Facing Sit-Outs & Landscaped Terrace | Mini Theater",
    3: "Rooftop Jogging Track | Entertainment Lounge",
    4: "Bespoke Fitness Centre and Wellness Services",
    5: "Grand Double-Height Lobby | Coffee Lounge",
    6: "Private Concierge & Valet Services",
    7: "2-Way Ramp Parking Access",
  },

  /* Crown's list is not settled yet. Its mark stands on its own placement
     while this is empty (headerClass in buildingViewsData.js puts it in the
     sky at the top left, the same spot the list's placement puts it), so
     uncommenting these puts them underneath it without anything moving. */
  "notan-crown": {
    // 1: "Signature Grand Entrance Lobby | 24-Hour Security & Surveillance",
    // 2: "Dedicated Concierge Services | High-Speed Elevators",
    // 3: "Podium & Basement Parking | Landscaped Sit-Outs",
  },
};
