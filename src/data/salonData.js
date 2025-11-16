export const slideshowImages = [
    { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop&crop=center', alt: 'Modern salon interior' },
    { url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=400&fit=crop&crop=center', alt: 'Hair cutting' },
    { url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&h=400&fit=crop&crop=center', alt: 'Styling' }
]

export const salonData = {
    Kaichar: [{
            id: 'raj-beauty',
            name: 'Raj Beauty Parlour',
            address: 'Near Kaichar Market, Kaichar',
            services: 'Hair Cut • Facial Treatment',
            rating: '4.8',
            status: 'Open',
            hours: '9:00 AM - 8:00 PM',
            waiting: '3 waiting',
            time: '15 min',
            phone: '+91 98765 43210',
            ratingCount: 245,
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop&crop=center',
            detailImages: [
                { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop&crop=center' },
                { url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=400&fit=crop&crop=center' }
            ],
            servicesList: [
                { name: 'Hair Cut', price: 300, duration: '30 min', category: 'unisex' },
                { name: 'Facial Treatment', price: 800, duration: '60 min', category: 'unisex' },
                { name: 'Beard Trim', price: 200, duration: '20 min', category: 'men' },
                { name: 'Manicure', price: 400, duration: '45 min', category: 'women' }
            ]
        },
        {
            id: 'glamour-studio',
            name: 'Glamour Studio',
            address: 'Main Road, Kaichar',
            services: 'Hair Styling • Makeup',
            rating: '4.6',
            status: 'Open',
            hours: '10:00 AM - 9:00 PM',
            waiting: '2 waiting',
            time: '10 min',
            phone: '+91 98765 43211',
            ratingCount: 189,
            image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=300&fit=crop&crop=center',
            detailImages: [
                { url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=400&fit=crop&crop=center' }
            ],
            servicesList: [
                { name: 'Hair Styling', price: 600, duration: '45 min', category: 'unisex' },
                { name: 'Bridal Makeup', price: 2500, duration: '120 min', category: 'women' }
            ]
        }
    ]
}

// Example closed salon (for testing faded UI)
salonData.Kaichar.push({
    id: 'sunset-salon-closed',
    name: 'Sunset Salon',
    address: 'Opposite Lakeside, Kaichar',
    services: 'Hair Cut • Spa • Waxing',
    rating: '4.2',
    status: 'Closed',
    hours: '10:00 AM - 6:00 PM',
    waiting: '',
    time: '',
    phone: '+91 98765 43333',
    ratingCount: 58,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop&crop=center',
    detailImages: [
        { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=400&fit=crop&crop=center' }
    ],
    servicesList: [
        { name: 'Hair Cut', price: 350, duration: '30 min', category: 'unisex' },
        { name: 'Relaxing Spa', price: 1200, duration: '90 min', category: 'unisex' },
        { name: 'Waxing', price: 500, duration: '40 min', category: 'women' }
    ]
})