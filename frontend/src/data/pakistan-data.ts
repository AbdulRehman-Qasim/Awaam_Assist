export const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Jammu & Kashmir",
  "Gilgit-Baltistan",
];

export const PAKISTAN_CITIES: Record<string, string[]> = {
  Punjab: [
    "Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Sialkot", 
    "Bahawalpur", "Sargodha", "Sahiwal", "Okara", "Gujrat", "Jhelum", 
    "Sheikhupura", "Rahim Yar Khan", "Kasur", "Dera Ghazi Khan", "Chiniot", "Hafizabad"
  ],
  Sindh: [
    "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas", 
    "Jacobabad", "Shikarpur", "Khairpur", "Thatta", "Badin", "Ghotki"
  ],
  "Khyber Pakhtunkhwa": [
    "Peshawar", "Mardan", "Mingora", "Abbottabad", "Kohat", "Dera Ismail Khan", 
    "Swabi", "Nowshera", "Mansehra", "Charsadda"
  ],
  Balochistan: [
    "Quetta", "Turbat", "Khuzdar", "Hub", "Chaman", "Gwadar", "Sibi", "Zhob"
  ],
  "Islamabad Capital Territory": [
    "Islamabad"
  ],
  "Azad Jammu & Kashmir": [
    "Muzaffarabad", "Mirpur", "Rawalakot", "Kotli", "Bhimber"
  ],
  "Gilgit-Baltistan": [
    "Gilgit", "Skardu", "Chilas", "Gahkuch"
  ],
};

export const ALL_CITIES = Object.values(PAKISTAN_CITIES).flat().sort();
