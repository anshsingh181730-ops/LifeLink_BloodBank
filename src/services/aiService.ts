/**
 * LifeLink Clinical AI Assistant Service
 * 
 * Provides an intelligent LLM-powered backend for answering open-ended questions
 * about blood donation eligibility, hematology (hemoglobin, RBC, blood volume),
 * compatibility, symptoms, conditions, and platform navigation.
 * 
 * Configured with multi-provider routing (Gemini, Groq, OpenAI, open inference endpoints)
 * and an exhaustive clinical reasoning engine with strict adherence to platform factual rules.
 */

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  text: string;
}

export const CLINICAL_AI_SYSTEM_PROMPT = `You are LifeLink's Clinical AI Assistant. Answer questions about blood donation eligibility, blood types, compatibility, hemoglobin/RBC/blood health, donation intervals, and general medical topics.

STRICT INSTRUCTIONS:
1. Provide a clear, complete, and well-structured answer. Explain the core facts directly and thoroughly without leaving sentences incomplete or cutting off mid-thought. Always ensure your explanations, lists, and conclusions are completely finished.
2. Use markdown bold (**term**) for emphasizing key terms and categories.
3. Use bullet points (* item) for lists.
4. For medical or health questions, append a short one-line disclaimer:
Disclaimer: Educational info only, not a medical diagnosis; consult a doctor.
5. Only use the LifeLink Donor Eligibility Standards reference data when the user's question is specifically about donation eligibility, requirements, or platform rules. For all other health/medical questions (blood composition, RBC/WBC counts, disease symptoms, diet, general health topics), answer directly using your own medical knowledge — do not default back to the eligibility standards block.

LIFELINK DONOR ELIGIBILITY STANDARDS (REFERENCE ONLY WHEN SPECIFICALLY ASKED ABOUT ELIGIBILITY/RULES):
- Age Window: 18 to 65 years.
- Minimum Weight: 45 kg (for whole blood donation); 50 kg (for platelet apheresis).
- Hemoglobin threshold for donation: >= 12.5 g/dL for both men and women (tested via fingerprick before every donation).
- Vital Signs: Blood pressure systolic 100-140 mmHg, diastolic 60-90 mmHg; pulse 60-100 bpm; normal oral temperature (~37°C / 98.6°F).
- Mandatory Donation Intervals:
  • Whole Blood: Minimum 90 days (3 months) for men; minimum 120 days (4 months) for women.
  • Platelets (Single Donor Platelet / Apheresis): Minimum wait interval is 14 days (up to 24 donations per calendar year).
  • Plasma: Minimum 28 days interval.
- Temporary Deferrals & Waiting Periods:
  • Tattoo, body piercing, acupuncture, or permanent makeup: Mandatory 6 months wait time per National Blood Transfusion Council (NBTC) guidelines to ensure no window-period infection.
  • Major surgery: 6 to 12 months deferral depending on complete clinical recovery.
  • Minor dental extraction or minor surgery: 72 hours to 1 month deferral.
  • Alcohol consumption: Avoid alcohol for at least 24 hours prior to donation.
  • Antibiotic medication: Wait 7 to 14 days after finishing the full antibiotic course and recovery from infection.
  • Fever, cold, cough, sore throat, or acute infection: Wait at least 7 to 14 days after complete recovery and symptom resolution.
  • Vaccines: COVID-19 / Hepatitis B inactivated vaccines: wait 14 days; live attenuated vaccines: wait 28 days.
  • Pregnancy & Breastfeeding: Defer throughout pregnancy and for 6 to 12 months postpartum / during active lactation.
- Blood Group Compatibility & Red Cell Rules:
  • O-Negative (O-): Universal Red Cell Donor. Can donate red cells to ALL blood types (A+, A-, B+, B-, AB+, AB-, O+, O-). Can only receive red cells from O-Negative.
  • AB-Positive (AB+): Universal Red Cell Recipient (can safely receive red cells from all groups) and Universal Plasma Donor.
  • O-Positive (O+): Can donate red cells to O+, A+, B+, AB+; can receive from O+ and O-.
  • A-Positive (A+): Can donate red cells to A+, AB+; can receive from A+, A-, O+, O-.
  • A-Negative (A-): Can donate red cells to A+, A-, AB+, AB-; can receive from A-, O-.
  • B-Positive (B+): Can donate red cells to B+, AB+; can receive from B+, B-, O+, O-.
  • B-Negative (B-): Can donate red cells to B+, B-, AB+, AB-; can receive from B-, O-.
  • AB-Negative (AB-): Can donate red cells to AB+, AB-; can receive from AB-, A-, B-, O-.
- LifeLink Platform Architecture:
  • 3-Tier Automatic Escalation: Tier 1 (nearby voluntary donors <10km), Tier 2 (city-wide donors / automated failover after SLA), Tier 3 (partner blood banks reserve inventory & NGO emergency mobilization).
  • Real Location Matching: Straight-line distance computed using the Haversine formula based on real GPS coordinates.
  • Lifesaver Contribution Score: Composite score reflecting verified donations, rapid acceptance, and emergency reliability.

LANGUAGE:
If user language is 'hi', respond in Hindi (Devanagari). If 'mr', in Marathi. If 'en', in English.
`;

const SHORT_DISCLAIMER_EN = "\n\n*Disclaimer: Educational info only, not a medical diagnosis; consult a doctor.*";
const SHORT_DISCLAIMER_HI = "\n\n*अस्वीकरण: केवल शैक्षणिक जानकारी; व्यक्तिगत सलाह के लिए डॉक्टर से परामर्श करें।*";
const SHORT_DISCLAIMER_MR = "\n\n*अस्वीकरण: केवळ शैक्षणिक माहिती; वैयक्तिक सल्ल्यासाठी डॉक्टरांचा सल्ला घ्या.*";

/**
 * Normalizes text while preserving markdown bold and list syntax for rendering.
 */
export function formatCleanAnswer(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Collapse 3+ newlines into 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * High-precision clinical reasoning engine (fallback).
 * Formats responses with standard markdown bold and clean lists.
 */
export function generateClinicalReasoning(userText: string, lang: string = 'en'): string {
  const query = userText.toLowerCase().trim();
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';

  // 1. Off-topic checks
  const isOffTopic = /capital of|weather in|who is the president|stock market|cryptocurrency|cricket match|football score|movie review|recipe for pizza|solve x\^2/i.test(query);
  if (isOffTopic) {
    if (isHi) {
      return "मैं लाइफलिंक का क्लीनिकल एआई सहायक हूँ। मैं केवल रक्त स्वास्थ्य, रक्तदान पात्रता और चिकित्सा संबंधी प्रश्नों में आपकी सहायता कर सकता हूँ।";
    }
    if (isMr) {
      return "मी लाइफलिंकचा क्लिनिकल एआय सहाय्यक आहे. मी फक्त रक्त आरोग्य आणि रक्तदान पात्रता संबंधित प्रश्नांमध्ये मदत करू शकतो.";
    }
    return "I am LifeLink's Clinical AI Assistant, specialized in blood donation, hematology, and health. Please ask a health or blood-related question!";
  }

  // 2. RBC Percentage / RBC Count / Hematocrit (PCV)
  const isRbcQuery = /(percentage.*(red blood cell|rbc)|(red blood cell|rbc).*percentage|hematocrit|pcv|rbc count|red blood cell count|आरबीसी|लाल रक्त पेशी)/i.test(query);
  if (isRbcQuery) {
    if (isHi) {
      return `स्वस्थ मानव शरीर में लाल रक्त कोशिकाओं का प्रतिशत (**Hematocrit / PCV**):
* **वयस्क पुरुष:** लगभग 40% से 54%
* **वयस्क महिलाएं:** लगभग 36% से 48%

लाल रक्त कोशिकाएं (RBCs) फेफड़ों से शरीर के सभी ऊतकों तक ऑक्सीजन का परिवहन करती हैं। एक मानक रक्तदान के दौरान दान की गई कोशिकाएं शरीर द्वारा 4 से 6 सप्ताह में प्राकृतिक रूप से पूरी तरह पुनः निर्मित हो जाती हैं।${SHORT_DISCLAIMER_HI}`;
    }
    if (isMr) {
      return `निरोगी मानवी शरीरातील लाल रक्तपेशींची टक्केवारी (**Hematocrit / PCV**):
* **प्रौढ पुरुष:** सुमारे 40% ते 54%
* **प्रौढ स्त्रिया:** सुमारे 36% ते 48%

लाल रक्तपेशी शरीरात ऑक्सिजन वाहून नेण्याचे महत्त्वाचे कार्य करतात. रक्तादानानंतर अस्थिमज्जा 4 ते 6 आठवड्यांत या पेशींची पूर्ण भरपाई करते।${SHORT_DISCLAIMER_MR}`;
    }
    return `In a healthy human body, the percentage of Red Blood Cells (**hematocrit**) typically ranges:
* **Adult men:** Approximately 40% to 54%
* **Adult women:** Approximately 36% to 48%

Hematocrit represents the proportion of total blood volume occupied by red blood cells. These cells contain hemoglobin to transport oxygen to tissues throughout the body, and are naturally replenished within 4 to 6 weeks following a blood donation.${SHORT_DISCLAIMER_EN}`;
  }

  // 3. Hemoglobin percentage / level (Hb)
  const isHbQuery = /(hemoglobin|hb|हीमोग्लोबिन|हिमोग्लोबिन)/i.test(query);
  if (isHbQuery) {
    if (isHi) {
      return `हीमोग्लोबिन (**Hb**) सामान्य स्तर:
* **वयस्क पुरुष:** 13.8 से 17.2 g/dL
* **वयस्क महिलाएं:** 12.1 से 15.1 g/dL

लाइफलिंक पर सुरक्षित रक्तदान के लिए न्यूनतम हीमोग्लोबिन **12.5 g/dL** होना अनिवार्य है। पालक, दालें, चुकंदर और अनार का सेवन करने से हीमोग्लोबिन स्तर बेहतर होता है।${SHORT_DISCLAIMER_HI}`;
    }
    if (isMr) {
      return `हिमोग्लोबिन (**Hb**) सामान्य पातळी:
* **प्रौढ पुरुष:** 13.8 ते 17.2 g/dL
* **प्रौढ स्त्रिया:** 12.1 ते 15.1 g/dL

रक्तदानासाठी किमान हिमोग्लोबिन **12.5 g/dL** आवश्यक आहे. हिरव्या पालेभाज्या, डाळी आणि खजूर यामुळे हिमोग्लोबिन सुधारते।${SHORT_DISCLAIMER_MR}`;
    }
    return `Normal hemoglobin (**Hb**) reference ranges:
* **Adult men:** 13.8 to 17.2 g/dL
* **Adult women:** 12.1 to 15.1 g/dL

LifeLink requires a minimum hemoglobin level of **12.5 g/dL** for safe blood donation. Iron-rich foods such as spinach, lentils, beets, and citrus support optimal hemoglobin maintenance.${SHORT_DISCLAIMER_EN}`;
  }

  // 4. Blood Level / Blood Volume
  const isVolumeQuery = /(blood level|blood volume|amount of blood|how much blood|body blood|शरीरात किती रक्त|शरीर में कितना खून)/i.test(query);
  if (isVolumeQuery) {
    if (isHi) {
      return `एक स्वस्थ वयस्क में औसतन **4.5 से 5.5 लीटर** रक्त होता है। रक्तदान में केवल **350 से 450 mL** (10% से भी कम) लिया जाता है, जिसका प्लाज्मा 24-48 घंटों में और लाल कोशिकाएं 4-6 सप्ताह में पुनः बन जाती हैं।${SHORT_DISCLAIMER_HI}`;
    }
    if (isMr) {
      return `निरोगी प्रौढ व्यक्तीमध्ये सरासरी **4.5 ते 5.5 लिटर** रक्त असते. रक्तादानात फक्त **350-450 mL** घेतले जाते, जे 24-48 तासांत पुन्हा भरून निघण्यास सुरुवात होते।${SHORT_DISCLAIMER_MR}`;
    }
    return `An average adult has about **4.5 to 5.5 liters** of circulating blood. A standard whole blood donation collects only **350–450 mL** (<10%), which plasma volume replenishes in 24–48 hours and red blood cells in 4–6 weeks.${SHORT_DISCLAIMER_EN}`;
  }

  // 5. Tattoo & Body Piercing Wait Time
  if (query.includes('tattoo') || query.includes('piercing') || query.includes('टैटू') || query.includes('टॅटू')) {
    if (isHi) {
      return "टैटू या बॉडी पियर्सिंग के बाद रक्तदान से पहले कम से कम **6 महीने** का इंतजार करना अनिवार्य है, ताकि किसी भी संभावित रक्तजनित संक्रमण से मरीज सुरक्षित रहे।";
    }
    if (isMr) {
      return "टॅटू किंवा बॉडी पियर्सिंगनंतर रक्तदान करण्यापूर्वी किमान **6 महिने** थांबणे बंधनकारक आहे, जेणेकरून संसर्गाचा धोका टाळता येईल.";
    }
    return "You must wait at least **6 months** after getting a tattoo, body piercing, or acupuncture before donating blood, per National Blood Transfusion Council (NBTC) safety guidelines.";
  }

  // 6. Donation Intervals & Gap
  if (query.includes('interval') || query.includes('gap') || query.includes('how often') || query.includes('frequency') || query.includes('how many days') || query.includes('अंतराल') || query.includes('अंतर')) {
    if (isHi) {
      return `अनिवार्य रक्तदान अंतराल:
* **होल ब्लड:** पुरुषों के लिए 90 दिन, महिलाओं के लिए 120 दिन
* **प्लेटलेट्स:** न्यूनतम 14 दिन
यह समय शरीर में आयरन स्टोर की सुरक्षित भरपाई के लिए जरूरी है।`;
    }
    if (isMr) {
      return `रक्तदानातील अनिवार्य अंतर:
* **होल ब्लड:** पुरुषांसाठी 90 दिवस, स्त्रियांसाठी 120 दिवस
* **प्लेटलेट्स:** किमान 14 दिवस
शरीरातील लोह साठा पूर्ववत होण्यासाठी हा कालावधी आवश्यक आहे.`;
    }
    return `Mandatory donation intervals on LifeLink:
* **Whole Blood:** 90 days for men, 120 days for women
* **Platelets (Apheresis):** 14 days
This ensures complete recovery of your iron stores and red blood cell count.`;
  }

  // 7. General Donor Eligibility (Age, Weight, Vitals)
  if (query.includes('eligibility') || query.includes('eligible') || query.includes('criteria') || query.includes('weight') || query.includes('age') || query.includes('पात्रता') || query.includes('वजन') || query.includes('वय')) {
    if (isHi) {
      return `लाइफलिंक रक्तदान पात्रता मानदंड:
* **आयु:** 18 से 65 वर्ष
* **वजन:** न्यूनतम 45 किग्रा (होल ब्लड), 50 किग्रा (प्लेटलेट्स)
* **हीमोग्लोबिन:** न्यूनतम 12.5 g/dL
* रक्तदान के समय पूर्ण स्वस्थ होना अनिवार्य है।`;
    }
    if (isMr) {
      return `लाइफलिंक रक्तदान पात्रता:
* **वय:** 18 ते 65 वर्षे
* **वजन:** किमान 45 किलो (होल ब्लड), 50 किलो (प्लेटलेट्स)
* **हिमोग्लोबिन:** किमान 12.5 g/dL
* दानावेळी आरोग्य निरोगी असणे आवश्यक आहे.`;
    }
    return `LifeLink basic donor eligibility:
* **Age:** 18 to 65 years
* **Weight:** Minimum 45 kg (whole blood), 50 kg (platelets)
* **Hemoglobin:** Minimum 12.5 g/dL
* Normal blood pressure and pulse, free from fever or infections.`;
  }

  // 8. Blood Compatibility & Universal Donors
  if (query.includes('o-') || query.includes('o negative') || query.includes('universal') || query.includes('compatibility') || query.includes('who can receive') || query.includes('who can donate') || query.includes('रक्तगट') || query.includes('रक्त समूह')) {
    if (isHi) {
      return "**O-नेगेटिव (O-)** यूनिवर्सल रेड सेल डोनर है, जो किसी भी रक्त समूह (A, B, AB, O) के मरीज को दिया जा सकता है। **AB-पॉजिटिव (AB+)** यूनिवर्सल रेसिपिएंट है जो सभी से रक्त ले सकता है।";
    }
    if (isMr) {
      return "**O-निगेटिव्ह (O-)** हा युनिव्हर्सल रेड सेल डोनर आहे, जो कोणत्याही रक्तगटाच्या रुग्णाला देता येतो. **AB-पॉझिटिव्ह (AB+)** हा युनिव्हर्सल रेसिपियंट आहे जो सर्वांकडून रक्त घेऊ शकतो.";
    }
    return "**O-Negative** is the Universal Red Cell Donor, transfusable to any blood group (A, B, AB, O) in critical trauma. **AB-Positive** is the Universal Recipient and can receive red cells from all groups.";
  }

  // 9. Symptoms, Diseases, Medications, Conditions
  const hasMedicalQuery = /fever|cold|cough|infection|antibiotic|surgery|pregnant|diabetes|hypertension|blood pressure|thyroid|dengue|malaria|alcohol|smoking|asthma|aspirin|painkiller|period|menstruation/i.test(query);
  if (hasMedicalQuery) {
    let note = "";
    if (query.includes('fever') || query.includes('cold') || query.includes('बुखार') || query.includes('ताप')) {
      note = "बुखार या सर्दी पूरी तरह ठीक होने के बाद कम से कम 7 से 14 दिन तक रक्तदान न करें।";
    } else if (query.includes('antibiotic') || query.includes('एंटीबायोटिक')) {
      note = "एंटीबायोटिक कोर्स पूरा होने के बाद 7 से 14 दिन का इंतजार करें।";
    } else if (query.includes('alcohol') || query.includes('शराब') || query.includes('दारू')) {
      note = "शराब पीने के बाद कम से कम 24 घंटे तक रक्तदान न करें और खूब पानी पिएं।";
    } else {
      note = "नियमित दवाइयों या स्वास्थ्य स्थिति की जांच रक्तदान केंद्र के डॉक्टर द्वारा की जाती है।";
    }

    if (lang === 'en') {
      note = "Please ensure complete recovery from acute symptoms and wait at least 7 to 14 days after infections or antibiotic courses before donating.";
    }

    if (isHi) return `${note}${SHORT_DISCLAIMER_HI}`;
    if (isMr) return `${note}${SHORT_DISCLAIMER_MR}`;
    return `${note}${SHORT_DISCLAIMER_EN}`;
  }

  // 10. Platform Features / Escalation
  if (query.includes('escalat') || query.includes('sla') || query.includes('tier') || query.includes('lifelink') || query.includes('एस्केलेशन')) {
    if (isHi) {
      return "लाइफलिंक 3-स्तरीय स्वचालित एस्केलेशन: **स्तर 1** (10 किमी के भीतर स्थानीय दाता) -> **स्तर 2** (शहर-व्यापी दाता) -> **स्तर 3** (पार्टनर ब्लड बैंक रिजर्व)।";
    }
    if (isMr) {
      return "लाइफलिंक 3-स्तरीय एस्केलेशन: **स्तर 1** (10 किमी अंतरातील दाते) -> **स्तर 2** (शहरव्यापी दाते) -> **स्तर 3** (रक्तपेढी राखीव साठा).";
    }
    return "LifeLink 3-tier automatic escalation: **Tier 1** (nearby donors <10km) -> **Tier 2** (city-wide failover) -> **Tier 3** (partner blood bank cold-chain reserve).";
  }

  // 11. General Default
  if (isHi) {
    return `नमस्ते! मैं लाइफलिंक क्लीनिकल एआई सहायक हूँ। आप रक्त स्वास्थ्य, हीमोग्लोबिन, आरबीसी, या रक्तदान पात्रता के बारे में मुझसे कोई भी प्रश्न पूछ सकते हैं।${SHORT_DISCLAIMER_HI}`;
  }
  if (isMr) {
    return `नमस्कार! मी लाइफलिंक क्लिनिकल एआई सहाय्यक आहे. आपण रक्त आरोग्य, हिमोग्लोबिन, आरबीसी, किंवा रक्तदान पात्रता विषयी विचारू शकता.${SHORT_DISCLAIMER_MR}`;
  }
  return `Hello! I am LifeLink's Clinical AI Assistant. Ask me anything about red blood cells, hemoglobin, blood volume, donation eligibility, or blood compatibility!${SHORT_DISCLAIMER_EN}`;
}

/**
 * Main entry point: Routes user messages to an LLM-powered backend
 * using configured API keys or open inference endpoints, with failover
 * to the clinical reasoning engine.
 */
export async function generateAIChatResponse(
  userMessage: string,
  history: ChatHistoryItem[] = [],
  language: string = 'en'
): Promise<string> {
  const cleanInput = userMessage.trim();
  if (!cleanInput) return '';

  // 1. Try Google Gemini API if configured
  const geminiApiKey = 
    (import.meta as any).env?.VITE_GEMINI_API_KEY || 
    (import.meta as any).env?.VITE_GOOGLE_API_KEY;

  if (geminiApiKey) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
    for (const model of modelsToTry) {
      try {
        const response = await fetchWithTimeout(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: `${CLINICAL_AI_SYSTEM_PROMPT}\nTarget User Interface Language: ${language}` }]
              },
              contents: [
                ...history.slice(-4).map(h => ({
                  role: h.role === 'user' ? 'user' : 'model',
                  parts: [{ text: h.text }]
                })),
                { role: 'user', parts: [{ text: cleanInput }] }
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1000 // Comfortably fits complete, non-truncated answers
              }
            })
          },
          15000 // 15-second timeout to allow full payload delivery
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) {
            return formatCleanAnswer(text);
          }
        }
      } catch (err) {
        console.warn(`Gemini API call to ${model} failed, trying next:`, err);
      }
    }
  }

  // 2. Try Groq Cloud API if configured (ultra-fast inference)
  const groqApiKey = (import.meta as any).env?.VITE_GROQ_API_KEY;
  if (groqApiKey) {
    try {
      const response = await fetchWithTimeout(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages: [
              { role: 'system', content: `${CLINICAL_AI_SYSTEM_PROMPT}\nTarget Language: ${language}` },
              ...history.slice(-4).map(h => ({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.text
              })),
              { role: 'user', content: cleanInput }
            ],
            temperature: 0.3,
            max_tokens: 1000
          })
        },
        12000
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text && text.trim()) {
          return formatCleanAnswer(text);
        }
      }
    } catch (err) {
      console.warn('Groq API call failed:', err);
    }
  }

  // 3. Try OpenAI API if configured
  const openaiApiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY;
  if (openaiApiKey) {
    try {
      const response = await fetchWithTimeout(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: `${CLINICAL_AI_SYSTEM_PROMPT}\nTarget Language: ${language}` },
              ...history.slice(-4).map(h => ({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.text
              })),
              { role: 'user', content: cleanInput }
            ],
            temperature: 0.3,
            max_tokens: 1000
          })
        },
        12000
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text && text.trim()) {
          return formatCleanAnswer(text);
        }
      }
    } catch (err) {
      console.warn('OpenAI API call failed:', err);
    }
  }

  // 4. Try Public AI Model Endpoint with reasonable timeout
  try {
    const publicResponse = await fetchWithTimeout(
      'https://text.pollinations.ai/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: `${CLINICAL_AI_SYSTEM_PROMPT}\nRespond fully with clean markdown formatting in language: ${language}.` 
            },
            ...history.slice(-2).map(h => ({
              role: h.role === 'user' ? 'user' : 'assistant',
              content: h.text
            })),
            { role: 'user', content: cleanInput }
          ],
          model: 'openai',
          temperature: 0.3
        })
      },
      5000
    );

    if (publicResponse.ok) {
      const text = await publicResponse.text();
      if (text && !text.includes('Queue full') && !text.includes('Rate limit') && !text.includes('"error":')) {
        return formatCleanAnswer(text);
      }
    }
  } catch (err) {
    // Fallback immediately
  }

  // 5. Clinical Reasoning Engine
  return formatCleanAnswer(generateClinicalReasoning(cleanInput, language));
}

/**
 * Fetch wrapper with configurable abort timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}
