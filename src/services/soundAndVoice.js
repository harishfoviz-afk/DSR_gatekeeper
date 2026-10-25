// Sound synthesis (Web Audio API) & Speech Synthesis (Web Speech API)
// With multi-lingual voice guidance in Telugu (తెలుగు), Hindi (हिन्दी), English, and Bilingual options

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Web Audio API synthesized chimes:
 * - 'approved': Pleasant, uplifting three-tone ascending chord (C5 -> E5 -> G5)
 * - 'denied': Distinct low warning double buzzer (160Hz harsh buzz)
 * - 'arrival': Traditional doorbell ding-dong
 * - 'inside': Positive entry chime
 * - 'exit': Soft departure chime
 */
export function playChime(type) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'approved') {
      // Ascending C-major triad (C5: 523Hz, E5: 659Hz, G5: 784Hz)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.5);
      });
    } else if (type === 'denied') {
      // Two harsh warning buzzes (155Hz sawtooth with sharp cutoff)
      [0, 0.22].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(155, now + offset);
        osc.frequency.linearRampToValueAtTime(130, now + offset + 0.18);

        gain.gain.setValueAtTime(0.4, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.19);
      });
    } else if (type === 'arrival') {
      // Ding-dong doorbell (660Hz then 440Hz)
      const notes = [
        { f: 659.25, t: 0, dur: 0.35 },
        { f: 523.25, t: 0.25, dur: 0.6 },
      ];
      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, now + note.t);

        gain.gain.setValueAtTime(0.35, now + note.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.t);
        osc.stop(now + note.t + note.dur);
      });
    } else if (type === 'inside') {
      // Gate passed chime (high ping)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'exit') {
      // Exit recorded chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.3);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (err) {
    console.warn("Audio synthesis error:", err);
  }
}

/**
 * Text-to-Speech Engine
 * Generates natural audio announcements in:
 * - 'te': Pure Telugu (తెలుగు)
 * - 'en': English
 * - 'hi': Pure Hindi (हिन्दी)
 * - 'bilingual-hi': English + Hindi (Hinglish)
 * - 'bilingual-te': English + Telugu (Tenglish)
 */
export function speakAlert(visitor, language = 'bilingual-te', autoPlayChime = true) {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech synthesis not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel(); // Stop any pending speech

  if (autoPlayChime) {
    if (visitor.status === 'APPROVED') playChime('approved');
    else if (visitor.status === 'DENIED') playChime('denied');
    else if (visitor.status === 'PENDING') playChime('arrival');
    else if (visitor.status === 'INSIDE') playChime('inside');
  }

  const name = visitor.visitorName || 'Visitor';
  const flat = visitor.flatNumber || 'Flat';

  let textToSpeak = '';
  let targetLang = 'en-US';

  // 1. APPROVED (Post-approval NO OTP required - Direct Entry allowed)
  if (visitor.status === 'APPROVED') {
    if (language === 'te') {
      textToSpeak = `గ్రీన్ లైట్! గ్రీన్ లైట్! ప్రవేశం ఆమోదించబడింది! ${name} గారిని ఫ్లాట్ ${flat} లోకి అనుమతించండి. నేరుగా లోపలికి పంపండి.`;
      targetLang = 'te-IN';
    } else if (language === 'bilingual-te') {
      textToSpeak = `GREEN LIGHT! గ్రీన్ లైట్! Allow direct entry for ${name} to Flat ${flat}. ప్రవేశం ఆమోదించబడింది! Direct Entry.`;
      targetLang = 'te-IN';
    } else if (language === 'hi') {
      textToSpeak = `हरी बत्ती! हरी बत्ती! प्रवेश मंजूर! ${name} को फ्लैट ${flat} में सीधे अंदर जाने दें। किसी ओटीपी की ज़रूरत नहीं है।`;
      targetLang = 'hi-IN';
    } else if (language === 'bilingual-hi') {
      textToSpeak = `GREEN LIGHT! हरी बत्ती! Allow entry for ${name} to Flat ${flat}. Entry Approved! सीधे अंदर जाने दें।`;
      targetLang = 'hi-IN';
    } else {
      // English
      textToSpeak = `GREEN LIGHT! Allow direct entry for ${name} to Flat ${flat}. Entry Approved. No OTP required.`;
      targetLang = 'en-IN';
    }
  }
  // 2. DENIED
  else if (visitor.status === 'DENIED') {
    const reason = visitor.deniedReason ? `కారణం: ${visitor.deniedReason}` : '';
    if (language === 'te') {
      textToSpeak = `రెడ్ లైట్! రెడ్ లైట్! ఆపండి! ఫ్లాట్ ${flat} నివాసి అనుమతించలేదు. లోపలికి రానివ్వవద్దు! గేటు తెరవవద్దు.`;
      targetLang = 'te-IN';
    } else if (language === 'bilingual-te') {
      textToSpeak = `RED LIGHT! STOP! రెడ్ లైట్! Resident denied entry to Flat ${flat}. లోపలికి రానివ్వవద్దు!`;
      targetLang = 'te-IN';
    } else if (language === 'hi') {
      textToSpeak = `लाल बत्ती! लाल बत्ती! रुकिए! फ्लैट ${flat} के निवासी ने मना किया है। अंदर मत जाने दें!`;
      targetLang = 'hi-IN';
    } else if (language === 'bilingual-hi') {
      textToSpeak = `RED LIGHT! STOP! लाल बत्ती! Resident denied entry to Flat ${flat}. अंदर मत जाने दें।`;
      targetLang = 'hi-IN';
    } else {
      textToSpeak = `RED LIGHT! STOP! Resident denied entry to Flat ${flat}. Do not let visitor inside!`;
      targetLang = 'en-IN';
    }
  }
  // 3. PENDING
  else if (visitor.status === 'PENDING') {
    if (language === 'te') {
      textToSpeak = `ఎల్లో లైట్! నిరీక్షించండి! ఫ్లాట్ ${flat} కోసం ${name} వచ్చారు. నివాసి అనుమతి కోసం ఎదురుచూడండి. గేటు వద్దే ఉంచండి.`;
      targetLang = 'te-IN';
    } else if (language === 'bilingual-te') {
      textToSpeak = `YELLOW LIGHT! ఎల్లో లైట్! New visitor ${name} for Flat ${flat}. నివాసి అనుమతి కోసం ఎదురుచూడండి.`;
      targetLang = 'te-IN';
    } else if (language === 'hi') {
      textToSpeak = `पीली बत्ती! नया आगंतुक! ${name}, फ्लैट ${flat} के लिए। निवासी की अनुमति का इंतज़ार करें।`;
      targetLang = 'hi-IN';
    } else if (language === 'bilingual-hi') {
      textToSpeak = `YELLOW LIGHT! पीली बत्ती! New visitor ${name} for Flat ${flat}. Please wait at gate.`;
      targetLang = 'hi-IN';
    } else {
      textToSpeak = `YELLOW LIGHT! New visitor ${name} for Flat ${flat}. Waiting for resident approval.`;
      targetLang = 'en-IN';
    }
  }
  // 4. INSIDE
  else if (visitor.status === 'INSIDE') {
    if (language === 'te' || language === 'bilingual-te') {
      textToSpeak = `${name} గారు ఫ్లాట్ ${flat} లోపలికి వెళ్లారు.`;
      targetLang = 'te-IN';
    } else if (language === 'hi' || language === 'bilingual-hi') {
      textToSpeak = `${name} परिसर के अंदर जा चुके हैं।`;
      targetLang = 'hi-IN';
    } else {
      textToSpeak = `Visitor ${name} marked inside for Flat ${flat}.`;
      targetLang = 'en-IN';
    }
  }
  // 5. EXITED
  else if (visitor.status === 'EXITED') {
    if (language === 'te' || language === 'bilingual-te') {
      textToSpeak = `${name} గారు బయటకు వెళ్లడం నమోదైంది.`;
      targetLang = 'te-IN';
    } else if (language === 'hi' || language === 'bilingual-hi') {
      textToSpeak = `${name} का बाहर जाना दर्ज कर लिया गया है।`;
      targetLang = 'hi-IN';
    } else {
      textToSpeak = `Exit recorded for ${name}.`;
      targetLang = 'en-IN';
    }
  }

  if (!textToSpeak) return;

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.rate = 0.93; // Clear cadence for noisy gate environment
  utterance.pitch = 1.0;
  utterance.lang = targetLang;

  // Attempt to select optimal language voice
  const voices = window.speechSynthesis.getVoices();

  if (targetLang.startsWith('te')) {
    const teluguVoice = voices.find(v =>
      v.lang.startsWith('te') ||
      v.name.toLowerCase().includes('telugu') ||
      v.name.toLowerCase().includes('mohan') ||
      v.name.toLowerCase().includes('shruthi')
    );
    if (teluguVoice) {
      utterance.voice = teluguVoice;
    } else {
      const indianVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'hi-IN' || v.name.toLowerCase().includes('india'));
      if (indianVoice) utterance.voice = indianVoice;
    }
  } else if (targetLang.startsWith('hi')) {
    const hindiVoice = voices.find(v =>
      v.lang.startsWith('hi') ||
      v.name.toLowerCase().includes('hindi') ||
      v.name.toLowerCase().includes('madhur') ||
      v.name.toLowerCase().includes('swara')
    );
    if (hindiVoice) utterance.voice = hindiVoice;
    else {
      const indianVoice = voices.find(v => v.lang === 'en-IN' || v.name.toLowerCase().includes('india'));
      if (indianVoice) utterance.voice = indianVoice;
    }
  } else {
    const englishVoice = voices.find(v => v.lang === 'en-IN' || v.name.toLowerCase().includes('india') || v.lang === 'en-US');
    if (englishVoice) utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
