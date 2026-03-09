export const IMAGES = {
  hero: 'https://d64gsuwffb70l.cloudfront.net/69ae89634411e5e9f9cffb50_1773046244067_d4480b18.png',
  cleaning: 'https://d64gsuwffb70l.cloudfront.net/69ae89634411e5e9f9cffb50_1773046271855_8a6f7556.png',
  cooking: 'https://d64gsuwffb70l.cloudfront.net/69ae89634411e5e9f9cffb50_1773046302689_9e1146a9.png',
  laundry: 'https://d64gsuwffb70l.cloudfront.net/69ae89634411e5e9f9cffb50_1773046348193_acd097f6.png',
  carWash: 'https://d64gsuwffb70l.cloudfront.net/69ae89634411e5e9f9cffb50_1773046373658_4fd307da.jpg',
  yard: 'https://d64gsuwffb70l.cloudfront.net/69ae89634411e5e9f9cffb50_1773046394348_95851092.jpg',
  waste: 'https://d64gsuwffb70l.cloudfront.net/69ae89634411e5e9f9cffb50_1773046434984_253c4d25.png',
  homeHelp: 'https://d64gsuwffb70l.cloudfront.net/69ae89634411e5e9f9cffb50_1773046493676_cf0b4eff.jpg',
  workers: [
    'https://d64gsuwffb70l.cloudfront.net/69ae89634411e5e9f9cffb50_1773046460719_114da1c7.jpg',
    'https://d64gsuwffb70l.cloudfront.net/69ae89634411e5e9f9cffb50_1773046471728_8382ba22.png',
    'https://d64gsuwffb70l.cloudfront.net/69ae89634411e5e9f9cffb50_1773046453794_b53d23f4.jpg',
    'https://d64gsuwffb70l.cloudfront.net/69ae89634411e5e9f9cffb50_1773046456442_db77e80b.jpg',
    'https://d64gsuwffb70l.cloudfront.net/69ae89634411e5e9f9cffb50_1773046463279_5b2a6598.jpg',
    'https://d64gsuwffb70l.cloudfront.net/69ae89634411e5e9f9cffb50_1773046459858_d3f14bd4.jpg',
  ],
};

export const MOCK_WORKERS = [
  {
    id: '1',
    name: 'Thandi Nkosi',
    photo: IMAGES.workers[0],
    services: ['House Cleaning', 'Laundry'],
    area: 'Johannesburg, Sandton',
    rating: 4.9,
    reviews: 127,
    experience: 5,
    verified: true,
    policeClear: true,
    cookingCert: false,
    bio: 'Experienced home cleaner with 5 years in the industry. I take pride in leaving every home spotless and organised.',
    hourlyRate: 120,
    available: true,
  },
  {
    id: '2',
    name: 'Sipho Dlamini',
    photo: IMAGES.workers[1],
    services: ['Cooking', 'Basic Home Help'],
    area: 'Cape Town, Southern Suburbs',
    rating: 4.8,
    reviews: 89,
    experience: 7,
    verified: true,
    policeClear: true,
    cookingCert: true,
    bio: 'Certified chef with a passion for traditional South African cuisine. I bring restaurant-quality meals to your home.',
    hourlyRate: 150,
    available: true,
  },
  {
    id: '3',
    name: 'Nomsa Mthembu',
    photo: IMAGES.workers[2],
    services: ['House Cleaning', 'Laundry', 'Basic Home Help'],
    area: 'Durban, Umhlanga',
    rating: 4.7,
    reviews: 64,
    experience: 3,
    verified: true,
    policeClear: true,
    cookingCert: false,
    bio: 'Dedicated and reliable home helper. I specialise in deep cleaning and laundry services with attention to detail.',
    hourlyRate: 110,
    available: true,
  },
  {
    id: '4',
    name: 'Bongani Zulu',
    photo: IMAGES.workers[3],
    services: ['Car Washing', 'Yard Cleaning', 'Waste Removal'],
    area: 'Pretoria, Centurion',
    rating: 4.9,
    reviews: 156,
    experience: 6,
    verified: true,
    policeClear: true,
    cookingCert: false,
    bio: 'Outdoor specialist handling car detailing, garden maintenance, and waste removal. Your property will look brand new.',
    hourlyRate: 130,
    available: true,
  },
  {
    id: '5',
    name: 'Zanele Khumalo',
    photo: IMAGES.workers[4],
    services: ['Cooking', 'House Cleaning'],
    area: 'Johannesburg, Rosebank',
    rating: 4.6,
    reviews: 42,
    experience: 4,
    verified: true,
    policeClear: true,
    cookingCert: true,
    bio: 'Certified cook and experienced cleaner. I offer a complete home service experience with warmth and professionalism.',
    hourlyRate: 140,
    available: false,
  },
  {
    id: '6',
    name: 'Lerato Molefe',
    photo: IMAGES.workers[5],
    services: ['Laundry', 'House Cleaning', 'Basic Home Help'],
    area: 'Cape Town, Constantia',
    rating: 4.8,
    reviews: 98,
    experience: 8,
    verified: true,
    policeClear: true,
    cookingCert: false,
    bio: '8 years of professional home service experience. I treat every home as if it were my own.',
    hourlyRate: 125,
    available: true,
  },
];

export const TESTIMONIALS = [
  {
    name: 'Sarah van der Merwe',
    location: 'Sandton, Johannesburg',
    text: 'Red Face has been a game-changer for our family. Thandi comes every week and our home has never been cleaner. The verification process gives us total peace of mind.',
    rating: 5,
  },
  {
    name: 'James Pillay',
    location: 'Umhlanga, Durban',
    text: 'I was nervous about having someone come to cook in my home, but seeing the verified badge and cooking certificate made all the difference. The food was incredible!',
    rating: 5,
  },
  {
    name: 'Anele Mbeki',
    location: 'Centurion, Pretoria',
    text: 'Bongani did an amazing job on our yard and cars. Professional, on time, and the payment system is so convenient. Highly recommend Red Face!',
    rating: 5,
  },
  {
    name: 'Lisa Fourie',
    location: 'Constantia, Cape Town',
    text: 'The booking process is seamless and I love that I can see exactly who is coming to my home before they arrive. Trust and transparency at its best.',
    rating: 4,
  },
];

export const FAQ_ITEMS = [
  {
    q: 'How does Red Face verify workers?',
    a: 'Every worker undergoes a thorough verification process including South African ID verification, police clearance checks, and certificate validation for specialised services like cooking. Only workers who pass all checks receive the "Verified by Red Face" badge.',
  },
  {
    q: 'When do I pay for the service?',
    a: 'You only pay after the job is completed to your satisfaction. All payments are processed securely through our website — you never pay the worker directly.',
  },
  {
    q: 'What happens if I need to cancel a booking?',
    a: 'You can cancel free of charge before a worker is assigned. If you cancel after a worker has been assigned or is on their way, a cancellation fee applies. You will be informed of the fee before confirming your booking.',
  },
  {
    q: 'How are workers matched to my request?',
    a: 'You can either browse and choose a specific worker, or let our platform automatically match you with the best available worker based on your service needs, location, and worker ratings.',
  },
  {
    q: 'Are workers employed by Red Face?',
    a: 'Workers are independent service providers who operate under Red Face standards, uniform, and verification. They are self-employed professionals who meet our quality and safety requirements.',
  },
  {
    q: 'What areas do you serve?',
    a: 'We currently operate in major South African cities including Johannesburg, Cape Town, Durban, and Pretoria, with plans to expand to more areas soon.',
  },
  {
    q: 'Can I request the same worker again?',
    a: 'Yes! You can save workers as favourites and request them directly for future bookings. Building a trusted relationship with your preferred worker is encouraged.',
  },
  {
    q: 'What if I am not satisfied with the service?',
    a: 'We have a dispute resolution process. If you are not satisfied, you can report the issue through your dashboard and our admin team will investigate and resolve it promptly.',
  },
];

export const SERVICE_CATEGORIES = [
  { name: 'House Cleaning', icon: IMAGES.cleaning, price: 'R250 - R600', duration: '3 hours', desc: 'Professional deep cleaning, dusting, mopping, and sanitising of your home.' },
  { name: 'Cooking', icon: IMAGES.cooking, price: 'R300 - R800', duration: '4 hours', desc: 'Certified home cooks prepare delicious meals in your kitchen.' },
  { name: 'Laundry', icon: IMAGES.laundry, price: 'R200 - R450', duration: '2.5 hours', desc: 'Washing, ironing, and folding of your clothes and linen.' },
  { name: 'Car Washing', icon: IMAGES.carWash, price: 'R150 - R400', duration: '2 hours', desc: 'Interior and exterior car cleaning at your home.' },
  { name: 'Yard Cleaning', icon: IMAGES.yard, price: 'R200 - R500', duration: '3 hours', desc: 'Garden maintenance, lawn mowing, hedge trimming, and yard tidying.' },
  { name: 'Waste Removal', icon: IMAGES.waste, price: 'R300 - R700', duration: '2 hours', desc: 'Responsible removal and disposal of household waste and refuse.' },
  { name: 'Basic Home Help', icon: IMAGES.homeHelp, price: 'R180 - R400', duration: '3 hours', desc: 'General household assistance including errands and organising.' },
];

export const SOUTH_AFRICAN_CITIES = [
  'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
  'Bloemfontein', 'East London', 'Polokwane', 'Nelspruit', 'Kimberley',
];

export const COMMISSION_RATE = 0.20; // 20% platform commission
export const CANCELLATION_FEE_RATE = 0.30; // 30% of booking total
