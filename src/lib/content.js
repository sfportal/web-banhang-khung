// Nội dung riêng của từng khách (chân dung khách hàng, hành trình, câu hỏi thường gặp) lấy từ clients/<ma-khach>/client.json
import { CONTENT } from '../client.js';

export const PERSONAS = CONTENT.personas || [];
export const JOURNEY = CONTENT.journey || [];
export const FAQS = CONTENT.faqs || [];
export const LINE_LABEL = { combo: 'Combo', ...(CONTENT.line_labels || {}) };
