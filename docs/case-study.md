# Product decisions and lessons

## Use AI selectively
Meal selection is deterministic and inspectable. AI handles variable language, contextual intent and speech. This keeps core planning behavior reproducible while supporting everyday Hindi, Hinglish and English.

## Keep preparation separate from purchase
A cook listing ingredients or an owner approving meals must not authorize spending. The workflow requires a displayed, current basket and owner approval; changed basket terms invalidate that approval. Checkout is claimed once, with uncertain results routed to reconciliation.

## Refine from real use
Development conversations record a missed ingredient correction and a voice note that was not delivered when the cook replied after meal approval. The latter led to pending voice delivery after the recipient window opened and a regression test. The missing ingredient incident also exposed an observability gap: the original transcript was not retained, so the failure stage could not be conclusively identified.

## Be honest about system boundaries
Backend hooks can request executor work, but do not create an independent merchant executor. A separately authenticated receiver and durable recovery are required before claiming always-on autonomous ordering.

## Next evidence to collect
Measure ingredient extraction recall, intent accuracy by decision state, notification delivery outcomes, completion time and approval-to-order success using consented, anonymized examples. These are proposed evaluations, not existing results.
