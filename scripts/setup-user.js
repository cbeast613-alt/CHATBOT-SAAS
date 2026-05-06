const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local since dotenv might not be installed
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local not found!");
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupUser(email, password, businessName) {
  console.log(`🚀 Creating user: ${email}...`);

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { business_name: businessName }
  });

  if (authError) {
    console.error("❌ Auth Error:", authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log(`✅ Auth user created! ID: ${userId}`);

  const { error: tenantError } = await supabase.from('tenants').insert({
    id: userId,
    name: businessName,
    email: email,
    plan: 'growth',
    is_active: true,
    message_limit: 2000,
    monthly_message_count: 0
  });

  if (tenantError) {
    console.error("❌ Tenant Error:", tenantError.message);
  } else {
    console.log(`✅ Tenant profile created!`);
    console.log(`\n🎉 DONE! You can now LOG IN at http://localhost:3000/auth using:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  }
}

// You can change these details here:
setupUser('admin@yourbot.in', 'Admin123!', 'Admin Store');
