export const BUILDING_AMINITIES = {
  "notan-dc": {
    1: "Lobby & Reception | Rooftop Pool & Jacuzzi |",
    2: "Rooftop Cabana & Sunset Deck | Rooftop Bar |",
    3: "Fully Equipped Fitness Centre | Business Centre ",
  },

  "notan-space": {
    1: "Grand Lobby with Reception and Lounge | Ground-Floor Café and Lounge |",
    2: "Private Pantry and Washroom in Every Unit |",
    3: "3 High-Speed Elevators | Separate Service/Fire Elevator ",
  },

  "notan-jewel": {
    1: "Signature Lobby Lounge | Dedicated Reception Desks |",
    2: "Intelligent Car Tower Parking | 3 High-Speed Elevators |",
    3: "Refuge Zones & Double-Height Deck ",
  },

  "notan-terrace": {
    1: "24-Hour Security & Surveillance | 6-Metre-Wide Access Ramp | Outdoor Leisure Decks |",
    2: "Hospitality & Concierge Services | Basement Parking | High-Speed Elevators & Service Lift |",
    3: " Coffee Lounge & Bar | Fitness Centre | Spa & Wellness | Open to Sky Pool ",
  },

  "notan-edge": {
    1: "Double-Height Entrance Lobby | State-of-the-Art Parking & Car Lift Access |",
    2: "Flexible Workspaces | Premium Security & Management |",
    3: "Energy Efficiency | High-Speed Elevators | Double-Glazed Façade System | Curated F&B Spaces |",
    4: "Large Columnless Floor Plate ",
  },

  "notan-views": {
    1: "Grand Arrival Lobby | Multi-Purpose Hall | Banquet Lounge | Secure Podium-Level Parking |",
    2: "24-Hour Security & Surveillance | Hospitality & Concierge Services | High-Speed Elevators & Service Lift |",
    3: "State-of-the-Art Fitness Centre | Landscaped Green Pockets with Water Features |",
    4: "Outdoor Leisure Decks & Gazebos | Dedicated Staff Facilities | Open-to-Sky Rooftop Walking Track ",
  },

  "notan-lands-end": {
    1: "Private Theatre & Lounge | Members’ Bar | Banquet & Private Dining Hall |",
    2: "Rooftop Terrace with Panoramic Views | Rooftop Sky Lounge & Bar | Business Lounge & Conference Suite |",
    3: "Fully Equipped Fitness Centre | Salon & Spa Therapy Rooms | Temperature-Controlled Rooftop Pool & Jacuzzi |",
    4: "Library Café | Pickleball Court | Hospitality-Led Concierge Services ",
  },

  "notan-beach-house": {
    1: "Grand Double-Height Lobby & Reception | Landscaped Garden with Beach Access | Open to Sky Pool |",
    2: "Rooftop Leisure Decks | Salon & Wellness Services | Fully Equipped Fitness Centre |",
    3: "24-Hour Security & Surveillance | Hospitality & Concierge Services | Car Lift with Basement Parking |",
    4: "High-Speed Passenger Elevators & Dedicated Service Lift | Dedicated Staff Facilities ",
  },

  "notan-tides": {
    1: "Owner’s Lounge | Rooftop 25-Meter Half-Olympic Infinity Pool with Panoramic Views |",
    2: "Jogging Track Encircling the Skyline | Bespoke Fitness Centre and Wellness Deck |",
    3: "Private Concierge & Valet Services | Grand Double-Height Lobby | 2-Way Ramp Parking Access |",
    4: "Sea-Facing Sit-Outs & Landscaped Terraces ",
  },

  /* Crown's list is not settled yet. Its mark stands on its own placement
     while this is empty (headerClass in buildingViewsData.js puts it in the
     sky at the top left, the same spot the list's placement puts it), so
     uncommenting these puts them underneath it without anything moving. */
  "notan-crown": {
    // 1: "Signature Grand Entrance Lobby | 24-Hour Security & Surveillance |",
    // 2: "Dedicated Concierge Services | High-Speed Elevators |",
    // 3: "Podium & Basement Parking | Landscaped Sit-Outs |",
  },
};

/* Rows set by hand for an iPad held across (the `ipad` variant in index.css,
   2752×2064), for projects whose rows above cannot fit the sky that crop
   leaves. Same items, same "|" convention; BuildingPage shows these instead
   of the rows above at that shape only, and never lets one of them wrap.

   Beach House: the sky right of the tower is 1156–1680, and each row above
   is 590–715px wide, so they wrapped into nine rows of 172–408px — one item
   on some, two on others. In the original order no grouping comes out even
   (the long elevators item always strands "Dedicated Staff Facilities" on a
   row of its own), so two items trade places: Pool with Garden, and Staff
   with the elevators. Six rows of 351–418px at 15px. */
export const BUILDING_AMINITIES_IPAD = {
  "notan-beach-house": {
    1: "Grand Double-Height Lobby & Reception | Open to Sky Pool |",
    2: "Landscaped Garden with Beach Access | Rooftop Leisure Decks |",
    3: "Salon & Wellness Services | Fully Equipped Fitness Centre |",
    4: "24-Hour Security & Surveillance | Hospitality & Concierge Services |",
    5: "Car Lift with Basement Parking | Dedicated Staff Facilities |",
    6: "High-Speed Passenger Elevators & Dedicated Service Lift",
  },
};
