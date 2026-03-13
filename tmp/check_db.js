
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log("Checking 'contacts' table...");
    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching 'contacts':", error.message);
        if (error.message.includes("does not exist")) {
            console.log("Table 'contacts' does not exist. Creating it...");
            // We can't easily create tables via JS client without SQL exec, 
            // but we can try to insert and see columns.
        }
    } else {
        console.log("Table 'contacts' exists. Sample data:", data);
    }
}

checkTable();
