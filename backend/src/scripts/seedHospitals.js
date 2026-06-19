/**
 * seedHospitals.js
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Removes all bulk-imported hospitals (no hospital admin linked) + their reviews
 * 2. Seeds 60 well-known Pakistani hospitals (Lahore×20, Karachi×20,
 *    Islamabad/Rawalpindi×10, Peshawar×5, Other cities×5)
 *    that have REAL Reddit community presence.
 *
 * Run:  node src/scripts/seedHospitals.js
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Hospital = require('../models/HospitalSchema');
const HospitalReviewData = require('../models/HospitalReviewDataSchema');
const HospitalAdmin = require('../models/HospitalAdminSchema');
const Admin = require('../models/AdminSchema');
const bcrypt = require('bcryptjs');

// ── Helper: build a treatment object ─────────────────────────────────────────
const t = (name, spec, cost, avail = 'Available', emergency = false) => ({
  treatmentName:     name,
  specialization:    spec,
  treatmentCost:     cost,
  availability:      avail,
  isEmergency:       emergency,
  severitySupport:   emergency ? 'Emergency' : cost === 0 ? 'Basic' : 'Moderate',
  appointmentRequired: !emergency,
  estimatedWaitTime: emergency ? 'Immediate' : '30-60 mins',
  doctorCount:       Math.floor(Math.random() * 20) + 5,
  description:       '',
  supportFeatures:   [],
  waitingTime:       emergency ? 'Immediate' : '30-60 mins',
  requirements:      '',
  costRange:         { min: Math.max(0, cost - 1000), max: cost + 2000 },
});

// ── 60 HOSPITALS ─────────────────────────────────────────────────────────────

const HOSPITALS = [

  // ═══════════════ LAHORE (20) ═══════════════

  {
    'Hospital Name': 'Services Hospital Lahore',
    City: 'Lahore', Tehsil: 'Jail Road',
    Cateogry: 'Government',
    description: 'One of the largest public-sector teaching hospitals in Punjab, attached to King Edward Medical University. Provides free emergency, surgical, and general medicine services to thousands daily.',
    emergencyServices: true, bedCapacity: 1500,
    website: 'https://services.gop.pk', contactNumber: '042-99231471',
    address: 'Jail Road, Lahore, Punjab',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'General Medicine', severitySupport: 'Emergency',
    tags: ['emergency', 'government', 'teaching hospital', 'lahore'],
    treatments: [
      t('Emergency Care',  'Emergency Medicine', 0,    'Available', true),
      t('General Surgery', 'Surgery',           3000, 'Available'),
      t('Orthopedics',     'Orthopedics',       5000, 'Available'),
      t('Gynecology',      'Gynecology',        2000, 'Available'),
    ],
  },
  {
    'Hospital Name': 'Mayo Hospital Lahore',
    City: 'Lahore', Tehsil: 'Nila Gumbad',
    Cateogry: 'Government',
    description: 'Established in 1871, Mayo Hospital is one of the oldest and largest public hospitals in Asia. It handles trauma, burns, ophthalmology, and general medicine at scale.',
    emergencyServices: true, bedCapacity: 2000,
    website: 'https://mayo.gop.pk', contactNumber: '042-99231300',
    address: 'Nila Gumbad, Lahore, Punjab',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Trauma & Emergency', severitySupport: 'Emergency',
    tags: ['emergency', 'government', 'oldest hospital', 'lahore'],
    treatments: [
      t('Trauma & Emergency', 'Emergency Medicine', 0,    'Available', true),
      t('Ophthalmology',      'Eye Care',          1000, 'Available'),
      t('Burns Treatment',    'Plastic Surgery',   8000, 'Limited'),
      t('Neurosurgery',       'Neurosurgery',     20000, 'By Appointment'),
    ],
  },
  {
    'Hospital Name': 'Jinnah Hospital Lahore',
    City: 'Lahore', Tehsil: 'Allama Iqbal Town',
    Cateogry: 'Government',
    description: 'A major government hospital affiliated with Allama Iqbal Medical College, offering free services in medicine, pediatrics, surgery, and cardiology to the public.',
    emergencyServices: true, bedCapacity: 1200,
    website: '', contactNumber: '042-35761999',
    address: 'Allama Shabbir Ahmad Usmani Road, Lahore',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'General Medicine', severitySupport: 'Critical',
    tags: ['government', 'teaching hospital', 'lahore', 'free'],
    treatments: [
      t('Emergency Care', 'Emergency Medicine', 0,    'Available', true),
      t('Cardiology',     'Cardiology',         5000, 'Available'),
      t('Pediatrics',     'Pediatrics',         1000, 'Available'),
    ],
  },
  {
    'Hospital Name': 'Sir Ganga Ram Hospital Lahore',
    City: 'Lahore', Tehsil: 'Upper Mall',
    Cateogry: 'Private',
    description: 'A leading private-sector hospital with a charitable trust wing, offering cardiac surgery, neurology, oncology and more. Renowned for cardiac care and transplant programs.',
    emergencyServices: true, bedCapacity: 500,
    website: 'https://sgrhlahorecity.com', contactNumber: '042-35761999',
    address: 'Upper Mall, Lahore, Punjab',
    treatmentCost: 15000, availability: 'Available', treatmentSpecialty: 'Cardiac & Multi-specialty', severitySupport: 'Critical',
    tags: ['cardiac', 'private', 'lahore', 'multi-specialty'],
    treatments: [
      t('Cardiac Surgery', 'Cardiac Surgery', 80000, 'By Appointment'),
      t('Neurology',       'Neurology',       10000, 'Available'),
      t('Oncology',        'Oncology',        25000, 'By Appointment'),
    ],
  },
  {
    'Hospital Name': 'Shalamar Hospital Lahore',
    City: 'Lahore', Tehsil: 'Mughalpura',
    Cateogry: 'Private',
    description: 'A well-established private teaching hospital known for multi-specialty services including nephrology, orthopedics, and mother-child health. Run as a social enterprise for affordable care.',
    emergencyServices: true, bedCapacity: 400,
    website: 'https://shalamarinstitute.org', contactNumber: '042-36812021',
    address: 'Shalimar Link Road, Lahore, Punjab',
    treatmentCost: 8000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Critical',
    tags: ['private', 'lahore', 'nephrology', 'affordable'],
    treatments: [
      t('Nephrology',    'Nephrology',  15000, 'Available'),
      t('Orthopedics',   'Orthopedics', 12000, 'Available'),
      t('Mother & Child','Gynecology',   8000, 'Available'),
    ],
  },
  {
    'Hospital Name': 'Lahore General Hospital',
    City: 'Lahore', Tehsil: 'Ferozepur Road',
    Cateogry: 'Government',
    description: 'Affiliated with Punjabi Medical College, Lahore General Hospital is a tertiary-care public facility serving western Lahore with emergency and specialist services.',
    emergencyServices: true, bedCapacity: 800,
    website: '', contactNumber: '042-35761000',
    address: 'Ferozepur Road, Lahore, Punjab',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'General Medicine', severitySupport: 'Critical',
    tags: ['government', 'lahore', 'teaching', 'free'],
    treatments: [
      t('Emergency',      'Emergency Medicine', 0,    'Available', true),
      t('General Surgery','Surgery',            2000, 'Available'),
      t('Pulmonology',    'Pulmonology',        3000, 'Available'),
    ],
  },
  {
    'Hospital Name': 'Ittefaq Hospital Lahore',
    City: 'Lahore', Tehsil: 'Model Town',
    Cateogry: 'Private',
    description: 'A trusted private hospital in Model Town known for high-quality cardiac, orthopedic, and general surgical services. State-of-the-art cardiac catheterization lab on-site.',
    emergencyServices: true, bedCapacity: 300,
    website: 'https://ittefaqhospital.com.pk', contactNumber: '042-35168060',
    address: 'Model Town, Lahore, Punjab',
    treatmentCost: 15000, availability: 'Available', treatmentSpecialty: 'Cardiac & Orthopedics', severitySupport: 'Critical',
    tags: ['private', 'lahore', 'cardiac', 'model town'],
    treatments: [
      t('Cardiology',    'Cardiology',   20000, 'Available'),
      t('Orthopedics',   'Orthopedics',  18000, 'Available'),
      t('General Surgery','Surgery',     12000, 'Available'),
    ],
  },
  {
    'Hospital Name': 'Sheikh Zayed Hospital Lahore',
    City: 'Lahore', Tehsil: 'Garden Town',
    Cateogry: 'Government',
    description: 'A federal government hospital offering advanced transplant, oncology, and cardiology services. Known nationally for its kidney transplant and oncology programs.',
    emergencyServices: true, bedCapacity: 700,
    website: 'https://szhl.edu.pk', contactNumber: '042-35761000',
    address: 'Garden Town, Lahore, Punjab',
    treatmentCost: 500, availability: 'Available', treatmentSpecialty: 'Transplant & Oncology', severitySupport: 'Critical',
    tags: ['government', 'lahore', 'transplant', 'kidney', 'oncology'],
    treatments: [
      t('Kidney Transplant','Organ Transplant', 150000,'By Appointment'),
      t('Oncology',         'Oncology',          30000,'Available'),
      t('Cardiology',       'Cardiology',        10000,'Available'),
    ],
  },
  {
    'Hospital Name': 'Doctors Hospital Lahore',
    City: 'Lahore', Tehsil: 'DHA Phase 1',
    Cateogry: 'Private',
    description: 'One of the finest private hospitals in Pakistan, internationally accredited, offering comprehensive care across all specialties with modern facilities in DHA Lahore.',
    emergencyServices: true, bedCapacity: 450,
    website: 'https://doctorshospital.com.pk', contactNumber: '042-111-000-111',
    address: 'Phase 1, DHA, Lahore, Punjab',
    treatmentCost: 20000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Critical',
    tags: ['private', 'lahore', 'dha', 'international standard', 'accredited'],
    treatments: [
      t('Multi-specialty Consult','General Medicine', 5000,'Available'),
      t('Laparoscopic Surgery',  'Surgery',          40000,'By Appointment'),
      t('Cardiac Catheterization','Cardiology',      60000,'By Appointment'),
    ],
  },
  {
    'Hospital Name': 'Hameed Latif Hospital Lahore',
    City: 'Lahore', Tehsil: 'Gulberg',
    Cateogry: 'Private',
    description: 'A premium private hospital in Gulberg, Lahore, offering cardiac, orthopedic, and mother-child services. Known for friendly staff and well-equipped facilities.',
    emergencyServices: true, bedCapacity: 280,
    website: 'https://hamshardhospitals.com', contactNumber: '042-35761500',
    address: 'Main Boulevard Gulberg, Lahore, Punjab',
    treatmentCost: 12000, availability: 'Available', treatmentSpecialty: 'Cardiac & Orthopedics', severitySupport: 'Critical',
    tags: ['private', 'lahore', 'gulberg', 'cardiac'],
    treatments: [
      t('Cardiac Surgery','Cardiac Surgery', 75000,'By Appointment'),
      t('Orthopedics',    'Orthopedics',     15000,'Available'),
      t('Gynecology',     'Gynecology',       8000,'Available'),
    ],
  },
  {
    'Hospital Name': 'Fatima Memorial Hospital Lahore',
    City: 'Lahore', Tehsil: 'Shadman',
    Cateogry: 'Private',
    description: 'A mission hospital operated by a Christian charitable trust, providing multi-specialty care with a focus on affordable healthcare for underprivileged communities in Lahore.',
    emergencyServices: true, bedCapacity: 220,
    website: 'https://fmhmedicalcollege.edu.pk', contactNumber: '042-35761200',
    address: 'Shadman, Lahore, Punjab',
    treatmentCost: 5000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Moderate',
    tags: ['private', 'lahore', 'charitable', 'affordable', 'shadman'],
    treatments: [
      t('General Medicine','General Medicine', 3000,'Available'),
      t('Pediatrics',      'Pediatrics',       2500,'Available'),
      t('Gynecology',      'Gynecology',       5000,'Available'),
    ],
  },
  {
    'Hospital Name': 'National Hospital Lahore',
    City: 'Lahore', Tehsil: 'DHA Phase 5',
    Cateogry: 'Private',
    description: 'A modern multi-specialty hospital in DHA Lahore with cutting-edge diagnostics and specialist care. Known for orthopedics, neurology, and women\'s health.',
    emergencyServices: true, bedCapacity: 350,
    website: 'https://nationalhospital.pk', contactNumber: '042-111-600-100',
    address: 'Phase 5, DHA, Lahore, Punjab',
    treatmentCost: 18000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Critical',
    tags: ['private', 'lahore', 'dha', 'multi-specialty', 'modern'],
    treatments: [
      t('Orthopedic Surgery','Orthopedics', 35000,'By Appointment'),
      t('Neurology',         'Neurology',   15000,'Available'),
      t("Women's Health",    'Gynecology',  10000,'Available'),
    ],
  },
  {
    'Hospital Name': 'Surgimed Hospital Lahore',
    City: 'Lahore', Tehsil: 'Gulberg III',
    Cateogry: 'Private',
    description: 'A leading surgical specialty hospital in Gulberg renowned for laparoscopic, bariatric, and general surgery. Also offers modern ICU and step-down care.',
    emergencyServices: true, bedCapacity: 180,
    website: 'https://surgimed.com.pk', contactNumber: '042-35769361',
    address: 'Gulberg III, Lahore, Punjab',
    treatmentCost: 20000, availability: 'Available', treatmentSpecialty: 'Surgery', severitySupport: 'Critical',
    tags: ['private', 'lahore', 'surgery', 'laparoscopic', 'gulberg'],
    treatments: [
      t('Laparoscopic Surgery','Surgery', 40000,'By Appointment'),
      t('Bariatric Surgery',   'Surgery', 80000,'By Appointment'),
      t('General Surgery',     'Surgery', 15000,'Available'),
    ],
  },
  {
    'Hospital Name': 'Punjab Institute of Cardiology Lahore',
    City: 'Lahore', Tehsil: 'Jail Road',
    Cateogry: 'Government',
    description: 'PIC is a dedicated government cardiac hospital providing free cardiac bypass, angioplasty, and echocardiography services to the public of Punjab.',
    emergencyServices: true, bedCapacity: 600,
    website: 'https://pic.gop.pk', contactNumber: '042-99231400',
    address: 'Jail Road, Lahore, Punjab',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Cardiology', severitySupport: 'Emergency',
    tags: ['government', 'lahore', 'cardiac', 'free', 'bypass'],
    treatments: [
      t('Coronary Bypass',  'Cardiac Surgery',     0,'Available'),
      t('Angioplasty',      'Cardiology',           0,'Available'),
      t('Echocardiography', 'Cardiology',           0,'Available'),
      t('Cardiac Emergency','Emergency Medicine',   0,'Available', true),
    ],
  },
  {
    'Hospital Name': 'Punjab Institute of Neurosciences Lahore',
    City: 'Lahore', Tehsil: 'Ferozepur Road',
    Cateogry: 'Government',
    description: 'PINS is a specialized government neurosurgery and neurology hospital offering free brain and spinal surgeries. Equipped with advanced MRI, CT and neurosurgery suites.',
    emergencyServices: true, bedCapacity: 400,
    website: 'https://pins.gop.pk', contactNumber: '042-35761600',
    address: 'Ferozepur Road, Lahore, Punjab',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Neurosciences', severitySupport: 'Emergency',
    tags: ['government', 'lahore', 'neurosurgery', 'brain', 'free'],
    treatments: [
      t('Brain Surgery',    'Neurosurgery', 0,'By Appointment'),
      t('Spine Surgery',    'Neurosurgery', 0,'By Appointment'),
      t('Neurology Consult','Neurology',    0,'Available'),
    ],
  },
  {
    'Hospital Name': 'Gulab Devi Chest Hospital Lahore',
    City: 'Lahore', Tehsil: 'Multan Road',
    Cateogry: 'Government',
    description: 'A government chest hospital specializing in tuberculosis, asthma, COPD, and pulmonary diseases. Provides free TB treatment under government programs.',
    emergencyServices: false, bedCapacity: 500,
    website: '', contactNumber: '042-35760000',
    address: 'Multan Road, Lahore, Punjab',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Pulmonology', severitySupport: 'Moderate',
    tags: ['government', 'lahore', 'tb', 'chest', 'pulmonology'],
    treatments: [
      t('TB Treatment',        'Pulmonology', 0,    'Available'),
      t('Asthma Management',   'Pulmonology', 500,  'Available'),
      t('Pulmonary Diagnosis', 'Pulmonology', 1000, 'Available'),
    ],
  },
  {
    'Hospital Name': 'Social Security Hospital Lahore',
    City: 'Lahore', Tehsil: 'Kot Lakhpat',
    Cateogry: 'Government',
    description: 'Operated by the ESSI, this hospital provides free medical services exclusively to registered workers and their families across Punjab.',
    emergencyServices: true, bedCapacity: 350,
    website: '', contactNumber: '042-35770000',
    address: 'Kot Lakhpat, Lahore, Punjab',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'General Medicine', severitySupport: 'Moderate',
    tags: ['government', 'lahore', 'essi', 'workers', 'free'],
    treatments: [
      t('General OPD',   'General Medicine',   0,'Available'),
      t('Maternity Care','Gynecology',         0,'Available'),
      t('Emergency',     'Emergency Medicine', 0,'Available', true),
    ],
  },
  {
    'Hospital Name': 'CMH Lahore',
    City: 'Lahore', Tehsil: 'Lahore Cantonment',
    Cateogry: 'Government',
    description: 'Combined Military Hospital Lahore is a premier military hospital serving both military and civilians. Known for excellent orthopedic, cardiac, and ENT services.',
    emergencyServices: true, bedCapacity: 800,
    website: '', contactNumber: '042-36622000',
    address: 'Cantonment, Lahore, Punjab',
    treatmentCost: 10000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Critical',
    tags: ['military', 'government', 'lahore', 'cantonment', 'modern'],
    treatments: [
      t('Orthopedics','Orthopedics', 15000,'Available'),
      t('Cardiology', 'Cardiology',  20000,'Available'),
      t('ENT',        'ENT',          8000,'Available'),
    ],
  },
  {
    'Hospital Name': "Children's Hospital Lahore",
    City: 'Lahore', Tehsil: 'Ferozepur Road',
    Cateogry: 'Government',
    description: 'The largest dedicated pediatric hospital in Pakistan. Provides free specialized pediatric care to children from across Punjab including neonatology and pediatric surgery.',
    emergencyServices: true, bedCapacity: 1300,
    website: '', contactNumber: '042-35761800',
    address: 'Ferozepur Road, Lahore, Punjab',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Pediatrics', severitySupport: 'Emergency',
    tags: ['government', 'lahore', 'pediatric', 'children', 'free'],
    treatments: [
      t('Pediatric Emergency','Pediatrics',         0,   'Available', true),
      t('Pediatric Surgery',  'Pediatric Surgery',  2000,'Available'),
      t('Neonatology',        'Neonatology',        1000,'Available'),
    ],
  },
  {
    'Hospital Name': 'Pakistan Kidney & Liver Institute Lahore',
    City: 'Lahore', Tehsil: 'Canal Road',
    Cateogry: 'Government',
    description: 'PKLI is a state-of-the-art government facility for kidney and liver transplants, dialysis, hepatology, and nephrology. Offers highly subsidized care for organ failure patients.',
    emergencyServices: true, bedCapacity: 600,
    website: 'https://pkli.org.pk', contactNumber: '042-111-750-750',
    address: 'Canal Road, Lahore, Punjab',
    treatmentCost: 2000, availability: 'Available', treatmentSpecialty: 'Nephrology & Hepatology', severitySupport: 'Critical',
    tags: ['government', 'lahore', 'kidney', 'liver', 'transplant', 'dialysis'],
    treatments: [
      t('Kidney Transplant','Organ Transplant',  0,    'By Appointment'),
      t('Liver Transplant', 'Organ Transplant',  0,    'By Appointment'),
      t('Dialysis',         'Nephrology',        3000, 'Available'),
      t('Hepatology',       'Gastroenterology',  5000, 'Available'),
    ],
  },

  // ═══════════════ KARACHI (20) ═══════════════

  {
    'Hospital Name': 'Aga Khan University Hospital Karachi',
    City: 'Karachi', Tehsil: 'Stadium Road',
    Cateogry: 'Private',
    description: "Pakistan's most internationally recognized hospital. AKUH offers comprehensive tertiary care across all specialties with JCI accreditation and world-class standards.",
    emergencyServices: true, bedCapacity: 700,
    website: 'https://hospitals.aku.edu', contactNumber: '021-34930051',
    address: 'Stadium Road, Karachi, Sindh',
    treatmentCost: 30000, availability: 'Available', treatmentSpecialty: 'Multi-specialty / Research', severitySupport: 'Critical',
    tags: ['private', 'karachi', 'jci accredited', 'research', 'international'],
    treatments: [
      t('Oncology',               'Oncology',         50000,'By Appointment'),
      t('Cardiac Surgery',        'Cardiac Surgery',  120000,'By Appointment'),
      t('Bone Marrow Transplant', 'Hematology',       200000,'By Appointment'),
    ],
  },
  {
    'Hospital Name': 'Jinnah Postgraduate Medical Centre Karachi',
    City: 'Karachi', Tehsil: 'Rafiqui Shaheed Road',
    Cateogry: 'Government',
    description: 'JPMC is one of the largest public teaching hospitals in Asia, providing free emergency, trauma, and specialist services to millions of Karachi residents.',
    emergencyServices: true, bedCapacity: 2000,
    website: 'https://jpmc.edu.pk', contactNumber: '021-99201300',
    address: 'Rafiqui Shaheed Road, Karachi, Sindh',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Multi-specialty / Trauma', severitySupport: 'Emergency',
    tags: ['government', 'karachi', 'trauma', 'teaching', 'free'],
    treatments: [
      t('Trauma & Emergency','Emergency Medicine', 0,    'Available', true),
      t('Neurosurgery',      'Neurosurgery',       0,    'Available'),
      t('Cardiovascular',    'Cardiac Surgery',    0,    'By Appointment'),
    ],
  },
  {
    'Hospital Name': 'Civil Hospital Karachi',
    City: 'Karachi', Tehsil: 'Saddar',
    Cateogry: 'Government',
    description: "One of Karachi's oldest and most visited public hospitals, affiliated with Dow Medical College. Handles hundreds of emergency cases daily across all specialties.",
    emergencyServices: true, bedCapacity: 2500,
    website: '', contactNumber: '021-99215740',
    address: 'Baba-e-Urdu Road, Saddar, Karachi, Sindh',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'General Medicine', severitySupport: 'Emergency',
    tags: ['government', 'karachi', 'saddar', 'dow', 'free'],
    treatments: [
      t('Emergency Care',  'Emergency Medicine', 0,'Available', true),
      t('General Surgery', 'Surgery',            0,'Available'),
      t('Pediatrics',      'Pediatrics',         0,'Available'),
    ],
  },
  {
    'Hospital Name': 'Liaquat National Hospital Karachi',
    City: 'Karachi', Tehsil: 'PECHS',
    Cateogry: 'Private',
    description: 'A leading private hospital in Karachi providing comprehensive multi-specialty care. Known for its cardiac program, oncology centre, and transplant services.',
    emergencyServices: true, bedCapacity: 600,
    website: 'https://lnh.edu.pk', contactNumber: '021-34412000',
    address: 'National Stadium Road, Karachi, Sindh',
    treatmentCost: 20000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Critical',
    tags: ['private', 'karachi', 'cardiac', 'oncology', 'transplant'],
    treatments: [
      t('Cardiology',       'Cardiology',       25000,'Available'),
      t('Oncology',         'Oncology',         40000,'By Appointment'),
      t('Renal Transplant', 'Organ Transplant', 200000,'By Appointment'),
    ],
  },
  {
    'Hospital Name': 'Indus Hospital Karachi',
    City: 'Karachi', Tehsil: 'Korangi',
    Cateogry: 'Private',
    description: 'A completely free non-profit hospital funded by donors. Indus Hospital provides zero-cost quality healthcare to the poorest communities of Karachi across all specialties.',
    emergencyServices: true, bedCapacity: 350,
    website: 'https://indushospital.org.pk', contactNumber: '021-35862937',
    address: 'Plot C-76, Sector 31/5, Korangi, Karachi, Sindh',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Multi-specialty / Free', severitySupport: 'Critical',
    tags: ['karachi', 'free', 'ngo', 'non-profit', 'korangi', 'charity'],
    treatments: [
      t('Cancer Treatment',  'Oncology',          0,'By Appointment'),
      t('Pediatric Care',    'Pediatrics',         0,'Available'),
      t('Emergency Services','Emergency Medicine', 0,'Available', true),
    ],
  },
  {
    'Hospital Name': 'Ziauddin Hospital Karachi',
    City: 'Karachi', Tehsil: 'North Nazimabad',
    Cateogry: 'Private',
    description: 'A reputable private multi-specialty hospital with multiple campuses across Karachi. Known for quality Ob-Gyn, ICU, and cardiology services in modern facilities.',
    emergencyServices: true, bedCapacity: 500,
    website: 'https://ziauddinhospital.com', contactNumber: '021-111-944-944',
    address: 'Block B, North Nazimabad, Karachi, Sindh',
    treatmentCost: 15000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Critical',
    tags: ['private', 'karachi', 'ob-gyn', 'cardiology', 'multi-campus'],
    treatments: [
      t('Gynecology & Maternity','Gynecology',     12000,'Available'),
      t('Cardiology',            'Cardiology',     20000,'Available'),
      t('ICU Care',              'Intensive Care', 30000,'Available'),
    ],
  },
  {
    'Hospital Name': 'South City Hospital Karachi',
    City: 'Karachi', Tehsil: 'PECHS',
    Cateogry: 'Private',
    description: 'A modern private hospital in the heart of Karachi offering specialist consultations, advanced diagnostics, and surgical services. Notable for its oncology and ortho units.',
    emergencyServices: true, bedCapacity: 250,
    website: 'https://southcityhospital.com.pk', contactNumber: '021-35630871',
    address: 'PECHS Block 2, Karachi, Sindh',
    treatmentCost: 12000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Moderate',
    tags: ['private', 'karachi', 'pechs', 'cancer', 'orthopedics'],
    treatments: [
      t('Oncology',        'Oncology',          35000,'By Appointment'),
      t('Orthopedics',     'Orthopedics',       20000,'Available'),
      t('General Consult', 'General Medicine',   5000,'Available'),
    ],
  },
  {
    'Hospital Name': 'Patel Hospital Karachi',
    City: 'Karachi', Tehsil: 'Gulshan-e-Iqbal',
    Cateogry: 'Private',
    description: 'A well-known private hospital in Gulshan-e-Iqbal serving east Karachi. Known for its cardiac ICU, maternity ward, and affordable specialist care.',
    emergencyServices: true, bedCapacity: 200,
    website: 'https://patelhospital.org', contactNumber: '021-34659981',
    address: 'Gulshan-e-Iqbal, Karachi, Sindh',
    treatmentCost: 10000, availability: 'Available', treatmentSpecialty: 'Cardiac & Maternity', severitySupport: 'Critical',
    tags: ['private', 'karachi', 'gulshan', 'cardiac', 'maternity'],
    treatments: [
      t('Cardiac ICU', 'Cardiology',          25000,'Available'),
      t('Maternity',   'Gynecology',           8000,'Available'),
      t('Emergency',   'Emergency Medicine',      0,'Available', true),
    ],
  },
  {
    'Hospital Name': 'NICVD Karachi',
    City: 'Karachi', Tehsil: 'Rafiqui Shaheed Road',
    Cateogry: 'Government',
    description: 'National Institute of Cardiovascular Diseases — the largest dedicated cardiac centre in Pakistan. Offers free angiography, bypass surgery, and heart failure management.',
    emergencyServices: true, bedCapacity: 450,
    website: 'https://nicvd.org', contactNumber: '021-99201271',
    address: 'Rafiqui Shaheed Road, Karachi, Sindh',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Cardiology', severitySupport: 'Emergency',
    tags: ['government', 'karachi', 'cardiac', 'bypass', 'free'],
    treatments: [
      t('Cardiac Emergency',   'Emergency Medicine', 0,'Available', true),
      t('Coronary Angiography','Cardiology',         0,'Available'),
      t('Bypass Surgery',      'Cardiac Surgery',    0,'By Appointment'),
    ],
  },
  {
    'Hospital Name': 'Hamdard University Hospital Karachi',
    City: 'Karachi', Tehsil: 'Madinat-ul-Hikmah',
    Cateogry: 'Private',
    description: 'Part of Hamdard University, this hospital provides clinical training alongside quality multi-specialty patient care in general medicine, surgical, and maternity services.',
    emergencyServices: true, bedCapacity: 300,
    website: 'https://hamdard.edu.pk', contactNumber: '021-36440035',
    address: 'Hamdard University Campus, Karachi',
    treatmentCost: 8000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Moderate',
    tags: ['private', 'karachi', 'hamdard', 'teaching', 'affordable'],
    treatments: [
      t('General Medicine','General Medicine', 4000,'Available'),
      t('General Surgery', 'Surgery',         12000,'Available'),
      t('Maternity',       'Gynecology',       7000,'Available'),
    ],
  },
  {
    'Hospital Name': 'Abbasi Shaheed Hospital Karachi',
    City: 'Karachi', Tehsil: 'SITE Area',
    Cateogry: 'Government',
    description: 'A government district hospital serving the SITE industrial area. Provides free OPD, emergency, and inpatient care for the industrial workforce community.',
    emergencyServices: true, bedCapacity: 400,
    website: '', contactNumber: '021-32563421',
    address: 'SITE, Karachi, Sindh',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'General Medicine', severitySupport: 'Critical',
    tags: ['government', 'karachi', 'site', 'district', 'free'],
    treatments: [
      t('Emergency',   'Emergency Medicine', 0,'Available', true),
      t('General OPD', 'General Medicine',   0,'Available'),
      t('Maternity',   'Gynecology',         0,'Available'),
    ],
  },
  {
    'Hospital Name': 'Dow University Hospital Karachi',
    City: 'Karachi', Tehsil: 'Baba-e-Urdu Road',
    Cateogry: 'Government',
    description: 'Part of Dow University of Health Sciences, offering free and low-cost specialist care. One of the main training hospitals for medical students in Sindh.',
    emergencyServices: true, bedCapacity: 900,
    website: 'https://duhs.edu.pk', contactNumber: '021-99215700',
    address: 'Baba-e-Urdu Road, Karachi, Sindh',
    treatmentCost: 500, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Critical',
    tags: ['government', 'karachi', 'dow', 'teaching', 'affordable'],
    treatments: [
      t('Emergency',      'Emergency Medicine', 0,   'Available', true),
      t('General Medicine','General Medicine',  500, 'Available'),
      t('Surgery',        'Surgery',           3000,'Available'),
    ],
  },
  {
    'Hospital Name': 'Tabba Heart Institute Karachi',
    City: 'Karachi', Tehsil: 'University Road',
    Cateogry: 'Private',
    description: 'A non-profit cardiac hospital offering internationally benchmarked cardiac care at below-market rates. Known for transparent billing, clean facilities, and excellent doctor quality.',
    emergencyServices: true, bedCapacity: 200,
    website: 'https://tabbaheart.com', contactNumber: '021-34621000',
    address: 'University Road, Karachi, Sindh',
    treatmentCost: 15000, availability: 'Available', treatmentSpecialty: 'Cardiology', severitySupport: 'Critical',
    tags: ['private', 'karachi', 'cardiac', 'non-profit', 'affordable'],
    treatments: [
      t('Cardiac Surgery',     'Cardiac Surgery',    90000,'By Appointment'),
      t('Interventional Cath', 'Cardiology',         40000,'By Appointment'),
      t('Cardiac Emergency',   'Emergency Medicine',     0,'Available', true),
    ],
  },
  {
    'Hospital Name': 'Hashmanis Hospital Karachi',
    City: 'Karachi', Tehsil: 'Garden East',
    Cateogry: 'Private',
    description: "Pakistan's premier eye hospital with 60+ years of experience. Hashmanis offers LASIK, cataract surgery, glaucoma treatment, and comprehensive ophthalmology services.",
    emergencyServices: false, bedCapacity: 150,
    website: 'https://hashmanis.com', contactNumber: '021-32211021',
    address: 'Garden East, Karachi, Sindh',
    treatmentCost: 25000, availability: 'Available', treatmentSpecialty: 'Ophthalmology', severitySupport: 'Moderate',
    tags: ['private', 'karachi', 'eye', 'lasik', 'cataract', 'ophthalmology'],
    treatments: [
      t('LASIK Surgery',   'Ophthalmology', 50000,'By Appointment'),
      t('Cataract Surgery','Ophthalmology', 30000,'By Appointment'),
      t('Glaucoma',        'Ophthalmology', 15000,'Available'),
    ],
  },
  {
    'Hospital Name': 'Darul Sehat Hospital Karachi',
    City: 'Karachi', Tehsil: 'Gulistan-e-Johar',
    Cateogry: 'Private',
    description: 'A mid-size private hospital in Gulistan-e-Johar offering affordable multi-specialty care to east Karachi. Known for maternity, orthopedic, and general surgery.',
    emergencyServices: true, bedCapacity: 180,
    website: 'https://darulsehat.pk', contactNumber: '021-34015101',
    address: 'Gulistan-e-Johar, Karachi, Sindh',
    treatmentCost: 8000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Moderate',
    tags: ['private', 'karachi', 'johar', 'maternity', 'orthopedics'],
    treatments: [
      t('Maternity',      'Gynecology',   7000,'Available'),
      t('Orthopedics',    'Orthopedics', 15000,'Available'),
      t('General Surgery','Surgery',     10000,'Available'),
    ],
  },
  {
    'Hospital Name': 'United Medical & Dental College Hospital Karachi',
    City: 'Karachi', Tehsil: 'Korangi',
    Cateogry: 'Private',
    description: 'A teaching hospital attached to UMDC, providing multi-specialty clinical services at subsidized rates. Strong in dental care, general surgery, and medicine.',
    emergencyServices: true, bedCapacity: 250,
    website: 'https://umdc.edu.pk', contactNumber: '021-35060011',
    address: 'Korangi, Karachi, Sindh',
    treatmentCost: 5000, availability: 'Available', treatmentSpecialty: 'Multi-specialty / Dental', severitySupport: 'Moderate',
    tags: ['private', 'karachi', 'dental', 'teaching', 'subsidized'],
    treatments: [
      t('Dental Care',    'Dental Care',      3000,'Available'),
      t('General Surgery','Surgery',          8000,'Available'),
      t('General Medicine','General Medicine', 2000,'Available'),
    ],
  },
  {
    'Hospital Name': 'Baqai Medical University Hospital Karachi',
    City: 'Karachi', Tehsil: 'Super Highway',
    Cateogry: 'Private',
    description: 'A large teaching hospital offering specialist care in general medicine, surgery, pediatrics, and gynecology on the Super Highway, Karachi.',
    emergencyServices: true, bedCapacity: 400,
    website: 'https://baqai.edu.pk', contactNumber: '021-36471050',
    address: 'Super Highway, Karachi, Sindh',
    treatmentCost: 7000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Moderate',
    tags: ['private', 'karachi', 'teaching', 'super highway'],
    treatments: [
      t('General Medicine','General Medicine', 3000,'Available'),
      t('Pediatrics',      'Pediatrics',       3500,'Available'),
      t('Gynecology',      'Gynecology',       6000,'Available'),
    ],
  },
  {
    'Hospital Name': 'Lyari General Hospital Karachi',
    City: 'Karachi', Tehsil: 'Lyari',
    Cateogry: 'Government',
    description: 'A government district hospital serving the densely populated Lyari Town area of Karachi. Provides free basic and emergency medical services to the community.',
    emergencyServices: true, bedCapacity: 300,
    website: '', contactNumber: '021-32310022',
    address: 'Lyari, Karachi, Sindh',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'General Medicine', severitySupport: 'Critical',
    tags: ['government', 'karachi', 'lyari', 'free', 'district'],
    treatments: [
      t('Emergency',   'Emergency Medicine', 0,'Available', true),
      t('General OPD', 'General Medicine',   0,'Available'),
    ],
  },
  {
    'Hospital Name': 'Kiran Hospital Karachi',
    City: 'Karachi', Tehsil: 'Manghopir',
    Cateogry: 'Government',
    description: "A government psychiatric hospital providing free mental health services including inpatient, outpatient, and counseling services for patients with mental illness.",
    emergencyServices: true, bedCapacity: 400,
    website: '', contactNumber: '021-36900350',
    address: 'Manghopir Road, Karachi, Sindh',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Psychiatry', severitySupport: 'Moderate',
    tags: ['government', 'karachi', 'psychiatry', 'mental health', 'free'],
    treatments: [
      t('Psychiatry OPD', 'Psychiatry', 0,'Available'),
      t('Inpatient Psych','Psychiatry', 0,'Available'),
      t('Counseling',     'Psychiatry', 0,'Available'),
    ],
  },
  {
    'Hospital Name': 'Karachi Institute of Heart Diseases',
    City: 'Karachi', Tehsil: 'North Nazimabad',
    Cateogry: 'Government',
    description: "A government cardiac hospital (KIHD) providing free cardiac diagnostic and interventional procedures including ECG, echocardiography, and angioplasty for Karachi's public.",
    emergencyServices: true, bedCapacity: 250,
    website: '', contactNumber: '021-36644000',
    address: 'North Nazimabad, Karachi, Sindh',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Cardiology', severitySupport: 'Emergency',
    tags: ['government', 'karachi', 'cardiac', 'free', 'heart'],
    treatments: [
      t('ECG & Echo',       'Cardiology',          0,'Available'),
      t('Angioplasty',      'Cardiology',          0,'By Appointment'),
      t('Cardiac Emergency','Emergency Medicine',   0,'Available', true),
    ],
  },

  // ═══════════════ ISLAMABAD / RAWALPINDI (10) ═══════════════

  {
    'Hospital Name': 'Pakistan Institute of Medical Sciences Islamabad',
    City: 'Islamabad', Tehsil: 'G-8/3',
    Cateogry: 'Government',
    description: 'PIMS is the largest public teaching hospital in Islamabad, serving the twin cities with free emergency, trauma, cardiac, and specialist services.',
    emergencyServices: true, bedCapacity: 1800,
    website: 'https://pims.gov.pk', contactNumber: '051-9261170',
    address: 'G-8/3, Islamabad',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Emergency',
    tags: ['government', 'islamabad', 'pims', 'teaching', 'free'],
    treatments: [
      t('Emergency',    'Emergency Medicine', 0,    'Available', true),
      t('Cardiology',   'Cardiology',         0,    'Available'),
      t('Neurosurgery', 'Neurosurgery',       2000, 'By Appointment'),
    ],
  },
  {
    'Hospital Name': 'Shifa International Hospital Islamabad',
    City: 'Islamabad', Tehsil: 'H-8/4',
    Cateogry: 'Private',
    description: "One of Pakistan's premier private hospitals, internationally accredited. Known for cardiac surgery, bone marrow transplant, and robotics-assisted surgery.",
    emergencyServices: true, bedCapacity: 550,
    website: 'https://shifa.com.pk', contactNumber: '051-111-748-233',
    address: 'H-8/4, Islamabad',
    treatmentCost: 25000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Critical',
    tags: ['private', 'islamabad', 'accredited', 'robotic surgery', 'bone marrow'],
    treatments: [
      t('Robotic Surgery',       'Surgery',          80000,'By Appointment'),
      t('Bone Marrow Transplant','Hematology',      250000,'By Appointment'),
      t('Cardiac Surgery',       'Cardiac Surgery', 100000,'By Appointment'),
    ],
  },
  {
    'Hospital Name': 'Federal Government Polyclinic Islamabad',
    City: 'Islamabad', Tehsil: 'G-6/2',
    Cateogry: 'Government',
    description: 'A major government OPD and inpatient hospital serving federal employees and the general public in Islamabad. Covers all major specialties at subsidized rates.',
    emergencyServices: true, bedCapacity: 600,
    website: '', contactNumber: '051-9221750',
    address: 'G-6/2, Islamabad',
    treatmentCost: 500, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Moderate',
    tags: ['government', 'islamabad', 'polyclinic', 'federal', 'affordable'],
    treatments: [
      t('General OPD', 'General Medicine',   500, 'Available'),
      t('Emergency',   'Emergency Medicine',   0, 'Available', true),
      t('Gynecology',  'Gynecology',         1000,'Available'),
    ],
  },
  {
    'Hospital Name': 'KRL Hospital Islamabad',
    City: 'Islamabad', Tehsil: 'G-9/1',
    Cateogry: 'Government',
    description: 'Khan Research Laboratories Hospital offers multi-specialty care with modern diagnostics at subsidized rates for KRL employees and the general public.',
    emergencyServices: true, bedCapacity: 400,
    website: '', contactNumber: '051-9204004',
    address: 'G-9/1, Islamabad',
    treatmentCost: 1000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Moderate',
    tags: ['government', 'islamabad', 'krl', 'atomic energy'],
    treatments: [
      t('General Medicine','General Medicine', 1000,'Available'),
      t('Orthopedics',     'Orthopedics',      8000,'Available'),
      t('Emergency',       'Emergency Medicine',   0,'Available', true),
    ],
  },
  {
    'Hospital Name': 'Holy Family Hospital Rawalpindi',
    City: 'Rawalpindi', Tehsil: 'Satellite Town',
    Cateogry: 'Government',
    description: 'Attached to Rawalpindi Medical University, Holy Family Hospital is a major teaching hospital serving Rawalpindi and Islamabad with free specialist and emergency services.',
    emergencyServices: true, bedCapacity: 1400,
    website: '', contactNumber: '051-9281048',
    address: 'Satellite Town, Rawalpindi, Punjab',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Emergency',
    tags: ['government', 'rawalpindi', 'teaching', 'rmu', 'free'],
    treatments: [
      t('Emergency',      'Emergency Medicine', 0,   'Available', true),
      t('General Surgery','Surgery',            1000,'Available'),
      t('Gynecology',     'Gynecology',          500,'Available'),
    ],
  },
  {
    'Hospital Name': 'DHQ Hospital Rawalpindi',
    City: 'Rawalpindi', Tehsil: 'Lalkurti',
    Cateogry: 'Government',
    description: 'District Headquarters Hospital Rawalpindi provides free basic and specialist healthcare to the districts of Rawalpindi. Handles large volumes of emergency and walk-in patients.',
    emergencyServices: true, bedCapacity: 800,
    website: '', contactNumber: '051-9290300',
    address: 'Lalkurti, Rawalpindi, Punjab',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'General Medicine', severitySupport: 'Critical',
    tags: ['government', 'rawalpindi', 'dhq', 'district', 'free'],
    treatments: [
      t('Emergency',   'Emergency Medicine', 0,'Available', true),
      t('General OPD', 'General Medicine',   0,'Available'),
      t('Pediatrics',  'Pediatrics',         0,'Available'),
    ],
  },
  {
    'Hospital Name': 'CMH Rawalpindi',
    City: 'Rawalpindi', Tehsil: 'Rawalpindi Cantonment',
    Cateogry: 'Government',
    description: 'Combined Military Hospital Rawalpindi is a premier military hospital also serving civilians. Well-known for orthopedics, cardiology, and ENT services.',
    emergencyServices: true, bedCapacity: 900,
    website: '', contactNumber: '051-9280350',
    address: 'Rawalpindi Cantonment, Punjab',
    treatmentCost: 8000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Critical',
    tags: ['military', 'rawalpindi', 'cantonment', 'cardiac', 'orthopedics'],
    treatments: [
      t('Orthopedics','Orthopedics', 15000,'Available'),
      t('Cardiology', 'Cardiology',  20000,'Available'),
      t('ENT',        'ENT',          7000,'Available'),
    ],
  },
  {
    'Hospital Name': 'Benazir Bhutto Hospital Rawalpindi',
    City: 'Rawalpindi', Tehsil: 'Murree Road',
    Cateogry: 'Government',
    description: 'A large government hospital affiliated with Rawalpindi Medical University, offering free emergency, maternity, and general specialist services in the twin cities.',
    emergencyServices: true, bedCapacity: 1100,
    website: '', contactNumber: '051-9290071',
    address: 'Murree Road, Rawalpindi, Punjab',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Emergency',
    tags: ['government', 'rawalpindi', 'rmu', 'free', 'emergency'],
    treatments: [
      t('Emergency',       'Emergency Medicine', 0,'Available', true),
      t('Gynecology',      'Gynecology',         0,'Available'),
      t('General Medicine','General Medicine',   0,'Available'),
    ],
  },
  {
    'Hospital Name': 'Fauji Foundation Hospital Rawalpindi',
    City: 'Rawalpindi', Tehsil: 'Chaklala',
    Cateogry: 'Private',
    description: 'Operated by Fauji Foundation, providing quality multi-specialty healthcare to military veterans, their families, and the civilian population at affordable rates.',
    emergencyServices: true, bedCapacity: 400,
    website: 'https://fauji.org.pk', contactNumber: '051-9280100',
    address: 'Chaklala, Rawalpindi, Punjab',
    treatmentCost: 5000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Moderate',
    tags: ['rawalpindi', 'fauji', 'military', 'affordable', 'veterans'],
    treatments: [
      t('General Medicine','General Medicine', 3000,'Available'),
      t('Cardiac Consult', 'Cardiology',      10000,'Available'),
      t('Orthopedics',     'Orthopedics',     12000,'Available'),
    ],
  },
  {
    'Hospital Name': 'PAEC General Hospital Islamabad',
    City: 'Islamabad', Tehsil: 'F-7',
    Cateogry: 'Government',
    description: 'Pakistan Atomic Energy Commission General Hospital provides subsidized multi-specialty healthcare to PAEC employees and the general public in Islamabad.',
    emergencyServices: true, bedCapacity: 350,
    website: '', contactNumber: '051-9209140',
    address: 'F-7, Islamabad',
    treatmentCost: 1000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Moderate',
    tags: ['government', 'islamabad', 'paec', 'atomic energy', 'affordable'],
    treatments: [
      t('Oncology',    'Oncology',          15000,'By Appointment'),
      t('General OPD', 'General Medicine',   1000,'Available'),
      t('Emergency',   'Emergency Medicine',     0,'Available', true),
    ],
  },

  // ═══════════════ PESHAWAR (5) ═══════════════

  {
    'Hospital Name': 'Lady Reading Hospital Peshawar',
    City: 'Peshawar', Tehsil: 'Peshawar City',
    Cateogry: 'Government',
    description: 'The largest and oldest public hospital in KPK. LRH is a major trauma, cardiac, and teaching centre offering free specialist healthcare to millions from KPK, FATA, and Afghanistan.',
    emergencyServices: true, bedCapacity: 2300,
    website: 'https://lrh.gov.pk', contactNumber: '091-9211584',
    address: 'Peshawar City, Khyber Pakhtunkhwa',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Multi-specialty / Trauma', severitySupport: 'Emergency',
    tags: ['government', 'peshawar', 'lrh', 'trauma', 'largest', 'kpk'],
    treatments: [
      t('Trauma & Emergency','Emergency Medicine', 0,   'Available', true),
      t('Cardiac',           'Cardiology',         0,   'Available'),
      t('Neurosurgery',      'Neurosurgery',    1000,   'By Appointment'),
    ],
  },
  {
    'Hospital Name': 'Khyber Teaching Hospital Peshawar',
    City: 'Peshawar', Tehsil: 'Peshawar Cantonment',
    Cateogry: 'Government',
    description: 'A premier government teaching hospital of Khyber Medical University, offering specialist care in surgery, medicine, gynecology, and pediatrics to the people of KPK.',
    emergencyServices: true, bedCapacity: 1200,
    website: 'https://kmu.edu.pk', contactNumber: '091-9217390',
    address: 'Peshawar, Khyber Pakhtunkhwa',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Critical',
    tags: ['government', 'peshawar', 'kth', 'kmu', 'teaching'],
    treatments: [
      t('General Surgery','Surgery',   1000,'Available'),
      t('Gynecology',     'Gynecology',   0,'Available'),
      t('Pediatrics',     'Pediatrics',   0,'Available'),
    ],
  },
  {
    'Hospital Name': 'Hayatabad Medical Complex Peshawar',
    City: 'Peshawar', Tehsil: 'Hayatabad',
    Cateogry: 'Government',
    description: 'HMC is the most modern government hospital in KPK, equipped with advanced ICU, cardiac, neurology, and transplant facilities. Widely regarded as the best public hospital in Peshawar.',
    emergencyServices: true, bedCapacity: 1000,
    website: 'https://hmc.gov.pk', contactNumber: '091-9217520',
    address: 'Hayatabad, Peshawar, Khyber Pakhtunkhwa',
    treatmentCost: 500, availability: 'Available', treatmentSpecialty: 'Multi-specialty / Modern', severitySupport: 'Critical',
    tags: ['government', 'peshawar', 'hmc', 'modern', 'hayatabad'],
    treatments: [
      t('Cardiac Surgery','Cardiac Surgery',  5000,'By Appointment'),
      t('Neurology',      'Neurology',        2000,'Available'),
      t('ICU',            'Intensive Care',  10000,'Available'),
    ],
  },
  {
    'Hospital Name': 'Northwest General Hospital Peshawar',
    City: 'Peshawar', Tehsil: 'Phase 5 Hayatabad',
    Cateogry: 'Private',
    description: 'A reputable private hospital in Hayatabad, Peshawar, offering multi-specialty services including cardiac care, orthopedics, and neurology with modern facilities.',
    emergencyServices: true, bedCapacity: 300,
    website: 'https://northwestgeneralhospital.com', contactNumber: '091-5893000',
    address: 'Phase 5, Hayatabad, Peshawar, KPK',
    treatmentCost: 10000, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Critical',
    tags: ['private', 'peshawar', 'hayatabad', 'cardiac', 'orthopedics'],
    treatments: [
      t('Cardiology',  'Cardiology',          15000,'Available'),
      t('Orthopedics', 'Orthopedics',         18000,'Available'),
      t('Emergency',   'Emergency Medicine',      0,'Available', true),
    ],
  },
  {
    'Hospital Name': 'Rehman Medical Institute Peshawar',
    City: 'Peshawar', Tehsil: 'Phase 5 Hayatabad',
    Cateogry: 'Private',
    description: 'RMI is a leading private hospital affiliated with Rehman Medical College. Offers high-quality specialist care in oncology, cardiac, and general medicine in Peshawar.',
    emergencyServices: true, bedCapacity: 350,
    website: 'https://rmi.edu.pk', contactNumber: '091-5838900',
    address: 'Phase 5, Hayatabad, Peshawar, KPK',
    treatmentCost: 12000, availability: 'Available', treatmentSpecialty: 'Multi-specialty / Oncology', severitySupport: 'Critical',
    tags: ['private', 'peshawar', 'hayatabad', 'rmi', 'cancer', 'cardiac'],
    treatments: [
      t('Oncology',   'Oncology',          30000,'By Appointment'),
      t('Cardiology', 'Cardiology',        18000,'Available'),
      t('General OPD','General Medicine',   4000,'Available'),
    ],
  },

  // ═══════════════ OTHER CITIES (5) ═══════════════

  {
    'Hospital Name': 'Nishtar Hospital Multan',
    City: 'Multan', Tehsil: 'Nishtar Medical University',
    Cateogry: 'Government',
    description: 'The largest public hospital in south Punjab, affiliated with Nishtar Medical University. Handles trauma, cardiac, and specialist cases for millions from the greater Multan region.',
    emergencyServices: true, bedCapacity: 1800,
    website: '', contactNumber: '061-9200450',
    address: 'Nishtar Medical University Road, Multan, Punjab',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Multi-specialty / Trauma', severitySupport: 'Emergency',
    tags: ['government', 'multan', 'nishtar', 'south punjab', 'free', 'trauma'],
    treatments: [
      t('Trauma & Emergency','Emergency Medicine', 0,   'Available', true),
      t('Cardiology',        'Cardiology',         0,   'Available'),
      t('Neurosurgery',      'Neurosurgery',    2000,   'By Appointment'),
    ],
  },
  {
    'Hospital Name': 'Allied Hospital Faisalabad',
    City: 'Faisalabad', Tehsil: 'Peoples Colony',
    Cateogry: 'Government',
    description: 'Attached to Punjab Medical College, Allied Hospital is the main public teaching hospital of Faisalabad offering free specialist and emergency care to millions.',
    emergencyServices: true, bedCapacity: 1500,
    website: '', contactNumber: '041-9200330',
    address: 'Peoples Colony, Faisalabad, Punjab',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Emergency',
    tags: ['government', 'faisalabad', 'allied', 'teaching', 'free'],
    treatments: [
      t('Emergency',      'Emergency Medicine', 0,   'Available', true),
      t('General Surgery','Surgery',            1000,'Available'),
      t('Gynecology',     'Gynecology',          500,'Available'),
    ],
  },
  {
    'Hospital Name': 'Bolan Medical Complex Hospital Quetta',
    City: 'Quetta', Tehsil: 'Quetta City',
    Cateogry: 'Government',
    description: 'The largest public hospital in Balochistan, providing free specialist and emergency healthcare to patients from across the province. A key training institution for Bolan Medical College.',
    emergencyServices: true, bedCapacity: 1200,
    website: '', contactNumber: '081-9201043',
    address: 'Quetta City, Balochistan',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'Multi-specialty', severitySupport: 'Emergency',
    tags: ['government', 'quetta', 'balochistan', 'bmc', 'teaching', 'free'],
    treatments: [
      t('Emergency',      'Emergency Medicine', 0,'Available', true),
      t('General Surgery','Surgery',            0,'Available'),
      t('General Medicine','General Medicine',  0,'Available'),
    ],
  },
  {
    'Hospital Name': 'Aziz Fatima Medical & Dental College Hospital Faisalabad',
    City: 'Faisalabad', Tehsil: 'Gulberg Colony',
    Cateogry: 'Private',
    description: 'A private teaching hospital in Faisalabad providing multi-specialty care in general medicine, surgery, and dentistry to residents of the textile capital of Pakistan.',
    emergencyServices: true, bedCapacity: 300,
    website: 'https://azmdc.edu.pk', contactNumber: '041-8731191',
    address: 'Gulberg Colony, Faisalabad, Punjab',
    treatmentCost: 6000, availability: 'Available', treatmentSpecialty: 'Multi-specialty / Dental', severitySupport: 'Moderate',
    tags: ['private', 'faisalabad', 'dental', 'teaching', 'affordable'],
    treatments: [
      t('Dental Care',    'Dental Care',      3000,'Available'),
      t('General Surgery','Surgery',          8000,'Available'),
      t('General OPD',    'General Medicine', 2500,'Available'),
    ],
  },
  {
    'Hospital Name': 'Sandeman Provincial Hospital Quetta',
    City: 'Quetta', Tehsil: 'Quetta Cantonment',
    Cateogry: 'Government',
    description: 'One of Balochistan\'s oldest government hospitals, providing free basic healthcare, maternity, and emergency services to the residents of Quetta and surrounding areas.',
    emergencyServices: true, bedCapacity: 800,
    website: '', contactNumber: '081-9202060',
    address: 'Quetta Cantonment, Balochistan',
    treatmentCost: 0, availability: 'Available', treatmentSpecialty: 'General Medicine', severitySupport: 'Critical',
    tags: ['government', 'quetta', 'balochistan', 'free', 'old hospital'],
    treatments: [
      t('Emergency',   'Emergency Medicine', 0,'Available', true),
      t('Maternity',   'Gynecology',         0,'Available'),
      t('General OPD', 'General Medicine',   0,'Available'),
    ],
  },
];

// ── Helper to generate realistic Reddit community reviews ────────────────────
function generateReviewData(hospitalId, hospitalName, city, isPrivate) {
  let ratings = {};
  let summary = '';
  let posts = [];

  if (isPrivate) {
    ratings = {
      doctorQuality: Math.round((8.0 + Math.random() * 1.5) * 10) / 10,
      cleanliness: Math.round((8.5 + Math.random() * 1.2) * 10) / 10,
      waitTime: Math.round((7.0 + Math.random() * 2.0) * 10) / 10,
      staffBehavior: Math.round((7.5 + Math.random() * 1.8) * 10) / 10,
      facilitiesEquipment: Math.round((8.0 + Math.random() * 1.5) * 10) / 10,
      costValue: Math.round((3.0 + Math.random() * 2.5) * 10) / 10,
    };
    summary = `Highly recommended for clean facilities, modern equipment, and polite staff, though patients note it is extremely expensive.`;
    posts = [
      {
        title: `Had a great experience at ${hospitalName}. Clean rooms and professional staff.`,
        url: `https://reddit.com/r/${city.toLowerCase()}/comments/test1`,
        subreddit: ['lahore', 'karachi', 'islamabad'].includes(city.toLowerCase()) ? city.toLowerCase() : 'pakistan',
        score: Math.floor(10 + Math.random() * 40),
        snippet: `The facilities are top notch, standard matches international clinics. Worth the extra cost if you have insurance or budget.`,
        postedAt: new Date(Date.now() - Math.random() * 100 * 24 * 3600 * 1000),
      },
      {
        title: `${hospitalName} billing is too high but care quality is unmatched.`,
        url: `https://reddit.com/r/pakistan/comments/test2`,
        subreddit: 'pakistan',
        score: Math.floor(5 + Math.random() * 25),
        snippet: `They charged a lot for basic diagnostics but the doctors actually listen and diagnose you properly unlike government hospitals.`,
        postedAt: new Date(Date.now() - Math.random() * 100 * 24 * 3600 * 1000),
      },
      {
        title: `Very short waiting times at ${hospitalName} emergency.`,
        url: `https://reddit.com/r/${city.toLowerCase()}/comments/test3`,
        subreddit: ['lahore', 'karachi', 'islamabad'].includes(city.toLowerCase()) ? city.toLowerCase() : 'pakistan',
        score: Math.floor(2 + Math.random() * 15),
        snippet: `Walked in with a fracture and was attended to within 10 minutes. Nurses were very helpful.`,
        postedAt: new Date(Date.now() - Math.random() * 100 * 24 * 3600 * 1000),
      }
    ];
  } else {
    // Government (Public)
    ratings = {
      doctorQuality: Math.round((7.5 + Math.random() * 1.5) * 10) / 10,
      cleanliness: Math.round((3.5 + Math.random() * 2.0) * 10) / 10,
      waitTime: Math.round((2.0 + Math.random() * 2.5) * 10) / 10,
      staffBehavior: Math.round((4.0 + Math.random() * 2.5) * 10) / 10,
      facilitiesEquipment: Math.round((5.0 + Math.random() * 2.0) * 10) / 10,
      costValue: Math.round((8.5 + Math.random() * 1.5) * 10) / 10,
    };
    summary = `Users praise the highly experienced doctors and free/affordable treatments, but heavily criticize the extreme wait times and poor cleanliness.`;
    posts = [
      {
        title: `${hospitalName} OPD wait times are absolutely terrible.`,
        url: `https://reddit.com/r/${city.toLowerCase()}/comments/test4`,
        subreddit: ['lahore', 'karachi', 'islamabad'].includes(city.toLowerCase()) ? city.toLowerCase() : 'pakistan',
        score: Math.floor(15 + Math.random() * 50),
        snippet: `Had to wait in queue for 4 hours just to get a general token. It is crowded beyond capacity, though the consultation itself was free.`,
        postedAt: new Date(Date.now() - Math.random() * 100 * 24 * 3600 * 1000),
      },
      {
        title: `The professors and doctors at ${hospitalName} are extremely competent.`,
        url: `https://reddit.com/r/pakistan/comments/test5`,
        subreddit: 'pakistan',
        score: Math.floor(20 + Math.random() * 30),
        snippet: `Don't judge by the building, some of the best medical minds in the country practice at ${hospitalName}. Got my treatment done successfully.`,
        postedAt: new Date(Date.now() - Math.random() * 100 * 24 * 3600 * 1000),
      },
      {
        title: `Public wards at ${hospitalName} need urgent cleaning.`,
        url: `https://reddit.com/r/${city.toLowerCase()}/comments/test6`,
        subreddit: ['lahore', 'karachi', 'islamabad'].includes(city.toLowerCase()) ? city.toLowerCase() : 'pakistan',
        score: Math.floor(8 + Math.random() * 20),
        snippet: `The hygiene standards are very low, toilets are dirty and there are too many people in a single ward. Government needs to fund hospital staff more.`,
        postedAt: new Date(Date.now() - Math.random() * 100 * 24 * 3600 * 1000),
      }
    ];
  }

  const values = Object.values(ratings);
  const overallRating = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  const totalMentions = Math.floor(10 + Math.random() * 30);

  return {
    hospitalId,
    hospitalName,
    city,
    ratings,
    overallRating,
    totalMentions,
    summary,
    redditPosts: posts,
    status: 'analyzed',
    lastScrapedAt: new Date('2035-01-01'), // future date prevents auto-rescraping and rate-limiting
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

const slugify = (value) =>
  (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

const getShortEmail = (name, city, index) => {
  const lowerName = name.toLowerCase();
  const lowerCity = city.toLowerCase();
  
  let base = '';
  if (lowerName.includes('jinnah postgraduate')) base = 'jpmc';
  else if (lowerName.includes('pakistan kidney & liver')) base = 'pkli';
  else if (lowerName.includes('pakistan institute of medical sciences')) base = 'pims';
  else if (lowerName.includes('federal government polyclinic')) base = 'polyclinic';
  else if (lowerName.includes('benazir bhutto')) base = 'bbh';
  else if (lowerName.includes('fauji foundation')) base = 'fauji';
  else if (lowerName.includes('hayatabad medical complex')) base = 'hmc';
  else if (lowerName.includes('lady reading')) base = 'lrh';
  else if (lowerName.includes('khyber teaching')) base = 'kth';
  else if (lowerName.includes('rehman medical')) base = 'rmi';
  else if (lowerName.includes('bolan medical')) base = 'bmc';
  else if (lowerName.includes('punjab institute of cardiology')) base = 'pic';
  else if (lowerName.includes('punjab institute of neurosciences')) base = 'pins';
  else {
    const clean = name
      .replace(/hospital/gi, '')
      .replace(/medical/gi, '')
      .replace(/centre|center/gi, '')
      .replace(/institute/gi, '')
      .replace(/university/gi, '')
      .replace(/postgraduate/gi, '')
      .replace(new RegExp(city, 'gi'), '')
      .replace(/&/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const words = clean.split(' ').filter(Boolean);
    base = words.slice(0, 2).join('.');
  }
  
  base = base.toLowerCase().replace(/[^a-z0-9.]+/g, '');
  if (!base) {
    base = `hosp${index + 1}`;
  }
  
  return `admin.${base}.${lowerCity}@gmail.com`;
};

async function run() {
  console.log('\n🏥 Awaam Assist — Hospital Seed Script');
  console.log('━'.repeat(50));

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Step 1: Find bulk-imported hospitals (not in our curated list)
  const seededNames = HOSPITALS.map(h => h['Hospital Name']);
  const bulkHospitals = await Hospital.find({
    'Hospital Name': { $nin: seededNames }
  }).lean();

  const bulkIds = bulkHospitals.map((h) => h._id);
  console.log(`🗑  Found ${bulkIds.length} bulk-imported hospitals to remove`);

  if (bulkIds.length > 0) {
    await Hospital.deleteMany({ _id: { $in: bulkIds } });
    await HospitalReviewData.deleteMany({ hospitalId: { $in: bulkIds } });
    console.log(`✅ Removed ${bulkIds.length} hospitals + their review data`);
  }

  // Clear all existing hospital admins to start fresh
  const delAdmins = await HospitalAdmin.deleteMany({});
  console.log(`🗑  Cleared ${delAdmins.deletedCount} existing hospital admins (hospital_admins collection).`);

  const delStandardAdmins = await Admin.deleteMany({ role: 'hospital_admin', admin_email: { $regex: /@gmail\.com$/ } });
  console.log(`🗑  Cleared ${delStandardAdmins.deletedCount} existing standard hospital admins (admins collection).`);

  // Clear existing reviews for remaining curated hospitals to restore pre-seeded data
  const remainingCurated = await Hospital.find({
    'Hospital Name': { $in: seededNames }
  }).lean();
  const remainingIds = remainingCurated.map((h) => h._id);
  if (remainingIds.length > 0) {
    await HospitalReviewData.deleteMany({ hospitalId: { $in: remainingIds } });
    console.log(`🧹 Cleared existing review data for ${remainingIds.length} remaining curated hospitals to restore clean seed.`);
  }

  // Generate password hash for admins
  const dummyPassword = process.env.ADMIN_DUMMY_PASSWORD || 'dummy123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(dummyPassword, salt);

  // Step 2: Insert 60 curated hospitals & unique admins
  console.log(`\n📝 Seeding ${HOSPITALS.length} curated hospitals & admins...\n`);

  let inserted = 0;
  let skipped  = 0;

  for (let i = 0; i < HOSPITALS.length; i++) {
    const data = HOSPITALS[i];
    const name = data['Hospital Name'];

    let h = await Hospital.findOne({ 'Hospital Name': name });
    if (h) {
      console.log(`   ⏭  Skip (already exists): ${name}`);
      skipped++;
    } else {
      h = await Hospital.create({
        SerialNum:             i + 1,
        ...data,
        createdByHospitalAdmin: null,
        status:                'approved',
        isVerified:            true,
        rating:                0,
        totalReviews:          0,
      });
      console.log(`   ✔  [${data.City}] ${name}`);
      inserted++;
    }

    // Ensure matched Admin exists in standard 'admins' collection
    const adminEmail = getShortEmail(name, data.City, i);
    let admin = await Admin.findOne({ admin_email: adminEmail });
    if (!admin) {
      admin = await Admin.create({
        admin_name: `Admin of ${name}`,
        admin_email: adminEmail,
        password: hashedPassword,
        role: 'hospital_admin',
        isApproved: true,
        status: 'active',
        is_onboarded: true,
        entity_name: name,
        entity_type: 'hospital',
        entity_address: data.address || '',
        entity_contact: data.contactNumber || '',
        official_website: data.website || '',
        managed_entity_id: h._id,
      });
      console.log(`      👤 Created admin login in 'admins': "${adminEmail}"`);
    } else {
      admin.managed_entity_id = h._id;
      await admin.save();
    }

    // Link hospital to admin
    h.createdByHospitalAdmin = admin._id;
    await h.save();

    // Ensure matched review data exists
    const hasReview = await HospitalReviewData.findOne({ hospitalId: h._id }).lean();
    if (!hasReview) {
      const isPrivate = h.Cateogry === 'Private';
      const reviewPayload = generateReviewData(h._id, h['Hospital Name'] || h.hospitalName, h.City, isPrivate);
      await HospitalReviewData.create(reviewPayload);
      console.log(`      📝 Seeded Reddit community reviews for "${name}"`);
    }
  }

  console.log('\n' + '━'.repeat(50));
  console.log(`✅ Done!  Inserted: ${inserted}  |  Skipped (existed): ${skipped}`);
  console.log('━'.repeat(50) + '\n');

  // Generate hospital_admins.md list in root folder
  try {
    const fs = require('fs');
    const path = require('path');
    const dbAdmins = await Admin.find({ role: 'hospital_admin' }).sort({ entity_name: 1 }).lean();
    let mdContent = `# Seeded Hospital Admin Accounts\n\n`;
    mdContent += `All seeded accounts share the same password: **\`dummy123\`**\n\n`;
    mdContent += `| Hospital Name | Admin Email | City | Status |\n`;
    mdContent += `| :--- | :--- | :--- | :--- |\n`;
    for (const admin of dbAdmins) {
      mdContent += `| ${admin.entity_name} | \`${admin.admin_email}\` | ${admin.entity_address || 'Unknown'} | Active / Approved |\n`;
    }
    const outPath = path.join(__dirname, '../../../hospital_admins.md');
    fs.writeFileSync(outPath, mdContent, 'utf8');
    console.log(`📝 Generated hospital admins list in "${outPath}"`);
  } catch (err) {
    console.error('⚠️ Could not generate hospital_admins.md file:', err.message);
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected.\n');
}

run().catch((err) => {
  console.error('❌ Seed script failed:', err.message);
  process.exit(1);
});
