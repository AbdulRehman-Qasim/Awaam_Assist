from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import re
import requests
import json
from typing import List, Dict

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
BACKEND_URL = "http://localhost:5000"

# Global data cache
hospitals_data = []
universities_data = []
schemes_data = []
KNOWN_CITIES = ['multan', 'lahore', 'karachi', 'islamabad', 'peshawar', 'quetta', 'faisalabad', 'rawalpindi', 'gujranwala', 'sialkot']
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

def _extract_city(message: str) -> str:
    for city in KNOWN_CITIES:
        if city in message:
            return city
    return ""

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
    print("Loading Hugging Face model...")
    try:
        # Download and load tokenizer
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        # Download and load model
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            dtype=torch.float32,  # Use dtype instead of torch_dtype
            low_cpu_mem_usage=True
        )
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

def get_hospitals_by_city(city: str) -> str:
    """Get hospitals from database by city"""
    city = city.lower().strip()
    city_hospitals = []
    
    # Handle different data structures and case-insensitive search
    for hospital in hospitals_data:
        if isinstance(hospital, dict):
            hospital_city = _first_value(hospital, ['City', 'city', 'location']).lower()
        else:
            hospital_city = str(hospital).lower()  # Convert to string if it's not a dict
        
        # Check for exact match or partial match
        if hospital_city == city or city in hospital_city:
            city_hospitals.append(hospital)
    
    if city_hospitals:
        response = f"Hospitals in {city.title()}:\n"
        for i, hospital in enumerate(city_hospitals[:10], 1):  # Limit to 10 hospitals
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
        
        if len(city_hospitals) > 10:
            response += f"... and {len(city_hospitals) - 10} more hospitals."
        
        return response
    else:
        available_cities = []
        for h in hospitals_data:
            if isinstance(h, dict):
                found_city = _first_value(h, ['City', 'city'])
                if found_city:
                    available_cities.append(found_city)
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
        if any(alias in message for alias in aliases):
            requested_discipline = canonical
            break

    city_universities = []
    for university in universities_data:
        if not isinstance(university, dict):
            continue
        uni_city = _first_value(university, ['city', 'City', 'location']).lower()
        if city not in uni_city:
            continue

        if requested_discipline:
            uni_disc = _first_value(university, ['discipline', 'program', 'department']).lower()
            if not any(alias in uni_disc for alias in discipline_aliases[requested_discipline]):
                continue

        city_universities.append(university)

    if not city_universities:
        if requested_discipline:
            return f"No {requested_discipline.title()} universities found in {city.title()} in database."
        return f"No universities found in {city.title()} in database."

    heading = f"Universities in {city.title()}"
    if requested_discipline:
        heading = f"{requested_discipline.title()} universities in {city.title()}"

    response = f"{heading}:\n"
    for i, university in enumerate(city_universities[:12], 1):
        name = _first_value(university, ['title', 'name', 'id'], 'Unknown University')
        discipline = _first_value(university, ['discipline'], 'N/A')
        degree = _first_value(university, ['degree'], 'N/A')
        response += f"{i}. {name} - Discipline: {discipline}, Degree: {degree}\n"

    if len(city_universities) > 12:
        response += f"... and {len(city_universities) - 12} more universities."

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
    if any(word in message for word in ['how are you', 'how are you doing', 'kese ho', 'kaise ho']):
        return "I am fine, thank you! I can help with universities, hospitals, and government schemes in Pakistan."
    if any(word in message for word in ['hello', 'hi', 'assalam', 'salam', 'hey', 'good morning', 'good evening', 'good afternoon']):
        return "Hello! I'm your AI assistant for Awam Assist. I can help you find information about universities, government schemes, and hospitals in Pakistan. How can I assist you today?"
    
    # Handle thanks and appreciation
    if any(word in message for word in ['thank', 'thanks', 'shukria', 'appreciate']):
        return "You're very welcome! I'm here to help. Feel free to ask any other questions about universities, schemes, or hospitals in Pakistan."
    
    # Handle help requests
    if any(word in message for word in ['help', 'what can you do', 'how can you help', 'capabilities']):
        return "I can help you with: 1) Finding universities and colleges in Pakistan with specific admission requirements, 2) Information about government schemes and scholarships with eligibility criteria, 3) Locating hospitals and medical facilities with contact details, 4) Admission procedures and requirements. Just ask me anything about these topics!"
    
    city = _extract_city(message)

    # Handle follow-up city-only messages based on pending intent
    if city and user_state.get("pending_intent") == "hospital_city":
        user_state.pop("pending_intent", None)
        return get_hospitals_by_city(city)
    if city and user_state.get("pending_intent") == "university_city":
        user_state.pop("pending_intent", None)
        return get_universities_by_city(city, message)
    
    # First try database-driven responses for accuracy based on intent
    is_hospital_query = any(word in message for word in ['hospital', 'doctor', 'clinic', 'medical treatment', 'nearest hospital'])
    is_university_query = any(word in message for word in ['university', 'universities', 'college', 'admission', 'study', 'computer science', 'cs', 'engineering', 'mba', 'mbbs'])
    is_scheme_query = any(word in message for word in ['scheme', 'schemes', 'government program', 'scholarship', 'loan', 'ehsaas', 'bisp', 'kamyab'])

    if city and is_hospital_query:
        user_state.pop("pending_intent", None)
        return get_hospitals_by_city(city)
    if city and is_university_query:
        user_state.pop("pending_intent", None)
        return get_universities_by_city(city, message)
    if city and is_scheme_query:
        user_state.pop("pending_intent", None)
        for category in ['education', 'health', 'agriculture', 'employment', 'welfare', 'loan', 'scholarship']:
            if category in message:
                return get_schemes_by_category(category)
    if is_hospital_query and not city and ('nearest' in message or 'near me' in message):
        user_state["pending_intent"] = "hospital_city"
        return "To find the nearest hospital, please tell me your city or area."
    
    # Check for discipline-based university queries
    if any(discipline in message for discipline in ['engineering', 'medical', 'business', 'computer', 'arts', 'science']):
        for discipline in ['engineering', 'medical', 'business', 'computer', 'arts', 'science']:
            if discipline in message:
                return get_universities_by_discipline(discipline)
    
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
    
    # Enhanced greetings
    if any(word in message for word in ['hello', 'hi', 'assalam', 'salam', 'hey', 'good morning', 'good evening', 'good afternoon']):
        return "Hello! I'm your AI assistant for Awam Assist. I can help you find information about universities, government schemes, and hospitals in Pakistan. How can I assist you today?"
    
    # University queries - improved detection
    elif any(word in message for word in ['university', 'college', 'education', 'study', 'admission', 'nust', 'uet', 'giki', 'ned', 'lums', 'iba', 'fast', 'comsats', 'king edward', 'aga khan', 'kemc', 'mbbs', 'engineering', 'medical', 'business', 'computer', 'bba', 'mba']):
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
    elif any(word in message for word in ['scheme', 'government', 'program', 'benefit', 'loan', 'scholarship', 'ehsaas', 'laptop', 'kamyab', 'sehat', 'bisp', 'benazir']):
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
    elif any(word in message for word in ['hospital', 'doctor', 'medical', 'health', 'treatment', 'nearest', 'pims', 'shifa', 'jinnah', 'civil', 'services', 'mayo', 'shalamar']):
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
    elif any(word in message for word in ['help', 'what can you do', 'how can you help', 'capabilities']):
        return "I can help you with: 1) Finding universities and colleges in Pakistan with specific admission requirements, 2) Information about government schemes and scholarships with eligibility criteria, 3) Locating hospitals and medical facilities with contact details, 4) Admission procedures and requirements. Just ask me anything about these topics!"
    
    # Thanks and appreciation
    elif any(word in message for word in ['thank', 'thanks', 'shukria', 'appreciate']):
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
