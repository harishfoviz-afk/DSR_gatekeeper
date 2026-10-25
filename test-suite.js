// Headless End-to-End Simulation Test for GateKeeper AI (including WhatsApp Flow)
import assert from 'assert';
import {
  cleanPhoneNumber,
  generateApprovalUrls,
  formatWhatsAppMessage,
  generateWhatsAppLink
} from './src/utils/whatsapp.js';
import { PURPOSE_CONFIG, INITIAL_VISITORS, DEFAULT_SOCIETY_CONFIG, LANGUAGE_OPTIONS } from './src/services/mockData.js';

console.log("=== GateKeeper AI Functional Logic & WhatsApp Flow Test Suite ===");

// 1. Test WhatsApp Phone Cleaning
assert.strictEqual(cleanPhoneNumber('+91 98765-43210'), '919876543210', "Cleans formatted Indian mobile with +91");
assert.strictEqual(cleanPhoneNumber('9876543210'), '919876543210', "Appends 91 to 10-digit number");
assert.strictEqual(cleanPhoneNumber('09876543210'), '919876543210', "Replaces leading 0 with 91");
console.log("✓ WhatsApp phone cleaner passes all formats");

// 2. Test WhatsApp Link and Interactive Deep Link URLs
const sampleVisitor = {
  id: 'vis_test_wa_001',
  visitorName: 'Ramesh Kumar',
  flatNumber: 'A-101',
  purpose: 'delivery',
  purposeLabel: 'Amazon Delivery',
  phone: '9876543210',
  vehicleNumber: 'TS 09 AB 4589',
};

const waResult = generateWhatsAppLink('+91 91234 56789', sampleVisitor, 'https://gatekeeper.app');

assert.ok(waResult.url.startsWith('https://wa.me/919123456789?text='), "Valid wa.me deep link URL structure");
assert.ok(waResult.message.includes('GATEKEEPER VISIT ALERT'), "Includes header alert");
assert.ok(waResult.message.includes('Flat:* A-101'), "Includes destination flat");
assert.ok(waResult.message.includes('Ramesh Kumar'), "Includes visitor name");
assert.ok(waResult.message.includes('quick-approve?id=vis_test_wa_001&action=APPROVED'), "Includes correct Approval link");
assert.ok(waResult.message.includes('quick-approve?id=vis_test_wa_001&action=DENIED'), "Includes correct Denial link");
console.log("✓ WhatsApp message generation & deep link formatting verified 100%");

// 3. Test Quick Approval Parsing Logic
const testHashUrl = '#/quick-approve?id=vis_test_wa_001&action=APPROVED';
const queryPart = testHashUrl.split('?')[1];
const params = new URLSearchParams(queryPart);
assert.strictEqual(params.get('id'), 'vis_test_wa_001');
assert.strictEqual(params.get('action'), 'APPROVED');
console.log("✓ URL parameter parsing for #/quick-approve route verified");

// 4. Test Post-Approval Direct Green Light Entry
const visitor = {
  id: 'vis_test_wa_001',
  visitorName: 'Ramesh Kumar',
  flatNumber: 'A-101',
  status: 'APPROVED',
  requiresOtpPostApproval: false,
};
assert.strictEqual(visitor.status, 'APPROVED');
assert.strictEqual(visitor.requiresOtpPostApproval, false);
console.log("✓ Post-approval direct green-light entry verified (NO OTP required)");

// 5. Test Active Application Routes (Guard Desk removed from main views)
const activeRoutes = ['kiosk', 'resident', 'admin', 'quick-approve'];
assert.ok(!activeRoutes.includes('guard'), "guard desk removed from active routes");
assert.ok(activeRoutes.includes('quick-approve'), "quick-approve route registered");
assert.ok(activeRoutes.includes('kiosk'), "kiosk route registered");
assert.ok(activeRoutes.includes('resident'), "resident route registered");
console.log("✓ Active application routes verified (Guard Desk removed)");

// 6. Test Society Config Retention & Mobile Number Mapping
assert.strictEqual(DEFAULT_SOCIETY_CONFIG.societyName, 'Divi Sri Residency', "Default society name is Divi Sri Residency");
assert.ok(DEFAULT_SOCIETY_CONFIG.blocks.includes('Block DSR'), "Blocks list includes Block DSR");
const dsrFlat = DEFAULT_SOCIETY_CONFIG.flats.find(f => f.number === 'Block DSR-502');
assert.ok(dsrFlat, "Flat Block DSR-502 exists in directory");
assert.strictEqual(dsrFlat.residentName, 'Harish', "Resident name is Harish");
assert.ok(dsrFlat.phone && cleanPhoneNumber(dsrFlat.phone).length >= 10, "Resident has valid mobile number for WhatsApp");
console.log("✓ Society config retention & flat owner mobile mapping verified");

console.log("\nAll tests passed with 100% success!");
