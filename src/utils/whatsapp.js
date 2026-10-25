/**
 * WhatsApp Deep Link Generation Utility for GateKeeper AI
 * Generates 100% free direct WhatsApp links via https://wa.me/
 * with one-click interactive approval links for residents.
 */

export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  // Remove all non-numeric characters except leading plus if needed
  let cleaned = phone.replace(/\D/g, '');

  // Handle standard 10-digit Indian numbers
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = '91' + cleaned.substring(1);
  }

  return cleaned;
}

export function getBaseAppUrl(customBase) {
  if (customBase) return customBase.replace(/\/+$/, '');
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    const pathname = window.location.pathname.replace(/\/+$/, '');
    return `${origin}${pathname}`;
  }
  return '';
}

export function generateApprovalUrls(visitorId, baseUrl) {
  const base = getBaseAppUrl(baseUrl);
  return {
    approveUrl: `${base}/#/quick-approve?id=${encodeURIComponent(visitorId)}&action=APPROVED`,
    denyUrl: `${base}/#/quick-approve?id=${encodeURIComponent(visitorId)}&action=DENIED`,
  };
}

export function formatWhatsAppMessage(visitorData, baseUrl) {
  const visitorId = visitorData.id || '';
  const flatNumber = visitorData.flatNumber || 'Your Flat';
  const visitorName = visitorData.visitorName || 'Visitor';
  const purpose = visitorData.purposeLabel || visitorData.purpose || 'Visit';
  const phone = visitorData.phone ? `*Phone:* ${visitorData.phone}\n` : '';
  const vehicle = visitorData.vehicleNumber ? `*Vehicle:* ${visitorData.vehicleNumber}\n` : '';

  const { approveUrl, denyUrl } = generateApprovalUrls(visitorId, baseUrl);

  const message = 
`🔔 *GATEKEEPER VISIT ALERT*
*Flat:* ${flatNumber}
*Visitor:* ${visitorName} (${purpose})
${phone}${vehicle}--------------------------------------------------
Please tap a link below to decide:

🟢 *APPROVE ENTRY (ALLOW IN):*
${approveUrl}

🔴 *DENY ENTRY (DO NOT ALLOW):*
${denyUrl}
--------------------------------------------------
_GateKeeper AI • Automated Community Access_`;

  return { message, approveUrl, denyUrl };
}

/**
 * Generates the full wa.me deep link URL
 * @param {string} residentPhone - Resident phone number
 * @param {object} visitorData - Visitor object { id, visitorName, flatNumber, purpose, ... }
 * @param {string} [baseUrl] - Optional custom base URL
 * @returns {object} { url, message, residentPhone: cleanPhone, approveUrl, denyUrl }
 */
export function generateWhatsAppLink(residentPhone, visitorData, baseUrl) {
  const cleanPhone = cleanPhoneNumber(residentPhone);
  const { message, approveUrl, denyUrl } = formatWhatsAppMessage(visitorData, baseUrl);
  const encodedText = encodeURIComponent(message);
  
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  return {
    url,
    message,
    cleanedPhone: cleanPhone,
    approveUrl,
    denyUrl,
  };
}
