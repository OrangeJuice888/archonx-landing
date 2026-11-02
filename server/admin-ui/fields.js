/* Field metadata for every numeric path in content/site-content.json, keyed by dotted path.
   label: what the admin sees. unit: the words after the amount. kind: price (an ArchonX price:
   $ input, "+ GST", must end in 00), cost (a third-party estimate billed at cost: $ input, no GST
   hint, no 00 rule), count (a plain number) or other (never edited). shownAs: where the figure
   appears on the website. exempt: a price that is allowed not to end in 00.
   Plain script: sets window.AX_FIELDS; app.js reads it. server/admin-ui/check-fields.mjs
   checks this file against content/site-content.json. */
(function () {
  'use strict';

  var F = {};
  function add(path, label, unit, kind, shownAs, extra) {
    var f = { label: label, unit: unit, kind: kind, shownAs: shownAs };
    if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) f[k] = extra[k];
    F[path] = f;
  }

  add('version', 'Schema version', '', 'other', 'Not shown anywhere. Fixed at 1 and never edited.');

  /* Packages */
  add('pricing.packs.front.monthly', 'Front Desk, monthly fee', 'a month', 'price',
    'Front Desk pack card, the fact sheet price table, the "What does it actually cost?" answer and the GST example ("$400 a month is $440 including GST"); also the Packages tier on the How we\'re different page.');
  add('pricing.packs.front.setup', 'Front Desk, setup', 'one-off', 'price',
    'Front Desk pack card and the fact sheet ("$400 a month + $1,500 setup"); the Packages tier on How we\'re different. The page says "from", so the lowest industry setup should match this figure.');
  add('pricing.packs.front.own', 'Front Desk, own it outright', 'one-off', 'price',
    '"Own what we build, outright: From $3,900 + GST", "Front Desk from $3,900 + GST" in the one-off build paragraph, and the Packages tier on How we\'re different. The lowest industry own price should match this figure.');
  add('pricing.packs.back.monthly', 'Back Office, monthly fee', 'a month', 'price',
    'Back Office pack card and the fact sheet ("$800 a month + $4,000 setup").');
  add('pricing.packs.back.setup', 'Back Office, setup', 'one-off', 'price',
    'Back Office pack card and the fact sheet.');
  add('pricing.packs.back.own', 'Back Office, own it outright', 'one-off', 'price',
    '"Back Office from $8,800 + GST" in the one-off build paragraph.');
  add('pricing.packs.whole.monthly', 'Whole Shop, monthly fee', 'a month', 'price',
    'Whole Shop pack card and the fact sheet ("$1,200 a month + $6,900 setup").');
  add('pricing.packs.whole.setup', 'Whole Shop, setup', 'one-off', 'price',
    'Whole Shop pack card and the fact sheet.');
  add('pricing.packs.whole.own', 'Whole Shop, own it outright', 'one-off', 'price',
    '"Whole Shop from $14,100 + GST" in the one-off build paragraph.');

  /* Industry setups */
  var industries = [
    ['trades', 'Trades', ''],
    ['dental', 'Dental and allied health', 'Paired with Legal in the sentence "from $4,400 with clinic or legal setup"; the package builder also prints "(from $4,400 with clinic or legal setup)".'],
    ['realestate', 'Real estate and property management', 'Paired with Freight, logistics and warehousing in the sentence "from $4,200 with property or freight setup".'],
    ['accounting', 'Accounting and bookkeeping', ''],
    ['legal', 'Legal', 'Paired with Dental and allied health in the sentence "from $4,400 with clinic or legal setup"; the package builder also prints "(from $4,400 with clinic or legal setup)".'],
    ['hospitality', 'Hospitality', ''],
    ['retail', 'Retail', ''],
    ['salons', 'Barbershops and salons', ''],
    ['automotive', 'Automotive workshops', 'Paired with Gyms and fitness studios in the sentence "from $4,100 with workshop or studio setup".'],
    ['cleaning', 'Cleaning services', ''],
    ['gyms', 'Gyms and fitness studios', 'Paired with Automotive workshops in the sentence "from $4,100 with workshop or studio setup".'],
    ['logistics', 'Freight, logistics and warehousing', 'Paired with Real estate and property management in the sentence "from $4,200 with property or freight setup".']
  ];
  for (var i = 0; i < industries.length; i++) {
    var key = industries[i][0], name = industries[i][1], pair = industries[i][2];
    add('pricing.industries.' + key + '.setup', name + ', setup', 'one-off', 'price',
      'Setup price in the package builder when ' + name + ' is picked.' + (pair ? ' ' + pair : ''));
    add('pricing.industries.' + key + '.own', name + ', own it outright', 'one-off', 'price',
      'One-off build price in the package builder when ' + name + ' is picked.' + (pair ? ' ' + pair : ''));
  }

  /* Front desk services */
  add('pricing.frontDesk.receptionist.monthly', 'AI Receptionist, monthly', 'a month', 'price',
    'AI Receptionist service card ("from $300/mo + $500 setup + GST").');
  add('pricing.frontDesk.receptionist.setup', 'AI Receptionist, setup', 'one-off', 'price',
    'AI Receptionist service card ("from $300/mo + $500 setup + GST").');
  add('pricing.frontDesk.receptionist.ownFrom', 'AI Receptionist, one-off build from', 'one-off', 'price',
    'AI Receptionist service card ("One-off build from $2,900 + GST").');
  add('pricing.frontDesk.receptionist.includedMinutes', 'AI Receptionist, call minutes included', 'minutes a month', 'count',
    '"Includes 300 call minutes" on the AI Receptionist card.');
  add('pricing.frontDesk.receptionist.extraMinute', 'Extra call minute', 'a minute', 'cost',
    '"extra minutes $0.35 each" on the AI Receptionist card, "$0.35 a minute as you go" in the extras list and "($0.35 each)" in the FAQ "What does it really cost once everything\'s added up?".');
  add('pricing.frontDesk.chat.monthly', 'Chat agent, monthly', 'a month', 'price',
    'Website and Social Chat Agent card ("from $200/mo + $500 setup").');
  add('pricing.frontDesk.chat.setup', 'Chat agent, setup', 'one-off', 'price',
    'Website and Social Chat Agent card ("from $200/mo + $500 setup").');
  add('pricing.frontDesk.chat.includedConversations', 'Chat agent, conversations included', 'conversations a month', 'count',
    '"Includes 500 conversations" on the Website and Social Chat Agent card.');
  add('pricing.frontDesk.chat.extraConversation', 'Extra chat conversation', 'a conversation', 'cost',
    '"$0.20 a conversation" on the Website and Social Chat Agent card.');
  add('pricing.frontDesk.leadFollowUp.monthly', 'Instant lead follow-up, monthly', 'a month', 'price',
    'Instant Lead Follow-up card ("from $200/mo + $500 setup").');
  add('pricing.frontDesk.leadFollowUp.setup', 'Instant lead follow-up, setup', 'one-off', 'price',
    'Instant Lead Follow-up card ("from $200/mo + $500 setup").');
  add('pricing.frontDesk.leadFollowUp.smsCost', 'SMS above the allowance', 'a message', 'cost',
    '"about $0.10 a message, at cost" in the "What is never included in our price" paragraph and on the Instant Lead Follow-up card.');
  add('pricing.frontDesk.reviews.monthly', 'Reviews and reputation, monthly add-on', 'a month', 'price',
    'Reviews and Reputation card ("add-on $100/mo + GST").');

  /* Back office services */
  add('pricing.backOffice.inbox.monthly', 'Inbox and admin assistant, monthly', 'a month', 'price',
    'Inbox and Admin Assistant card ("from $500/mo + $1,000 setup").');
  add('pricing.backOffice.inbox.setup', 'Inbox and admin assistant, setup', 'one-off', 'price',
    'Inbox and Admin Assistant card ("from $500/mo + $1,000 setup").');
  add('pricing.backOffice.quotesInvoices.from', 'Quotes, invoices and bookkeeping, from', 'one-off', 'price',
    'Quotes, Invoices and Bookkeeping Automation card ("from $1,900 one-off + GST").');
  add('pricing.backOffice.meetings.monthly', 'Meeting notes and CRM updates, monthly', 'a month', 'price',
    'Meeting Notes and CRM Updates card ("from $100/mo + $500 setup + GST").');
  add('pricing.backOffice.meetings.setup', 'Meeting notes and CRM updates, setup', 'one-off', 'price',
    'Meeting Notes and CRM Updates card ("from $100/mo + $500 setup + GST").');
  add('pricing.backOffice.content.monthly', 'Content and marketing automation, monthly', 'a month', 'price',
    'Content and Marketing Automation card ("from $200/mo + $700 setup + GST").');
  add('pricing.backOffice.content.setup', 'Content and marketing automation, setup', 'one-off', 'price',
    'Content and Marketing Automation card ("from $200/mo + $700 setup + GST").');

  /* Builds */
  add('pricing.builds.workflow.from', 'Workflow automation, from', 'one-off', 'price',
    'Workflow Automation card ("from $2,900 per workflow + GST"), the extras list ("Extra workflow automation: from $2,900 + GST one-off"), the fact sheet, the Custom builds tier on How we\'re different, and the audit\'s budget-fit table.');
  add('pricing.builds.workflow.multiSystemFrom', 'Multi-system workflow build, from', 'one-off', 'price',
    'Workflow Automation card ("Multi-system builds (three or more apps) from $9,000").');
  add('pricing.builds.workflow.toolsLow', 'Workflow tool subscriptions, low estimate', 'a month', 'cost',
    '"Tool subscriptions, typically $50 to $150 a month" on the Workflow Automation card.');
  add('pricing.builds.workflow.toolsHigh', 'Workflow tool subscriptions, high estimate', 'a month', 'cost',
    '"Tool subscriptions, typically $50 to $150 a month" on the Workflow Automation card.');
  add('pricing.builds.documents.from', 'Document and clinic paperwork automation, from', 'one-off', 'price',
    'Document and Clinic Paperwork Automation card ("from $7,500 + $300/mo + GST") and the extras list ("from $7,500 + GST one-off plus from $300 a month").');
  add('pricing.builds.documents.monthly', 'Document and clinic paperwork automation, monthly', 'a month', 'price',
    'Document and Clinic Paperwork Automation card ("from $7,500 + $300/mo + GST") and the extras list.');
  add('pricing.builds.pilot.upTo20', '90-day pilot, up to 20 staff', 'one-off', 'price',
    '90-Day Pilot card ("from $5,900 + GST, up to 20 staff"), the Programs section ("From $5,900 + GST") and the Custom builds tier on How we\'re different.');
  add('pricing.builds.pilot.upTo50', '90-day pilot, 21 to 50 staff', 'one-off', 'price',
    '90-Day Pilot card ("From $8,900 for 21 to 50 staff").');
  add('pricing.builds.takeover.from', 'Taking over someone else\'s build, from', 'one-off', 'price',
    'Build, Train and Hand Over card ("Taking over and documenting a system someone else built: from $1,000").');

  /* Advice and training */
  add('pricing.advice.audit.fixed', 'AI readiness audit, fixed', 'one-off', 'price',
    'AI Readiness Audit card ("fixed $1,000 + GST"), the quote paragraph ("the $1,000 audit first"), the extras list, the fact sheet and the Programs section.');
  add('pricing.advice.governance.from', 'AI risk, governance and policy review, from', 'one-off', 'price',
    'AI Risk, Governance and Policy Review card ("review and policy from $1,500 + GST").');
  add('pricing.advice.training.perSeatFrom', 'Training, per seat from', 'per seat', 'price',
    'Training, Workshops and Cohort Programs card ("from $300 a seat + GST").');
  add('pricing.advice.training.teamDay', 'Team AI Day (half day)', 'one-off', 'price',
    'Training card ("Half-day Team AI Day $1,500 for up to eight people") and the Paid Team AI Day in Programs ("$1,500 + GST per team").');
  add('pricing.advice.training.buildDay', 'Team Build Day (full day)', 'one-off', 'price',
    'Training card ("full-day Team Build Day $3,900 for up to twelve").');
  add('pricing.advice.training.policyMorning', 'AI Policy Morning', 'one-off', 'price',
    'Paid AI Policy Morning in Programs ("$500 + GST per firm").');
  add('pricing.advice.carePlan.light', 'Care plan, Light', 'a month', 'price',
    'Care Plan card ("Light · Standard · Full $200 · $500 · $1,000/mo + GST") and the extras list ("Light $200, Standard $500, Full $1,000 a month").');
  add('pricing.advice.carePlan.standard', 'Care plan, Standard', 'a month', 'price',
    'Care Plan card and the extras list.');
  add('pricing.advice.carePlan.full', 'Care plan, Full', 'a month', 'price',
    'Care Plan card and the extras list.');

  /* App review and launch */
  add('pricing.app.review', 'App review, fixed', 'one-off', 'price',
    'The review card ("$2,900 fixed + GST", "Including GST: $3,190"), the app summary table, the intro line ("a $2,900 fixed review") and the Custom builds tier on How we\'re different.');
  add('pricing.app.launch', 'App launch package, fixed', 'one-off', 'price',
    'The launch package card ("$10,000 fixed + GST", "Including GST: $11,000"), the app summary table and the intro line.');
  add('pricing.app.care', 'App care plan, monthly', 'a month', 'price',
    'App care plan card ("$500 a month + GST", "Including GST: $550 a month"), the app summary table and the intro line ("app care from $500 a month").');
  add('pricing.app.careAdvisor', 'App care plus advisor, monthly', 'a month', 'price',
    '"App care plus advisor at $1,000 a month + GST" in the app notes and the app summary table.');
  add('pricing.app.hourly', 'Ad-hoc engineering, hourly', 'an hour', 'price',
    '"Ad-hoc engineering: $200 an hour + GST in two-hour blocks" in the app notes and summary table.');
  add('pricing.app.prepaidBlock', 'Prepaid 10-hour engineering block', 'one-off', 'price',
    '"a prepaid 10-hour block for $1,500 + GST on any care plan" in the app notes and summary table.');

  /* Engineer */
  add('pricing.engineer.twoWeekSystem', 'One working system in two weeks', 'one-off', 'price',
    'Engineer table ("One working system in two weeks … $10,000 + GST") and the fact sheet.');
  add('pricing.engineer.fourWeekBuild', 'Four-week build', 'one-off', 'price',
    'Engineer table ("Four-week build: up to three connected systems … $20,000 + GST").');
  add('pricing.engineer.embeddedTwoDays', 'Embedded engineer, two days a week', 'a month', 'price',
    'Engineer table ("Embedded engineer, two days a week $8,800 a month + GST") and the fact sheet ("$8,800 or $12,900 a month").');
  add('pricing.engineer.embeddedThreeDays', 'Embedded engineer, three days a week', 'a month', 'price',
    'Engineer table ("Embedded engineer, three days a week $12,900 a month + GST") and the fact sheet.');

  /* Extras */
  add('pricing.extras.extraMinutes500', 'Extra 500 call minutes', 'a month', 'price',
    'Extras list ("Extra 500 call minutes: $200/mo + GST").');
  add('pricing.extras.phoneNumberMonthly', 'Extra Australian phone number or line', 'a month', 'cost',
    'Extras list ("about $15/mo, billed at cost"), the AI Receptionist card ("Australian number about $15 a month, billed at cost") and the FAQ ("your phone number (about $15 a month)").');
  add('pricing.extras.frontDeskExtrasLow', 'Front Desk extras, low estimate', 'a month', 'cost',
    '"expect those extras to add between $20 and $80 a month" in the FAQ "What does it really cost once everything\'s added up?".');
  add('pricing.extras.frontDeskExtrasHigh', 'Front Desk extras, high estimate', 'a month', 'cost',
    '"expect those extras to add between $20 and $80 a month" in the FAQ "What does it really cost once everything\'s added up?".');
  add('pricing.extras.providerCostsLow', 'Provider costs on a one-off build, low estimate', 'a month', 'cost',
    'The "$60 to $250" provider-cost range in the one-off build paragraph.');
  add('pricing.extras.providerCostsHigh', 'Provider costs on a one-off build, high estimate', 'a month', 'cost',
    'The "$60 to $250" provider-cost range in the one-off build paragraph.');

  /* Bluework */
  add('pricing.bluework.perEmployeeMonthly', 'Bluework, per active employee', 'per employee a month', 'price',
    'The Bluework tier on How we\'re different ("From A$8 per active employee a month (minimum four), + GST"). Allowed not to end in 00.', { exempt: true });
  add('pricing.bluework.minimumEmployees', 'Bluework, minimum employees', 'employees', 'count',
    '"(minimum four)" on the Bluework tier of How we\'re different, shown as a numeral.');

  window.AX_FIELDS = F;
})();
