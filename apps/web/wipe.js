import { Client } from 'pg';

async function clear() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_40htcjDmsBZn@ep-cool-sunset-ayz7fxe2-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
  });
  
  await client.connect();
  
  await client.query('DELETE FROM "MatchMove"');
  await client.query('DELETE FROM "MatchPlayer"');
  await client.query('DELETE FROM "Stake"');
  await client.query('DELETE FROM "Match"');
  
  await client.end();
  console.log("DB Wiped successfully via direct pg!");
}

clear();
