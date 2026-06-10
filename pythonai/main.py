from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import re
import requests
import json
from difflib import get_close_matches
from typing import List, Dict

try:
    from transformers import AutoTokenizer, AutoModelForCausalLM
    import torch
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    AutoTokenizer = None
    AutoModelForCausalLM = None
    torch = None
    TRANSFORMERS_AVAILABLE = False

app = FastAPI(title="Awam Assist AI", description="AI Chatbot for Awam Assist Platform")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model configuration - Download and use Hugging Face model
model_name = "TinyLlama/TinyLlama-1.1B-intermediate-step-240k-503b"
use_huggingface = True  # Enable Hugging Face model with TinyLlama

# Database URLs
BACKEND_URL = "https://awaam-assist.onrender.com"

# Global data cache
hospitals_data = []
universities_data = []
schemes_data = []
KNOWN_CITIES = ['multan', 'lahore', 'karachi', 'islamabad', 'peshawar', 'quetta', 'faisalabad', 'rawalpindi', 'gujranwala', 'sialkot']
KNOWN_PROVINCES = {
    'punjab': ['punjab'],
    'sindh': ['sindh'],
    'khyber pakhtunkhwa': ['khyber pakhtunkhwa', 'kpk', 'kp', 'khyber-pakhtunkhwa'],
    'balochistan': ['balochistan'],
    'federal': ['federal', 'islamabad', 'isb'],
    'azad jammu and kashmir': ['azad kashmir', 'azad jammu and kashmir', 'ajk'],
    'gilgit baltistan': ['gilgit baltistan', 'gilgit-baltistan', 'gb']
}
conversation_state: Dict[str, Dict[str, str]] = {}

def _first_value(record: dict, keys: List[str], default: str = "") -> str:
    """Return first non-empty string value from a record by key priority."""
    for key in keys:
        value = record.get(key)
        if value is None:
            continue
        text = str(value).strip()
        if text:
            return text
    return default

def _contains_word(message: str, phrase: str) -> bool:
    """Return True only when phrase appears as a standalone word or phrase."""
    return re.search(rf"\b{re.escape(phrase)}\b", message) is not None

def _contains_alias(message: str, alias: str) -> bool:
    """Match aliases as words, avoiding short aliases like 'it' inside other words."""
    return bool(re.search(rf"\b{re.escape(alias)}\b", message))

def _extract_city(message: str) -> str:
    for city in KNOWN_CITIES:
        if city in message:
            return city
    return ""

def _extract_province(message: str) -> str:
    for province, aliases in KNOWN_PROVINCES.items():
        if any(alias in message for alias in aliases):
            return province
    return ""

def _extract_location_phrase(message: str) -> str:
    match = re.search(r"\b(?:in|at|near|around|of)\s+([a-z\s\-]+)$", message)
    if match:
        location = match.group(1).strip()
        location = re.sub(r"^the\s+", "", location)
        location = re.sub(r"\s+(university|universities|college|colleges)$", "", location).strip()
        return location
    return ""

def _extract_hospital_location(message: str) -> str:
    """Extract any city/area from hospital queries, including cities not in KNOWN_CITIES."""
    normalized = message.lower().strip()
    patterns = [
        r"\b(?:hospitals?|clinics?|medical\s+centers?)\s+(?:in|at|near|around)\s+([a-z\s\-]+)$",
        r"\b(?:in|at|near|around)\s+([a-z\s\-]+)\s+(?:hospitals?|clinics?|medical\s+centers?)$",
        r"\b(?:nearest|nearby)\s+(?:hospitals?|clinics?|medical\s+centers?)\s+(?:in|at|near|around)\s+([a-z\s\-]+)$",
        r"\b(?:find|show|give|get|list)\s+(?:me\s+)?(?:nearest\s+|nearby\s+)?(?:hospitals?|clinics?|medical\s+centers?)\s+(?:in|at|near|around)\s+([a-z\s\-]+)$",
    ]

    for pattern in patterns:
        match = re.search(pattern, normalized, re.IGNORECASE)
        if match:
            location = match.group(1).strip()
            location = re.sub(r"^the\s+", "", location)
            location = re.sub(r"\s+(please|for me)$", "", location).strip()
            return location

    return ""

def _extract_hospital_name(message: str) -> str:
    # Common typo corrections to make intent parsing tolerant (e.g. "hoapital" => "hospital")
    typo_map = {
        r"\bhoapital\b": "hospital",
        r"\bhoapitals\b": "hospitals",
        r"\bhospitall\b": "hospital",
        r"\bhospitol\b": "hospital",
    }

    normalized = message
    for wrong, right in typo_map.items():
        normalized = re.sub(wrong, right, normalized, flags=re.IGNORECASE)

    # Patterns: also accept inputs like "Al Huda treatments" (name before 'treatments')
    patterns = [
        r"\b(?:treatments?|services?|specialties?)\s+(?:in|for|at)\s+(.+)$",
        r"\b(?:about|details?\s+of|info\s+about)\s+(.+)$",
        r"\b(?:hospital)\s+(?:of|in|for|at)\s+(.+)$",
        r"^(.+?)\s+(?:treatments?|services?|specialties?)$",
    ]

    for pattern in patterns:
        match = re.search(pattern, normalized, re.IGNORECASE)
        if match:
            hospital_name = match.group(1).strip()
            hospital_name = re.sub(r"^the\s+", "", hospital_name, flags=re.IGNORECASE)
            hospital_name = re.sub(r"\s+(and\s+)?trusts?$", "", hospital_name, flags=re.IGNORECASE)
            hospital_name = re.sub(r"\s+(hospital|medical\s+center|medical\s+centre)$", "", hospital_name, flags=re.IGNORECASE).strip()
            return hospital_name
    return ""

def _extract_requested_treatment(message: str) -> str:
    """Extract a treatment/specialty from queries like 'X treatment in Y hospital'."""
    patterns = [
        r"\b(?:about|details?\s+of|info\s+about)\s+(.+?)\s+(?:in|at|from)\s+.+\bhospital\b",
        r"^(.+?)\s+(?:in|at|from)\s+.+\bhospital\b",
    ]

    for pattern in patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            treatment = match.group(1).strip()
            treatment = re.sub(r"^(the\s+)?", "", treatment, flags=re.IGNORECASE).strip()
            treatment = re.sub(r"\b(tell me|show me|give me|please)\b", "", treatment, flags=re.IGNORECASE).strip()
            if treatment and treatment not in ["treatment", "treatments", "services", "specialty", "specialties"]:
                return treatment
    return ""

def _extract_audience(message: str) -> str:
    """Detect audience keywords in the user message (students, women, youth, farmers, etc.)."""
    msg = message.lower()
    if any(k in msg for k in ['student', 'students', 'scholarship', 'undergrad', 'undergraduate', 'tuition', 'laptop', 'stipend']):
        return 'students'
    if any(k in msg for k in ['woman', 'women', 'female', 'ladies', 'mother', 'mothers', 'girl', 'girls', 'widow']):
        return 'women'
    if any(k in msg for k in ['youth', 'young', 'kamyab', 'youth loan', 'youth entrepreneurship']):
        return 'youth'
    if any(k in msg for k in ['farmer', 'farmers', 'agriculture', 'kisan']):
        return 'farmers'
    return ''

def _hospital_search_text(hospital: dict) -> str:
    """Build a searchable text blob from common hospital fields."""
    parts = [
        _first_value(hospital, ['Hospital Name', 'hospitalName', 'name', 'City', 'city', 'Tehsil', 'tehsil', 'address', 'description', 'info', 'treatmentSpecialty', 'treatmentName', 'category', 'Cateogry']),
    ]
    tags = hospital.get('tags')
    if isinstance(tags, list):
        parts.extend(str(tag) for tag in tags)
    treatments = hospital.get('treatments')
    if isinstance(treatments, list):
        for treatment in treatments[:5]:
            if isinstance(treatment, dict):
                parts.extend([
                    _first_value(treatment, ['treatmentName', 'specialization', 'name']),
                    _first_value(treatment, ['availability']),
                    _first_value(treatment, ['waitingTime']),
                ])
            else:
                parts.append(str(treatment))
    return " ".join(part.lower() for part in parts if part)

def _university_search_text(university: dict) -> str:
    """Build a searchable text blob from common university fields."""
    parts = [
        _first_value(university, ['title', 'name', 'id', 'city', 'City', 'location', 'province', 'Province', 'discipline', 'program', 'department', 'degree', 'description', 'info']),
    ]
    tags = university.get('tags')
    if isinstance(tags, list):
        parts.extend(str(tag) for tag in tags)
    return " ".join(part.lower() for part in parts if part)


def get_hospital_treatments(hospital_name: str, requested_treatment: str = "") -> str:
    """Return treatment information for the best matching hospital record."""
    hospital_name = hospital_name.lower().strip()
    requested_treatment = requested_treatment.lower().strip()
    if not hospital_name:
        return "Please tell me the hospital name so I can list its treatments."

    normalized_query = re.sub(r"\b(and\s+)?trusts?\b", "", hospital_name, flags=re.IGNORECASE).strip()

    matches = []
    for hospital in hospitals_data:
        if not isinstance(hospital, dict):
            continue

        name = _first_value(hospital, ['Hospital Name', 'hospitalName', 'name']).lower()
        city = _first_value(hospital, ['City', 'city']).lower()
        description = _first_value(hospital, ['description', 'info', 'treatmentSpecialty', 'treatmentName']).lower()
        treatments = hospital.get('treatments') if isinstance(hospital.get('treatments'), list) else []

        haystack = " ".join([name, city, description])
        if normalized_query in haystack or haystack in normalized_query:
            matches.append(hospital)

    if not matches:
        # Try a softer match by looking for partial words in the hospital names
        query_parts = [part for part in re.split(r"\s+", normalized_query) if len(part) > 2]
        for hospital in hospitals_data:
            if not isinstance(hospital, dict):
                continue
            name = _first_value(hospital, ['Hospital Name', 'hospitalName', 'name']).lower()
            if query_parts and all(part in name for part in query_parts[:2]):
                matches.append(hospital)

    if not matches:
        # As a last resort, use fuzzy name matching against known hospital names
        try:
            candidate_names = [ _first_value(h, ['Hospital Name', 'hospitalName', 'name']).lower() for h in hospitals_data if isinstance(h, dict) and _first_value(h, ['Hospital Name', 'hospitalName', 'name']) ]
            fuzzy = get_close_matches(normalized_query, candidate_names, n=5, cutoff=0.6)
            if fuzzy:
                # Return treatments for the top fuzzy match
                top_name = fuzzy[0]
                for hospital in hospitals_data:
                    if _first_value(hospital, ['Hospital Name', 'hospitalName', 'name']).lower() == top_name:
                        matches.append(hospital)
                        break
        except Exception:
            pass

    if not matches:
        return f"I couldn't find a hospital match for '{hospital_name.title()}'. Please try the exact hospital name or a nearby city."

    # Aggregate data across all matched records to avoid missing treatments
    all_treatments = []
    seen_treatment_keys = set()
    cities = set()
    tehsils = set()
    categories = set()
    websites = set()
    specialties = set()
    display_names = []

    for hospital in matches:
        if not isinstance(hospital, dict):
            continue
        name = _first_value(hospital, ['Hospital Name', 'hospitalName', 'name'], 'Unknown Hospital')
        if name and name not in display_names:
            display_names.append(name)
        city_val = _first_value(hospital, ['City', 'city'], '').strip()
        if city_val:
            cities.add(city_val)
        t = _first_value(hospital, ['Tehsil', 'tehsil'], '').strip()
        if t:
            tehsils.add(t)
        categories.add(_first_value(hospital, ['Cateogry', 'category'], 'General').strip())
        web = _first_value(hospital, ['website', 'hospitalWebsite', 'hospitalLink', 'url'], '').strip()
        if web:
            websites.add(web)
        spec = _first_value(hospital, ['treatmentSpecialty', 'treatmentName', 'info'], '').strip()
        if spec:
            specialties.add(spec)

        flat_treatment_name = _first_value(hospital, ['treatmentName', 'treatmentSpecialty', 'info'], '').strip()
        flat_search_text = " ".join([
            flat_treatment_name,
            _first_value(hospital, ['description', 'info'], ''),
            " ".join(str(tag) for tag in hospital.get('tags', []) if tag) if isinstance(hospital.get('tags'), list) else ''
        ]).lower()
        if flat_treatment_name and (not requested_treatment or requested_treatment in flat_search_text or flat_search_text in requested_treatment):
            key = (flat_treatment_name.lower(), str(hospital.get('treatmentCost') or ''))
            if key not in seen_treatment_keys:
                seen_treatment_keys.add(key)
                all_treatments.append({
                    'treatmentName': flat_treatment_name,
                    'treatmentCost': hospital.get('treatmentCost') or '',
                    'availability': _first_value(hospital, ['availability'], ''),
                    'waitingTime': _first_value(hospital, ['waitingTime', 'estimatedWaitTime'], ''),
                    'severitySupport': _first_value(hospital, ['severitySupport'], ''),
                    'appointmentRequired': hospital.get('appointmentRequired'),
                    'description': _first_value(hospital, ['description', 'info'], ''),
                    'supportFeatures': hospital.get('supportFeatures') if isinstance(hospital.get('supportFeatures'), list) else [],
                })

        treatments = hospital.get('treatments') if isinstance(hospital.get('treatments'), list) else []
        for treatment in treatments:
            if isinstance(treatment, dict):
                treatment_name = _first_value(treatment, ['treatmentName', 'specialization', 'name'])
                treatment_text = " ".join([
                    treatment_name,
                    _first_value(treatment, ['description', 'requirements', 'availability', 'waitingTime', 'estimatedWaitTime'], ''),
                ]).lower()
                if requested_treatment and requested_treatment not in treatment_text and treatment_text not in requested_treatment:
                    continue
                key = (treatment_name.lower(), str(treatment.get('treatmentCost') or ''))
                if key in seen_treatment_keys:
                    continue
                seen_treatment_keys.add(key)
                all_treatments.append(treatment)
            else:
                key = (str(treatment).lower(), '')
                if key in seen_treatment_keys:
                    continue
                seen_treatment_keys.add(key)
                all_treatments.append(treatment)

    # Choose display name
    display_name = display_names[0] if display_names else 'Unknown Hospital'

    # Build header
    response = f"Treatments and services at {display_name}:\n"
    loc_parts = [c for c in sorted(cities) if c]
    if loc_parts:
        response += f"Location: {', '.join(loc_parts)}"
        if tehsils:
            response += f", {', '.join(sorted(tehsils))}"
        response += "\n"

    if categories:
        response += f"Category: {', '.join(sorted(set(categories)))}\n"

    if specialties:
        response += f"Primary treatment specialty: {', '.join(sorted(specialties))}\n"

    if websites:
        # show one website (first) to avoid long lists
        response += f"Website: {sorted(websites)[0]}\n"

    # List treatments if available
    if all_treatments:
        response += f"Details for {requested_treatment.title()}:\n" if requested_treatment else "Available treatments:\n"
        for i, treatment in enumerate(all_treatments[:50], 1):
            if isinstance(treatment, dict):
                treatment_name = _first_value(treatment, ['treatmentName', 'specialization', 'name'], 'Unknown Treatment')
                cost = treatment.get('treatmentCost') or treatment.get('cost') or ''
                availability = _first_value(treatment, ['availability'], '')
                waiting_time = _first_value(treatment, ['waitingTime', 'estimatedWaitTime'], '')
                severity = _first_value(treatment, ['severitySupport'], '')
                description = _first_value(treatment, ['description', 'requirements'], '')
                support_features = treatment.get('supportFeatures') if isinstance(treatment.get('supportFeatures'), list) else []
                appointment_required = treatment.get('appointmentRequired')
                line = f"{i}. {treatment_name}"
                details = []
                if cost not in [None, '', 'N/A', 0]:
                    details.append(f"Cost: {cost}")
                if availability:
                    details.append(f"Availability: {availability}")
                if waiting_time:
                    details.append(f"Waiting: {waiting_time}")
                if severity:
                    details.append(f"Severity support: {severity}")
                if appointment_required is not None:
                    details.append(f"Appointment required: {'Yes' if appointment_required else 'No'}")
                if details:
                    line += f" ({'; '.join(details)})"
                response += line + "\n"
                if description:
                    response += f"   Details: {description}\n"
                if support_features:
                    response += f"   Support features: {', '.join(str(feature) for feature in support_features if feature)}\n"
            else:
                response += f"{i}. {str(treatment)}\n"

        if len(all_treatments) > 50:
            response += f"... and {len(all_treatments) - 50} more treatments.\n"
    else:
        # No detailed treatment entries
        if requested_treatment:
            response += f"{requested_treatment.title()} is listed for this hospital, but no extra cost, waiting time, or appointment details were available in the database.\n"
        else:
            response += "No detailed treatment list was available in the database for this hospital.\n"

    # If we merged multiple records, note that
    if len(display_names) > 1:
        response += f"\n(Note: results combined from {len(display_names)} database records for this hospital.)"

    return response

def _get_user_state(user_id: str) -> Dict[str, str]:
    """Get or initialize simple in-memory chat state for a user."""
    uid = user_id or "anonymous"
    if uid not in conversation_state:
        conversation_state[uid] = {}
    return conversation_state[uid]

def fetch_database_data():
    """Fetch data from MongoDB via backend API"""
    global hospitals_data, universities_data, schemes_data
    
    try:
        # Fetch hospitals
        hospitals_response = requests.get(f"{BACKEND_URL}/api/hospitals", timeout=10)
        if hospitals_response.status_code == 200:
            data = hospitals_response.json()
            # Handle different response formats
            if isinstance(data, dict) and 'data' in data:
                hospitals_data = data['data']
            elif isinstance(data, list):
                hospitals_data = data
            else:
                hospitals_data = []
            print(f"✅ Loaded {len(hospitals_data)} hospitals from database")
        
        # Fetch universities
        universities_response = requests.get(f"{BACKEND_URL}/api/universities", timeout=10)
        if universities_response.status_code == 200:
            data = universities_response.json()
            if isinstance(data, dict) and 'data' in data:
                universities_data = data['data']
            elif isinstance(data, list):
                universities_data = data
            else:
                universities_data = []
            print(f"✅ Loaded {len(universities_data)} universities from database")
        
        # Fetch schemes
        schemes_response = requests.get(f"{BACKEND_URL}/api/schemes", timeout=10)
        if schemes_response.status_code == 200:
            data = schemes_response.json()
            if isinstance(data, dict) and 'data' in data:
                schemes_data = data['data']
            elif isinstance(data, list):
                schemes_data = data
            else:
                schemes_data = []
            print(f"✅ Loaded {len(schemes_data)} schemes from database")
            
    except Exception as e:
        print(f"❌ Error fetching database data: {e}")
        # Continue with empty data if database is not available

print(f"AI System Configuration:")
print(f"Model: {model_name}")
print(f"HuggingFace Enabled: {use_huggingface}")

# Fetch database data on startup
print("🔄 Fetching database data...")
fetch_database_data()

if use_huggingface:
    if not TRANSFORMERS_AVAILABLE:
        print("⚠️ Transformers not installed; using rule-based responses instead")
        use_huggingface = False

if use_huggingface:
    print("Loading Hugging Face model...")
    try:
        # Download and load tokenizer
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        # Download and load model
        model_kwargs = {
            "low_cpu_mem_usage": True,
        }
        if torch is not None:
            model_kwargs["dtype"] = torch.float32

        model = AutoModelForCausalLM.from_pretrained(model_name, **model_kwargs)
        model.eval()  # Set to evaluation mode
        print("✅ Hugging Face model loaded successfully!")
        print(f"Model: {model_name}")
        print(f"Device: CPU")
        
    except Exception as e:
        print(f"❌ Error loading Hugging Face model: {e}")
        print("🔄 Using rule-based responses as fallback")
        model = None
        tokenizer = None
else:
    print("📝 Using enhanced rule-based system")
    print("💡 To enable Hugging Face model, set use_huggingface = True")
    model = None
    tokenizer = None

def get_hospitals_by_city(city: str, message: str = "") -> str:
    """Get hospitals from database by city"""
    city = city.lower().strip()
    message = message.lower().strip()
    exact_city_hospitals = []
    soft_city_hospitals = []
    known_cities = set()

    requested_category = ""
    if any(word in message for word in ["govt", "government", "public"]):
        requested_category = "government"
    elif "private" in message:
        requested_category = "private"

    def dedupe_hospitals(hospitals: List[dict]) -> List[dict]:
        unique_hospitals = []
        seen_hospitals = set()
        for hospital in hospitals:
            if isinstance(hospital, dict):
                key = (
                    _first_value(hospital, ['Hospital Name', 'hospitalName', 'name']).lower(),
                    _first_value(hospital, ['City', 'city', 'location']).lower(),
                    _first_value(hospital, ['Tehsil', 'tehsil']).lower(),
                )
            else:
                key = (str(hospital).lower(), '', '')

            if key in seen_hospitals:
                continue
            seen_hospitals.add(key)
            unique_hospitals.append(hospital)
        return unique_hospitals
    
    # Handle different data structures and case-insensitive search across all likely fields
    for hospital in hospitals_data:
        if isinstance(hospital, dict):
            hospital_city = _first_value(hospital, ['City', 'city', 'location']).lower()
            known_city = hospital_city
            if known_city:
                known_cities.add(known_city)
            hospital_text = _hospital_search_text(hospital)
        else:
            hospital_city = str(hospital).lower()  # Convert to string if it's not a dict
            hospital_text = hospital_city

        exact_city_match = hospital_city == city or city in hospital_city
        soft_city_match = bool(re.search(rf"\b{re.escape(city)}\b", hospital_text)) and not exact_city_match

        if exact_city_match:
            exact_city_hospitals.append(hospital)
        elif soft_city_match:
            soft_city_hospitals.append(hospital)

    # If no direct matches, try a broader fuzzy match against known city values
    if not exact_city_hospitals and not soft_city_hospitals and known_cities:
        close_matches = get_close_matches(city, sorted(known_cities), n=1, cutoff=0.8)
        if close_matches:
            for hospital in hospitals_data:
                if isinstance(hospital, dict) and _first_value(hospital, ['City', 'city', 'location']).lower() == close_matches[0]:
                    exact_city_hospitals.append(hospital)
    
    city_hospitals = dedupe_hospitals(exact_city_hospitals or soft_city_hospitals)
    if requested_category:
        city_hospitals = [
            hospital for hospital in city_hospitals
            if isinstance(hospital, dict)
            and requested_category in _first_value(hospital, ['Cateogry', 'category'], '').lower()
        ]

    if city_hospitals:
        matched_via_location = not exact_city_hospitals and bool(soft_city_hospitals)
        category_label = f"{requested_category.title()} " if requested_category else ""
        response = (
            f"{category_label}Hospitals matched via address/location for {city.title()}:\n"
            if matched_via_location
            else f"{category_label}Hospitals in {city.title()}:\n"
        )
        limit = 5 if matched_via_location else 10
        for i, hospital in enumerate(city_hospitals[:limit], 1):
            if isinstance(hospital, dict):
                name = _first_value(hospital, ['Hospital Name', 'hospitalName', 'name'], 'Unknown Hospital')
                tehsil = _first_value(hospital, ['Tehsil', 'tehsil'])
                category = _first_value(hospital, ['Cateogry', 'category'], 'General')
            else:
                name = str(hospital)
                tehsil = ''
                category = 'General'
            
            response += f"{i}. {name} ({category})"
            if tehsil:
                response += f" - {tehsil}"
            response += "\n"
        
        if len(city_hospitals) > limit:
            response += f"... and {len(city_hospitals) - limit} more hospitals."
        if matched_via_location:
            response += "\n(Note: matched using address/location text, not an exact City field.)"
        
        return response
    else:
        available_cities = []
        seen_cities = set()
        for h in hospitals_data:
            if isinstance(h, dict):
                found_city = _first_value(h, ['City', 'city'])
                if found_city and found_city.lower() not in seen_cities:
                    seen_cities.add(found_city.lower())
                    available_cities.append(found_city)
        if requested_category:
            return f"No {requested_category} hospitals found in {city.title()}."
        return f"No hospitals found in {city.title()}. Please check the spelling or try another city. Available cities in database: {available_cities[:5]}"

def get_universities_by_city(city: str, message: str = "") -> str:
    """Get universities by city and optionally filter by discipline keywords from message."""
    city = city.lower().strip()
    message = message.lower().strip()

    discipline_aliases = {
        "computer science": ["computer science", "cs", "software", "it", "computing"],
        "engineering": ["engineering", "engineer"],
        "medical": ["medical", "mbbs", "health sciences"],
        "business": ["business", "bba", "mba", "management"],
    }

    requested_discipline = ""
    for canonical, aliases in discipline_aliases.items():
        if any(_contains_alias(message, alias) for alias in aliases):
            requested_discipline = canonical
            break

    exact_city_universities = []
    soft_city_universities = []
    known_cities = set()
    for university in universities_data:
        if not isinstance(university, dict):
            continue
        uni_city = _first_value(university, ['city', 'City', 'location']).lower()
        uni_text = _university_search_text(university)

        if uni_city:
            known_cities.add(uni_city)

        exact_city_match = uni_city == city or city in uni_city
        soft_city_match = bool(re.search(rf"\b{re.escape(city)}\b", uni_text)) and not exact_city_match

        if not exact_city_match and not soft_city_match:
            continue

        if requested_discipline:
            uni_disc = _first_value(university, ['discipline', 'program', 'department']).lower()
            if not any(alias in uni_disc for alias in discipline_aliases[requested_discipline]):
                continue

        if exact_city_match:
            exact_city_universities.append(university)
        else:
            soft_city_universities.append(university)

    city_universities = exact_city_universities or soft_city_universities

    if not city_universities and known_cities:
        close_matches = get_close_matches(city, sorted(known_cities), n=1, cutoff=0.8)
        if close_matches:
            for university in universities_data:
                if not isinstance(university, dict):
                    continue
                if _first_value(university, ['city', 'City', 'location']).lower() == close_matches[0]:
                    exact_city_universities.append(university)
            city_universities = exact_city_universities

    if not city_universities:
        if requested_discipline:
            return f"No {requested_discipline.title()} universities found in {city.title()} in database."
        return f"No universities found in {city.title()} in database."

    matched_via_location = not exact_city_universities and bool(soft_city_universities)
    heading = f"Universities in {city.title()}"
    if matched_via_location:
        heading = f"Universities matched via address/location for {city.title()}"
    if requested_discipline:
        heading = f"{requested_discipline.title()} universities in {city.title()}"
        if matched_via_location:
            heading = f"{requested_discipline.title()} universities matched via address/location for {city.title()}"

    response = f"{heading}:\n"
    limit = 5 if matched_via_location else 12
    for i, university in enumerate(city_universities[:limit], 1):
        name = _first_value(university, ['title', 'name', 'id'], 'Unknown University')
        discipline = _first_value(university, ['discipline'], 'N/A')
        degree = _first_value(university, ['degree'], 'N/A')
        response += f"{i}. {name} - Discipline: {discipline}, Degree: {degree}\n"

    if len(city_universities) > limit:
        response += f"... and {len(city_universities) - limit} more universities."
    if matched_via_location:
        response += "\n(Note: matched using address/location text, not an exact City field.)"

    return response

def get_universities_by_location(location: str, message: str = "") -> str:
    """Get universities by a broader location keyword across city, province, title, and discipline."""
    location = location.lower().strip()
    message = message.lower().strip()

    discipline_aliases = {
        "computer science": ["computer science", "cs", "software", "it", "computing"],
        "engineering": ["engineering", "engineer"],
        "medical": ["medical", "mbbs", "health sciences"],
        "business": ["business", "bba", "mba", "management"],
    }

    requested_discipline = ""
    for canonical, aliases in discipline_aliases.items():
        if any(_contains_alias(message, alias) for alias in aliases):
            requested_discipline = canonical
            break

    exact_location_universities = []
    soft_location_universities = []
    known_locations = set()
    for university in universities_data:
        if not isinstance(university, dict):
            continue

        city_value = _first_value(university, ['city', 'City', 'location']).lower()
        province_value = _first_value(university, ['province', 'Province']).lower()
        title_value = _first_value(university, ['title', 'name', 'id']).lower()
        discipline_value = _first_value(university, ['discipline', 'program', 'department']).lower()

        haystack_parts = [
            title_value,
            city_value,
            province_value,
            discipline_value,
        ]

        if city_value:
            known_locations.add(city_value)
        if province_value:
            known_locations.add(province_value)
        if title_value:
            known_locations.add(title_value)

        exact_location_match = any(location == part or location in part for part in [city_value, province_value, title_value] if part)
        soft_location_match = any(location in part or part in location for part in haystack_parts if part) and not exact_location_match

        if not exact_location_match and not soft_location_match:
            continue

        if requested_discipline:
            uni_disc = _first_value(university, ['discipline', 'program', 'department']).lower()
            if not any(alias in uni_disc for alias in discipline_aliases[requested_discipline]):
                continue

        if exact_location_match:
            exact_location_universities.append(university)
        else:
            soft_location_universities.append(university)

    location_universities = exact_location_universities or soft_location_universities

    if not location_universities and known_locations:
        close_matches = get_close_matches(location, sorted(known_locations), n=1, cutoff=0.72)
        if close_matches:
            return get_universities_by_location(close_matches[0], message)

    if not location_universities:
        if requested_discipline:
            return f"No {requested_discipline.title()} universities found for '{location.title()}' in database."
        return f"No universities found for '{location.title()}' in database."

    matched_via_location = not exact_location_universities and bool(soft_location_universities)
    heading = f"Universities for {location.title()}"
    if matched_via_location:
        heading = f"Universities matched via address/location for {location.title()}"
    if requested_discipline:
        heading = f"{requested_discipline.title()} universities for {location.title()}"
        if matched_via_location:
            heading = f"{requested_discipline.title()} universities matched via address/location for {location.title()}"

    response = f"{heading}:\n"
    limit = 5 if matched_via_location else 12
    for i, university in enumerate(location_universities[:limit], 1):
        name = _first_value(university, ['title', 'name', 'id'], 'Unknown University')
        city = _first_value(university, ['city', 'City', 'location'], 'N/A')
        province = _first_value(university, ['province', 'Province'], 'N/A')
        discipline = _first_value(university, ['discipline'], 'N/A')
        degree = _first_value(university, ['degree'], 'N/A')
        response += f"{i}. {name} - City: {city}, Province: {province}, Discipline: {discipline}, Degree: {degree}\n"

    if len(location_universities) > limit:
        response += f"... and {len(location_universities) - limit} more universities."
    if matched_via_location:
        response += "\n(Note: matched using address/location text, not an exact City field.)"

    return response

def get_universities_by_discipline(discipline: str) -> str:
    """Get universities from database by discipline with proper formatting"""
    discipline = discipline.lower().strip()
    discipline_universities = []
    
    for university in universities_data:
        if isinstance(university, dict):
            uni_discipline = university.get('discipline', '').lower()
            if discipline in uni_discipline:
                discipline_universities.append(university)
    
    if discipline_universities:
        response = f"Top {discipline.title()} Universities in Pakistan:\n\n"
        
        # Sort by fee or create a better ranking
        discipline_universities.sort(key=lambda x: x.get('fee', float('inf')) if isinstance(x.get('fee'), (int, float)) else float('inf'))
        
        for i, university in enumerate(discipline_universities[:10], 1):  # Limit to top 10
            if isinstance(university, dict):
                # Try to get proper university name - priority to actual name field
                name = university.get('name', '')
                if not name:
                    name = university.get('id', 'Unknown University')
                
                # Clean up the name - make it more readable
                if name.startswith('uni_'):
                    # Convert uni_24 to "University 24" or similar
                    uni_code = name[4:]
                    if uni_code.isdigit():
                        name = f"University Code {uni_code}"
                    else:
                        name = f"University {uni_code.title()}"
                elif not name or name == 'Unknown University':
                    name = f"University {university.get('city', 'Unknown')}"
                
                city = university.get('city', 'N/A')
                degree = university.get('degree', 'N/A')
                fee = university.get('fee', 'N/A')
                
                # Format fee properly
                if isinstance(fee, (int, float)) and fee > 0:
                    fee_str = f"PKR {int(fee):,}"
                else:
                    fee_str = "N/A"
                
                # Create detailed single university entry on separate lines
                response += f"🏛️ {name}\n"
                response += f"📍 Location: {city}\n"
                response += f"🎓 Degree: {degree}\n"
                response += f"💰 Fee: {fee_str}\n"
                response += "\n"  # Extra space between universities
        
        if len(discipline_universities) > 10:
            response += f"... and {len(discipline_universities) - 10} more universities available.\n"
        
        response += f"\n📋 Total {len(discipline_universities)} {discipline} universities found in database."
        
        return response
    else:
        return f"No universities found offering {discipline.title()}. Please check the spelling or try another discipline."

def get_schemes_by_category(category: str) -> str:
    """Get schemes from database by category"""
    category = category.lower().strip()
    category_schemes = []
    
    for scheme in schemes_data:
        if category in scheme.get('category', '').lower():
            category_schemes.append(scheme)
    
    if category_schemes:
        response = f"Government Schemes - {category.title()}:\n"
        for i, scheme in enumerate(category_schemes[:10], 1):  # Limit to 10 schemes
            name = scheme.get('schemeName', 'Unknown Scheme')
            short_name = scheme.get('shortName', '')
            department = scheme.get('department', '')
            response += f"{i}. {name}"
            if short_name:
                response += f" ({short_name})"
            if department:
                response += f" - {department}"
            response += "\n"
        
        if len(category_schemes) > 10:
            response += f"... and {len(category_schemes) - 10} more schemes."
        
        return response
    else:
        return f"No schemes found in {category.title()} category. Please check the spelling or try another category."

def _scheme_search_text(scheme: dict) -> str:
    """Build a searchable text blob from common scheme fields."""
    parts = []
    for key in ['schemeName', 'shortName', 'department', 'category', 'description', 'longDescription', 'eligibility', 'targetAudience', 'benefits']:
        value = scheme.get(key)
        if isinstance(value, list):
            parts.extend(str(item) for item in value)
        elif isinstance(value, dict):
            parts.append(json.dumps(value))
        elif value:
            parts.append(str(value))
    tags = scheme.get('tags')
    if isinstance(tags, list):
        parts.extend(str(tag) for tag in tags)
    return " ".join(part.lower() for part in parts if part)

def get_schemes_by_topic(message: str, audience: str = "") -> str:
    """Return schemes matching an audience/topic query such as students or business loans."""
    message = message.lower().strip()
    audience = audience.lower().strip()

    topic_keywords = []
    if audience == "students" or any(word in message for word in ["student", "students", "scholarship", "education", "laptop"]):
        topic_keywords = ["student", "students", "scholarship", "education", "laptop", "undergraduate", "stipend"]
        heading = "Government Schemes for Students"
    elif any(word in message for word in ["business", "loan", "karobar", "startup", "entrepreneur"]):
        topic_keywords = ["business", "loan", "karobar", "startup", "entrepreneur", "microloan", "finance"]
        heading = "Government Business Loan Schemes"
    else:
        topic_keywords = [word for word in re.split(r"\s+", message) if len(word) > 3 and word not in ["govt", "government", "scheme", "schemes"]]
        heading = "Government Schemes"

    scored_schemes = []
    for scheme in schemes_data:
        if not isinstance(scheme, dict):
            continue

        text = _scheme_search_text(scheme)
        score = sum(1 for keyword in topic_keywords if keyword in text)
        if audience:
            score += _scheme_audience_score(scheme, audience)

        if score > 0:
            scored_schemes.append((score, scheme))

    scored_schemes.sort(key=lambda item: (-item[0], _first_value(item[1], ['schemeName', 'shortName']).lower()))

    if not scored_schemes:
        return "I couldn't find matching government schemes in the database for this query."

    response = f"{heading}:\n"
    for i, (_, scheme) in enumerate(scored_schemes[:10], 1):
        name = scheme.get('schemeName', 'Unknown Scheme')
        short_name = scheme.get('shortName', '')
        department = scheme.get('department', '')
        category = scheme.get('category', '')
        response += f"{i}. {name}"
        if short_name:
            response += f" ({short_name})"
        details = [detail for detail in [department, category] if detail]
        if details:
            response += f" - {', '.join(details)}"
        response += "\n"

    if len(scored_schemes) > 10:
        response += f"... and {len(scored_schemes) - 10} more schemes."

    return response

def _scheme_audience_score(scheme: dict, audience: str) -> int:
    """Score how well a scheme matches an audience using structured fields."""
    if not audience:
        return 0

    text = _scheme_search_text(scheme)
    score = 0

    audience_keywords = {
        'students': ['student', 'students', 'scholarship', 'scholarships', 'undergraduate', 'undergrad', 'education', 'tuition', 'laptop', 'stipend', 'need-based', 'academic'],
        'women': ['woman', 'women', 'female', 'ladies', 'mother', 'mothers', 'girl', 'girls', 'widow', 'widows', 'maternal', 'empowerment', 'self-employment'],
        'youth': ['youth', 'young', 'young people', 'youth loan', 'employment', 'entrepreneurship', 'skills', 'startup'],
        'farmers': ['farmer', 'farmers', 'kisan', 'agriculture', 'agricultural', 'crop', 'livestock'],
    }

    for keyword in audience_keywords.get(audience, []):
        if keyword in text:
            score += 3

    target_audience = _first_value(scheme, ['targetAudience']).lower()
    eligibility = _first_value(scheme, ['eligibility']).lower()
    description = _first_value(scheme, ['description']).lower()

    if audience in target_audience:
        score += 6
    if audience in eligibility:
        score += 5
    if audience in description:
        score += 2

    if score > 0 and _first_value(scheme, ['province']).lower() == 'federal':
        score += 1

    return score

def get_schemes_by_province(province: str, audience: str = '') -> str:
    """Get schemes from database by province and optionally filter by audience (e.g. students).

    The function always includes Federal schemes. If `audience` is provided (like 'students'),
    it will prioritize and return schemes that mention students/scholarships/education in their
    name, description, eligibility, department or tags.
    """
    province = province.lower().strip()
    audience = audience.lower().strip()
    province_schemes = []
    exact_province_schemes = []

    for scheme in schemes_data:
        if not isinstance(scheme, dict):
            continue

        scheme_province = _first_value(scheme, ['province']).lower()
        if scheme_province == province:
            exact_province_schemes.append(scheme)
        if scheme_province == province or province in scheme_province or scheme_province == 'federal':
            province_schemes.append(scheme)

    if not province_schemes:
        return f"No schemes found in {province.title()} or Federal in database."

    if audience:
        audience_matches = []
        for scheme in province_schemes:
            score = _scheme_audience_score(scheme, audience)
            if score > 0:
                audience_matches.append((score, scheme))

        audience_matches.sort(key=lambda item: (-item[0], _first_value(item[1], ['schemeName', 'shortName']).lower()))

        if not audience_matches:
            return f"I couldn't find any {audience} schemes in {province.title()} or Federal in the database."

        response_lines = [f"Government Schemes in {province.title()} for {audience} (including Federal):"]
        for i, (_, scheme) in enumerate(audience_matches[:12], 1):
            name = scheme.get('schemeName', 'Unknown Scheme')
            short_name = scheme.get('shortName', '')
            department = scheme.get('department', '')
            line = f"{i}. {name}"
            if short_name:
                line += f" ({short_name})"
            if department:
                line += f" - {department}"
            eligibility = _first_value(scheme, ['eligibility'])
            target_audience = _first_value(scheme, ['targetAudience'])
            if eligibility:
                line += f" | Eligibility: {eligibility[:140]}"
            elif target_audience:
                line += f" | Target audience: {target_audience[:140]}"
            response_lines.append(line)

        if len(audience_matches) > 12:
            response_lines.append(f"... and {len(audience_matches) - 12} more {audience} schemes.")

        return "\n".join(response_lines)

    # For plain province queries, keep the response strict and province-only.
    response = f"Government Schemes in {province.title()} (province only):\n"
    ordered_schemes = []
    for scheme in exact_province_schemes:
        metadata_score = 0
        for field in ['eligibility', 'targetAudience', 'description', 'benefits']:
            if _first_value(scheme, [field]):
                metadata_score += 1
        ordered_schemes.append((metadata_score, scheme))

    ordered_schemes.sort(key=lambda item: (-item[0], _first_value(item[1], ['schemeName', 'shortName']).lower()))

    for i, (_, scheme) in enumerate([item for item in ordered_schemes][:12], 1):
        name = scheme.get('schemeName', 'Unknown Scheme')
        short_name = scheme.get('shortName', '')
        department = scheme.get('department', '')
        response += f"{i}. {name}"
        if short_name:
            response += f" ({short_name})"
        if department:
            response += f" - {department}"
        response += "\n"

    if len(exact_province_schemes) > 12:
        response += f"... and {len(exact_province_schemes) - 12} more schemes."

    if not exact_province_schemes:
        response = f"I couldn't find any schemes specific to {province.title()} in the database."

    return response

def get_university_details_from_database(message: str) -> str:
    """Get detailed university information from database"""
    message = message.lower().strip()
    
    # Check for specific university names
    university_keywords = {
        'fast': 'fast',
        'nust': 'nust',
        'uet': 'uet',
        'giki': 'giki',
        'ned': 'ned',
        'lums': 'lums',
        'iba': 'iba',
        'comsats': 'comsats',
        'king edward': 'king edward',
        'aga khan': 'aga khan',
        'kemc': 'kemc'
    }
    
    found_university = None
    for keyword, search_term in university_keywords.items():
        if keyword in message:
            found_university = search_term
            break
    
    if found_university:
        # Search in database
        matching_universities = []
        for university in universities_data:
            if isinstance(university, dict):
                uni_id = university.get('id', '').lower()
                uni_name = university.get('name', '').lower()
                if found_university in uni_id or found_university in uni_name:
                    matching_universities.append(university)
        
        if matching_universities:
            response = f"Information about {found_university.title()} University:\n\n"
            for i, university in enumerate(matching_universities[:3], 1):  # Limit to 3 results
                if isinstance(university, dict):
                    name = university.get('id', university.get('name', 'Unknown'))
                    city = university.get('city', 'N/A')
                    degree = university.get('degree', 'N/A')
                    discipline = university.get('discipline', 'N/A')
                    fee = university.get('fee', 'N/A')
                    contact = university.get('contact', 'N/A')
                    info = university.get('info', '')
                    
                    response += f"{i}. {name}\n"
                    response += f"   City: {city}\n"
                    response += f"   Degree: {degree}\n"
                    response += f"   Discipline: {discipline}\n"
                    if fee and fee != 'N/A':
                        response += f"   Fee: {fee}\n"
                    if contact and contact != 'N/A':
                        response += f"   Contact: {contact}\n"
                    if info:
                        response += f"   Additional Info: {info}\n"
                    response += "\n"
            
            return response
        else:
            return "No specific university found in database."
    
    return "No specific university found in database."

def generate_ai_response(message, user_id: str = "anonymous"):
    """Generate response using Hugging Face model with fallback"""
    message = message.lower().strip()
    user_state = _get_user_state(user_id)
    
    # Handle conversation and greetings first
    if any(_contains_word(message, word) for word in ['how are you', 'how are you doing', 'kese ho', 'kaise ho']):
        return "I am fine, thank you! I can help with universities, hospitals, and government schemes in Pakistan."
    if any(_contains_word(message, word) for word in ['hello', 'hi', 'assalam', 'salam', 'hey', 'good morning', 'good evening', 'good afternoon']):
        return "Hello! I'm your AI assistant for Awam Assist. I can help you find information about universities, government schemes, and hospitals in Pakistan. How can I assist you today?"
    
    # Handle thanks and appreciation
    if any(_contains_word(message, word) for word in ['thank', 'thanks', 'shukria', 'appreciate']):
        return "You're very welcome! I'm here to help. Feel free to ask any other questions about universities, schemes, or hospitals in Pakistan."
    
    # Handle help requests
    if any(_contains_word(message, word) for word in ['help', 'what can you do', 'how can you help', 'capabilities']):
        return "I can help you with: 1) Finding universities and colleges in Pakistan with specific admission requirements, 2) Information about government schemes and scholarships with eligibility criteria, 3) Locating hospitals and medical facilities with contact details, 4) Admission procedures and requirements. Just ask me anything about these topics!"
    
    city = _extract_city(message)
    province = _extract_province(message)
    location_phrase = _extract_location_phrase(message)
    hospital_location = _extract_hospital_location(message)
    hospital_name = _extract_hospital_name(message)
    requested_treatment = _extract_requested_treatment(message)
    audience = _extract_audience(message)

    # Handle follow-up city-only messages based on pending intent
    if user_state.get("pending_intent") == "hospital_city" and not any(word in message for word in ['university', 'scheme', 'college']):
        followup_location = city or hospital_location or message
        user_state.pop("pending_intent", None)
        return get_hospitals_by_city(followup_location, message)
    if city and user_state.get("pending_intent") == "hospital_city":
        user_state.pop("pending_intent", None)
        return get_hospitals_by_city(city, message)
    if hospital_name and any(word in message for word in ['treatment', 'treatments', 'services', 'specialty', 'specialties']):
        user_state.pop("pending_intent", None)
        return get_hospital_treatments(hospital_name, requested_treatment)
    if city and user_state.get("pending_intent") == "university_city":
        user_state.pop("pending_intent", None)
        return get_universities_by_city(city, message)
    
    # First try database-driven responses for accuracy based on intent
    is_hospital_query = any(word in message for word in ['hospital', 'doctor', 'clinic', 'medical treatment', 'nearest hospital'])
    is_university_query = any(word in message for word in ['university', 'universities', 'college', 'admission', 'study', 'computer science', 'cs', 'engineering', 'mba', 'mbbs'])
    is_scheme_query = any(word in message for word in ['scheme', 'schemes', 'govt', 'govt scheme', 'govt schemes', 'government program', 'government scheme', 'scholarship', 'loan', 'ehsaas', 'bisp', 'kamyab'])

    if hospital_location and is_hospital_query:
        user_state.pop("pending_intent", None)
        return get_hospitals_by_city(hospital_location, message)
    if city and is_hospital_query:
        user_state.pop("pending_intent", None)
        return get_hospitals_by_city(city, message)
    if city and is_university_query:
        user_state.pop("pending_intent", None)
        return get_universities_by_city(city, message)
    if is_university_query and location_phrase:
        user_state.pop("pending_intent", None)
        return get_universities_by_location(location_phrase, message)
    if province and is_scheme_query:
        user_state.pop("pending_intent", None)
        return get_schemes_by_province(province, audience)
    if is_scheme_query and (audience or any(word in message for word in ['business', 'loan', 'karobar', 'startup', 'entrepreneur', 'student', 'students', 'scholarship', 'education', 'laptop'])):
        user_state.pop("pending_intent", None)
        return get_schemes_by_topic(message, audience)
    if city and is_scheme_query:
        user_state.pop("pending_intent", None)
        for category in ['education', 'health', 'agriculture', 'employment', 'welfare', 'loan', 'scholarship']:
            if category in message:
                return get_schemes_by_category(category)
    if is_hospital_query and not city and ('nearest' in message or 'near me' in message):
        user_state["pending_intent"] = "hospital_city"
        return "To find the nearest hospital, please tell me your city or area."

    if hospital_name and any(word in message for word in ['treatment', 'treatments', 'services', 'specialty', 'specialties']):
        return get_hospital_treatments(hospital_name, requested_treatment)
    
    # Check for discipline-based university queries
    if not is_scheme_query and any(discipline in message for discipline in ['engineering', 'medical', 'business', 'computer', 'arts', 'science']):
        for discipline in ['engineering', 'medical', 'business', 'computer', 'arts', 'science']:
            if discipline in message:
                return get_universities_by_discipline(discipline)

    if is_university_query and location_phrase:
        return get_universities_by_location(location_phrase, message)

    if is_university_query and 'of ' in message:
        location_after_of = message.split('of ', 1)[1].strip()
        location_after_of = re.sub(r"^(the\s+)?(university|universities|college|colleges)\s+", "", location_after_of).strip()
        if location_after_of:
            return get_universities_by_location(location_after_of, message)
    
    # Check for category-based scheme queries
    if any(category in message for category in ['education', 'health', 'agriculture', 'employment', 'welfare', 'loan', 'scholarship']):
        for category in ['education', 'health', 'agriculture', 'employment', 'welfare', 'loan', 'scholarship']:
            if category in message:
                return get_schemes_by_category(category)
    
    # Check for specific university names with detailed queries
    if any(uni in message for uni in ['nust', 'uet', 'giki', 'ned', 'lums', 'iba', 'fast', 'comsats', 'king edward', 'aga khan', 'kemc']):
        # Try to get detailed information from database first
        database_response = get_university_details_from_database(message)
        if database_response and database_response != "No specific university found in database.":
            return database_response
        
        # Fallback to rule-based if database doesn't have it
        fallback_response = generate_fallback_response(message)
        if fallback_response != "I'm here to help with universities, government schemes, and hospitals in Pakistan. Could you please specify what information you're looking for? For example: 'Tell me about NUST', 'What is Ehsaas Program?', or 'Find hospitals in Lahore'.":
            return fallback_response
    
    # Try specific rule-based responses
    fallback_response = generate_fallback_response(message)
    
    # If we have a specific answer, use it directly
    if fallback_response != "I'm here to help with universities, government schemes, and hospitals in Pakistan. Could you please specify what information you're looking for? For example: 'Tell me about NUST', 'What is Ehsaas Program?', or 'Find hospitals in Lahore'.":
        return fallback_response
    
    # Use Hugging Face model for general queries or when database doesn't have specific info
    if model is not None and tokenizer is not None:
        try:
            # Create a context-aware prompt for better responses
            context_prompt = f"""You are a helpful AI assistant for Awam Assist, a platform that provides information about universities, government schemes, and hospitals in Pakistan. You have access to a database of real information, but you should also provide helpful responses based on your knowledge when specific data isn't available.

User: {message}
Assistant:"""
            
            # Tokenize input
            inputs = tokenizer.encode_plus(
                context_prompt,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512
            )
            
            outputs = model.generate(
                inputs.input_ids,
                max_new_tokens=200,
                temperature=0.7,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
            
            response = tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract only the assistant's response
            if "Assistant:" in response:
                response = response.split("Assistant:")[-1].strip()
            
            # If response is too short or generic, use fallback
            if len(response) < 20 or "I'm sorry" in response or "I don't know" in response:
                return fallback_response
            
            return response
            
        except Exception as e:
            print(f"Error generating AI response: {e}")
            return fallback_response
    
    # Final fallback
    return fallback_response

def generate_fallback_response(message):
    """Fallback rule-based responses with specific information"""
    message = message.lower().strip()
    province = _extract_province(message)
    hospital_name = _extract_hospital_name(message)
    requested_treatment = _extract_requested_treatment(message)
    
    # Enhanced greetings
    if any(_contains_word(message, word) for word in ['hello', 'hi', 'assalam', 'salam', 'hey', 'good morning', 'good evening', 'good afternoon']):
        return "Hello! I'm your AI assistant for Awam Assist. I can help you find information about universities, government schemes, and hospitals in Pakistan. How can I assist you today?"
    
    # University queries - improved detection
    elif any(_contains_word(message, word) for word in ['university', 'college', 'education', 'study', 'admission', 'nust', 'uet', 'giki', 'ned', 'lums', 'iba', 'fast', 'comsats', 'king edward', 'aga khan', 'kemc', 'mbbs', 'engineering', 'medical', 'business', 'computer', 'bba', 'mba']):
        # Check for specific university names
        if 'nust' in message:
            return "NUST (National University of Sciences and Technology) is Pakistan's top-ranked university. Located in Islamabad, it offers engineering, medical, business, and computer science programs. Admission requires NUST entry test with minimum 60% marks in FSc."
        elif 'uet' in message and 'lahore' in message:
            return "UET Lahore is one of Pakistan's oldest and most prestigious engineering universities. It offers BSc Engineering in multiple disciplines. Admission requires ECAT test with at least 60% marks in FSc Pre-Engineering."
        elif 'giki' in message:
            return "GIKI (Ghulam Ishaq Khan Institute) is a top engineering university in Topi, KPK. Known for its excellent engineering programs and research facilities. Requires GIKI entry test with strong FSc scores."
        elif 'ned' in message:
            return "NED University of Engineering and Technology in Karachi is Sindh's premier engineering institution. Offers various engineering disciplines. Admission through ECAT with 60% minimum FSc marks."
        elif 'king edward' in message or 'kemc' in message:
            return "King Edward Medical University (KEMU) in Lahore is Pakistan's oldest medical college. Requires MCAT exam with minimum 65% marks in FSc Pre-Medical. Highly competitive with limited seats."
        elif 'aga khan' in message:
            return "Aga Khan University Hospital and Medical College in Karachi is a world-class medical institution. Requires excellent MCAT scores and FSc Pre-Medical grades. High tuition fees but quality education."
        elif 'lums' in message:
            return "LUMS (Lahore University of Management Sciences) is Pakistan's top private university. Offers BSc, BA, BBA, MBA, and PhD programs. Requires SAT/ACT scores and LUMS admission test. High tuition fees but excellent education."
        elif 'iba' in message:
            return "IBA (Institute of Business Administration) Karachi is Pakistan's premier business school. Offers BBA, MBA, and PhD programs. Requires IBA admission test and strong academic background."
        elif 'fast' in message:
            return "FAST-NUCES has campuses in Islamabad, Karachi, Lahore, and Peshawar. Specializes in Computer Science, Engineering, and Management Sciences. Requires FAST admission test with good FSc scores."
        elif 'comsats' in message:
            return "COMSATS Institute of Information Technology has multiple campuses across Pakistan. Offers programs in Computer Science, Engineering, Business, and Sciences. Admission based on NTS test with 50% minimum FSc marks."
        elif 'engineering' in message:
            return "Top engineering universities in Pakistan: NUST Islamabad, UET Lahore, GIKI Topi, NED Karachi, UET Taxila, and UET Peshawar. All require ECAT test with minimum 60% marks in FSc Pre-Engineering."
        elif 'medical' in message or 'mbbs' in message:
            return "Top medical universities: King Edward Medical University (Lahore), Aga Khan University (Karachi), Dow Medical College (Karachi), Allama Iqbal Medical College (Lahore), and AIMC (Lahore). All require MCAT with 65% minimum FSc Pre-Medical."
        elif 'business' in message or 'mba' in message or 'bba' in message:
            return "Top business universities: LUMS (Lahore), IBA (Karachi), LSE (Lahore), SZABIST (Karachi/Islamabad), and NUST Business School (Islamabad). Require admission tests and good academic records."
        elif 'computer' in message or 'it' in message or 'software' in message:
            return "Top Computer Science universities: NUST, FAST-NUCES, COMSATS, UET Lahore, and LUMS. These offer excellent CS programs with modern labs and industry connections."
        else:
            return "I can help you find universities! Are you looking for engineering, medical, business, computer science, or arts programs? Also let me know your preferred city or province for more specific recommendations."
    
    # Government schemes queries - improved detection
    elif any(_contains_word(message, word) for word in ['scheme', 'schemes', 'govt', 'govt scheme', 'govt schemes', 'government', 'program', 'benefit', 'loan', 'scholarship', 'ehsaas', 'laptop', 'kamyab', 'sehat', 'bisp', 'benazir']):
        if province:
            return get_schemes_by_province(province)
        if 'ehsaas' in message:
            return "Ehsaas Program is Pakistan's largest social protection initiative. Includes Ehsaas Emergency Cash, Ehsaas Scholarship Program, Ehsaas Kafalat, and Ehsaas Nashonuma. Eligibility based on income level and family composition."
        elif 'laptop' in message:
            return "Prime Minister's Laptop Scheme provides free laptops to talented students in public sector universities. Eligibility: 70% marks in previous semester, no disciplinary issues, and not a previous recipient."
        elif 'kamyab' in message:
            return "Kamyab Jawan Program offers youth loans up to PKR 5 million for business startups. Categories: Tier 1 (up to 1 lakh), Tier 2 (up to 5 lakh), Tier 3 (up to 5 million). Requires business plan and collateral for higher amounts."
        elif 'sehat' in message:
            return "Sehat Sahulat Program provides free health insurance worth PKR 720,000 per family per year. Covers hospitalization, surgeries, and major treatments. Available for deserving families across Pakistan."
        elif 'benazir' in message or 'bisp' in message:
            return "Benazir Income Support Program (BISP) provides monthly stipends of PKR 2,000-3,000 to eligible poor families. Eligibility based on poverty score, family composition, and income level."
        elif 'education' in message or 'scholarship' in message:
            return "Education schemes: Ehsaas Undergraduate Scholarship (covers tuition + stipend), Prime Minister's Laptop Scheme, HEC Need-based Scholarships, and Punjab Educational Endowment Fund."
        elif 'business' in message or 'loan' in message:
            return "Business schemes: Prime Minister's Youth Business Loan (up to 5 million), Kamyab Jawan Program, SME Finance Scheme, and Women Entrepreneurship Finance Program."
        elif 'health' in message:
            return "Health schemes: Sehat Sahulat Program (free health insurance), Prime Minister's Health Card, and Ehsaas Nashonuma (nutrition for mothers and children)."
        elif 'poverty' in message or 'poor' in message or 'financial help' in message:
            return "Financial assistance: Ehsaas Kafalat (monthly stipend), Ehsaas Emergency Cash, BISP payments, and Zakat programs for deserving individuals."
        else:
            return "I can help with government schemes! Are you interested in education scholarships, business loans, healthcare programs, or social welfare benefits?"
    
    # Hospital queries - improved detection
    elif any(_contains_word(message, word) for word in ['hospital', 'doctor', 'medical', 'health', 'treatment', 'nearest', 'pims', 'shifa', 'jinnah', 'civil', 'services', 'mayo', 'shalamar']):
        if hospital_name:
            return get_hospital_treatments(hospital_name, requested_treatment)
        if 'pims' in message or 'pakistan institute' in message:
            return "PIMS (Pakistan Institute of Medical Sciences) in Islamabad is a major public hospital. Offers all major medical specialties, 24/7 emergency services, and affordable treatment. Located in G-8/3, Islamabad."
        elif 'shifa' in message:
            return "Shifa International Hospital in Islamabad is a top private hospital. Offers advanced medical care, modern facilities, and specialist doctors. Located near F-8 Markaz, Islamabad. Higher costs but quality care."
        elif 'jinnah' in message or 'jpmc' in message:
            return "Jinnah Postgraduate Medical Centre (JPMC) in Karachi is one of Pakistan's largest public hospitals. Provides comprehensive medical services, emergency care, and specialist treatments. Affordable for all patients."
        elif 'civil' in message:
            return "Civil Hospital Karachi is a major public hospital providing healthcare to thousands daily. Offers all major specialties, emergency services, and medical education. Located in Karachi's Saddar area."
        elif 'services' in message:
            return "Services Hospital Lahore is a major public hospital in Punjab. Offers comprehensive medical services, emergency care, and specialist treatments. Located on Jail Road, Lahore."
        elif 'mayo' in message:
            return "Mayo Hospital Lahore is one of Pakistan's oldest hospitals, established in 1871. Provides general and specialized medical care, emergency services, and medical education. Located on Mall Road, Lahore."
        elif 'shalamar' in message:
            return "Shalamar Hospital Lahore is a major private hospital with modern facilities. Offers comprehensive medical services, advanced surgery, and specialist care. Located on Shalamar Link Road, Lahore."
        elif 'lahore' in message:
            return "Top hospitals in Lahore: Services Hospital (public, affordable), Mayo Hospital (public, established 1871), Shalamar Hospital (private, modern), and Lahore General Hospital (public). All provide comprehensive medical care with emergency services."
        elif 'karachi' in message:
            return "Top hospitals in Karachi: Aga Khan University Hospital (private, premium), Jinnah Postgraduate Medical Centre (public), Civil Hospital (public), and Liaquat National Hospital (private)."
        elif 'islamabad' in message:
            return "Top hospitals in Islamabad: PIMS Hospital (public, affordable), Shifa International (private, premium), Polyclinic (public), and KRL Hospital (public). All offer emergency and specialist services."
        elif 'nearest' in message or 'near me' in message:
            return "To find the nearest hospital, please tell me your city or area."
        else:
            return "I can help you find hospitals! Which city are you looking for hospitals in? Also let me know if you need specialized treatment or emergency services."
    
    # Help and general queries
    elif any(_contains_word(message, word) for word in ['help', 'what can you do', 'how can you help', 'capabilities']):
        return "I can help you with: 1) Finding universities and colleges in Pakistan with specific admission requirements, 2) Information about government schemes and scholarships with eligibility criteria, 3) Locating hospitals and medical facilities with contact details, 4) Admission procedures and requirements. Just ask me anything about these topics!"
    
    # Thanks and appreciation
    elif any(_contains_word(message, word) for word in ['thank', 'thanks', 'shukria', 'appreciate']):
        return "You're welcome! I'm here to help. Feel free to ask any other questions about universities, schemes, or hospitals in Pakistan."
    
    # Default response
    else:
        return "I'm here to help with universities, government schemes, and hospitals in Pakistan. Could you please specify what information you're looking for? For example: 'Tell me about NUST', 'What is Ehsaas Program?', or 'Find hospitals in Lahore'."

class ChatRequest(BaseModel):
    message: str
    user_id: str = "anonymous"

class ChatResponse(BaseModel):
    reply: str
    model: str

@app.get("/")
async def root():
    return {"message": "Awam Assist AI is running!", "model": model_name if model else "rule-based"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Generate response using hybrid system - Hugging Face + rule-based
        response_text = generate_ai_response(request.message, request.user_id)
        
        return ChatResponse(
            reply=response_text, 
            model="hybrid-huggingface-rule-based"
        )
        
    except Exception as e:
        print(f"Error generating response: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "model": model_name if model else "rule-based-fallback",
        "huggingface_model_loaded": model is not None
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
