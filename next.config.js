/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        loader: 'cloudinary',
        path: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/`,
    },
}

module.exports = nextConfig
