// Contentful Client Stub
export const contentfulClient = {
    getEntries: async (params: any) => {
        console.log("Mock getEntries", params);
        return { items: [] };
    }
};

// Supabase Client Stub
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cloudinary Helper
export const cloudinaryLoader = ({ src, width, quality }: any) => {
    const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];
    return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${params.join(',')}${src}`;
};

// Klaviyo Helper Stub
export const klaviyoTrack = async (event: string, properties: any) => {
    console.log("Klaviyo Track:", event, properties);
};
