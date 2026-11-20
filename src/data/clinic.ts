import type {Doctor, Prescription} from '../domain/models';

export const doctors: Doctor[] = [
  {
    id: 'dr_ananya', name: 'Dr. Ananya Rao', nameI18n: {hi: 'डॉ. अनन्या राव', te: 'డా. అనన్య రావు'}, specialty: 'General Physician', specialtyI18n: {hi: 'सामान्य चिकित्सक', te: 'జనరల్ ఫిజీషియన్'},
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=280&auto=format&fit=crop',
    feeInr: 399, languages: ['English', 'Telugu', 'Hindi'], experienceYears: 12,
  },
  {
    id: 'dr_arvind', name: 'Dr. Arvind Reddy', nameI18n: {hi: 'डॉ. अरविंद रेड्डी', te: 'డా. అరవింద్ రెడ్డి'}, specialty: 'Family Medicine', specialtyI18n: {hi: 'पारिवारिक चिकित्सा', te: 'కుటుంబ వైద్యం'},
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=280&auto=format&fit=crop',
    feeInr: 499, languages: ['English', 'Telugu'], experienceYears: 9,
  },
  {
    id: 'dr_meera', name: 'Dr. Meera Sharma', nameI18n: {hi: 'डॉ. मीरा शर्मा', te: 'డా. మీరా శర్మ'}, specialty: 'Internal Medicine', specialtyI18n: {hi: 'आंतरिक चिकित्सा', te: 'ఇంటర్నల్ మెడిసిన్'},
    photoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=280&auto=format&fit=crop',
    feeInr: 599, languages: ['Hindi', 'English'], experienceYears: 15,
  },
];

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export const prescriptions: Prescription[] = [
  {
    id: 'RX-2048', issuedAt: dateDaysAgo(2), doctorName: 'Dr. Ananya Rao', doctorNameI18n: {hi: 'डॉ. अनन्या राव', te: 'డా. అనన్య రావు'}, clinicName: 'Tapza Clinic · Banjara Hills, Hyderabad', clinicNameI18n: {hi: 'टैप्ज़ा क्लिनिक · बंजारा हिल्स, हैदराबाद', te: 'టాప్జా క్లినిక్ · బంజారా హిల్స్, హైదరాబాద్'},
    medicines: [
      {id: 'med_1', name: 'Paracetamol 500 mg', nameI18n: {hi: 'पैरासिटामोल 500 मि.ग्रा.', te: 'పారాసిటమాల్ 500 మి.గ్రా.'}, dose: '1 tablet after food', doseI18n: {hi: 'खाने के बाद 1 गोली', te: 'భోజనం తర్వాత 1 మాత్ర'}, days: 5, timing: ['morning', 'night']},
      {id: 'med_2', name: 'Pantoprazole 40 mg', nameI18n: {hi: 'पैंटोप्राज़ोल 40 मि.ग्रा.', te: 'పాంటోప్రజోల్ 40 మి.గ్రా.'}, dose: '1 tablet before breakfast', doseI18n: {hi: 'नाश्ते से पहले 1 गोली', te: 'అల్పాహారానికి ముందు 1 మాత్ర'}, days: 7, timing: ['morning']},
      {id: 'med_3', name: 'Vitamin D3', nameI18n: {hi: 'विटामिन D3', te: 'విటమిన్ D3'}, dose: '1 capsule after lunch', doseI18n: {hi: 'दोपहर के भोजन के बाद 1 कैप्सूल', te: 'మధ్యాహ్న భోజనం తర్వాత 1 క్యాప్సూల్'}, days: 14, timing: ['afternoon']},
    ],
  },
  {
    id: 'RX-1986', issuedAt: dateDaysAgo(21), doctorName: 'Dr. Arvind Reddy', doctorNameI18n: {hi: 'डॉ. अरविंद रेड्डी', te: 'డా. అరవింద్ రెడ్డి'}, clinicName: 'Tapza Clinic · Jubilee Hills, Hyderabad', clinicNameI18n: {hi: 'टैप्ज़ा क्लिनिक · जुबली हिल्स, हैदराबाद', te: 'టాప్జా క్లినిక్ · జూబ్లీ హిల్స్, హైదరాబాద్'},
    medicines: [
      {id: 'med_4', name: 'Cetirizine 10 mg', nameI18n: {hi: 'सेटिरिज़िन 10 मि.ग्रा.', te: 'సెటిరిజిన్ 10 మి.గ్రా.'}, dose: '1 tablet at bedtime', doseI18n: {hi: 'सोने के समय 1 गोली', te: 'పడుకునే ముందు 1 మాత్ర'}, days: 5, timing: ['night']},
      {id: 'med_5', name: 'Saline nasal spray', nameI18n: {hi: 'सेलाइन नेज़ल स्प्रे', te: 'సెలైన్ నాసల్ స్ప్రే'}, dose: '2 sprays in each nostril', doseI18n: {hi: 'प्रत्येक नथुने में 2 स्प्रे', te: 'ప్రతి ముక్కులో 2 స్ప్రేలు'}, days: 7, timing: ['morning', 'night']},
    ],
  },
];
