import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const products = [
    {
        name: 'Organic Red Tomatoes',
        price: 45,
        unit: 'kg',
        category: 'fresh',
        stock: 100,
        seller_id: 'sample_farmer_1',
        description: 'Freshly harvested organic tomatoes from Nashik farms.',
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'
    },
    {
        name: 'Premium Wheat Seeds',
        price: 1200,
        unit: 'bag',
        category: 'seeds',
        stock: 50,
        seller_id: 'sample_seller_2',
        description: 'High-yield wheat seeds for winter season.',
        image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500'
    },
    {
        name: 'Fresh Spinach (Palak)',
        price: 30,
        unit: 'bunch',
        category: 'fresh',
        stock: 60,
        seller_id: 'sample_farmer_1',
        description: 'Ultra fresh nutrient rich green spinach.',
        image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500'
    }
];

async function seed() {
    console.log('Seeding products to:', supabaseUrl);
    try {
        const { error } = await supabase.from('products').insert(products);
        if (error) {
            console.error('Error seeding data:', JSON.stringify(error, null, 2));
        } else {
            console.log('Successfully seeded sample products!');
        }
    } catch (e) {
        console.error('Catch error:', e);
    }
}

seed();
