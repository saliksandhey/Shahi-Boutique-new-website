const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: 'd:/Shahi New Website/.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("URL:", supabaseUrl)
console.log("KEY exists:", !!supabaseKey)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUpload() {
  const buffer = Buffer.from('test image content', 'utf8')
  
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(`hero-banner/test.jpg`, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    })

  if (error) {
    console.error('UPLOAD ERROR:', error)
  } else {
    console.log('UPLOAD SUCCESS:', data)
  }
}

testUpload()
