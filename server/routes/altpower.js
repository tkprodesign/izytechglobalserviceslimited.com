function createAltPowerEnquiryHandler(db) { return async (req, res) => {
  const text = value => typeof value === 'string' ? value.trim() : '';
  const name = text(req.body?.name);
  const email = text(req.body?.email);
  const phone = text(req.body?.phone);
  if (!name || name.length > 200 || (!email && !phone)) {
    return res.status(400).json({ error: 'Enter your name and at least one contact detail: email or phone.' });
  }
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (phone && (phone.length > 30 || !/^\+?[\d\s().-]+$/.test(phone) || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15)) {
    return res.status(400).json({ error: 'Enter a valid phone number.' });
  }
  try {
    await db.query(
      'INSERT INTO contact_submissions (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5)',
      [name, email, phone || null, 'AltPower / Alternative Bank enquiry', 'Requested an inverter system estimate through the AltPower calculator.']
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('AltPower enquiry save failed:', err.message);
    res.status(500).json({ error: 'Could not save your details. Please try again.' });
  }
}; }

module.exports = { createAltPowerEnquiryHandler };
