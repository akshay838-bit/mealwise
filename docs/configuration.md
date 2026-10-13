# Configuration and integration boundaries

Use `.env.example` as a configuration inventory. The Worker also reads OPENAI_API_KEY, SETUP_TOKEN, WHATSAPP_BUSINESS_ACCOUNT_ID and optional GROCERY_EXECUTOR_WAKE_URL/GROCERY_EXECUTOR_WAKE_TOKEN. Configure real values as deployment secrets, never in source.

The `.openai/hosting.json` file contains local binding declarations only; the original live project identifier is omitted. Hosted deployment requires provisioning a new project and D1 binding. The source retains starter-specific hosting adapters.

The optional grocery bridge reads an ignored `.meal-agent-executor.json` with baseUrl, token and ready fields. Leave ready false until the external executor has been verified. Do not call a production bridge while running tests. A bridge or wake URL is not itself a merchant executor.
