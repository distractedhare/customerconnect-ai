// Google Form anonymous feedback proxy
// No API keys needed — submissions go to a Google Sheet via Google Forms.
//
// HOW TO SET UP:
// 1. Create a Google Form with 5 short-answer/paragraph fields:
//    - Rating, Answers, Objection, Comment, Timestamp
// 2. Get the form ID from the URL: https://docs.google.com/forms/d/e/FORM_ID/viewform
// 3. Get each field's entry ID: open the form, inspect the HTML, find "entry.XXXXXXX"
// 4. Set these env vars in Vercel:
//    - GOOGLE_FORM_ID
//    - GFORM_ENTRY_RATING
//    - GFORM_ENTRY_ANSWERS
//    - GFORM_ENTRY_OBJECTION
//    - GFORM_ENTRY_COMMENT
//    - GFORM_ENTRY_TIMESTAMP

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const formId = process.env.GOOGLE_FORM_ID;

  if (!formId) {
    return res.status(503).json({
      error: 'Feedback form is not configured.',
      hint: 'Set GOOGLE_FORM_ID in your Vercel environment variables.',
    });
  }

  const entryRating = process.env.GFORM_ENTRY_RATING || 'entry.0';
  const entryAnswers = process.env.GFORM_ENTRY_ANSWERS || 'entry.1';
  const entryObjection = process.env.GFORM_ENTRY_OBJECTION || 'entry.2';
  const entryComment = process.env.GFORM_ENTRY_COMMENT || 'entry.3';
  const entryTimestamp = process.env.GFORM_ENTRY_TIMESTAMP || 'entry.4';

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { rating, answers, comment, timestamp } = body;

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'No feedback data provided.' });
  }

  // Format answers as readable text for the Google Form field
  const answersText = Object.entries(answers)
    .map(([question, answer]) => `${question}: ${answer}`)
    .join('\n');

  // Find the objection field if it exists
  const objection = answers['Hardest objection right now'] || '';

  // Build the Google Form submission URL
  const formUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
  const params = new URLSearchParams();
  params.append(entryRating, rating ? `${rating}/5` : 'Not rated');
  params.append(entryAnswers, answersText);
  params.append(entryObjection, objection);
  params.append(entryComment, comment || '');
  params.append(entryTimestamp, timestamp || new Date().toISOString());

  try {
    const response = await fetch(formUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    // Google Forms returns 200 even on success (it redirects to a thank-you page)
    // Any 2xx or redirect means the submission went through
    if (response.ok || response.status === 302 || response.status === 303) {
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit feedback.';
    return res.status(500).json({ error: message });
  }
}
