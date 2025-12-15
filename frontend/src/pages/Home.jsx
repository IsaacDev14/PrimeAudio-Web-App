import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Award, Truck, Headphones, Shield, Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

const HeroProductCard = ({ product, rotateDuration }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Get images array (use images array or fallback to image_url)
    const images = product.images?.length > 0 ? product.images : [product.image_url];

    const nextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: rotateDuration, repeat: Infinity, ease: "linear" }}
        >
            <Link
                to={`/shop/${product.id}`}
                className="block bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl w-60 hover:scale-105 transition-transform duration-300 group font-sans border border-white/20"
            >
                <div className="relative h-36 bg-gray-100 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImageIndex}
                            src={images[currentImageIndex]}
                            alt={product.name}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </AnimatePresence>

                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm z-10">
                        <span className="text-[10px] font-bold text-slate-900">Featured</span>
                    </div>

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute top-1/2 left-2 -translate-y-1/2 p-1 bg-white/90 hover:bg-white rounded-full text-slate-900 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            >
                                <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute top-1/2 right-2 -translate-y-1/2 p-1 bg-white/90 hover:bg-white rounded-full text-slate-900 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            >
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </>
                    )}

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1 h-1 rounded-full shadow-sm transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-3 text-left">
                    <h3 className="font-bold text-slate-900 text-xs leading-tight line-clamp-1 mb-1">{product.name}</h3>
                    <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900 text-xs">KSh {product.price?.toLocaleString()}</span>
                        <div className="flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-black text-black" />
                            <span className="text-[10px] font-medium">4.9</span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const brands = [
        { name: 'Yamaha', domain: 'yamaha.com' },
        { name: 'Fender', domain: 'fender.com' },
        { name: 'Gibson', domain: 'gibson.com' },
        { name: 'Roland', domain: 'roland.com' },
        { name: 'Korg', domain: 'korg.com' },
        { name: 'Behringer', domain: 'behringer.com' },
        { name: 'Shure', domain: 'shure.com' },
        { name: 'Pioneer DJ', domain: 'pioneerdj.com' },
        { name: 'Audio-Technica', domain: 'audio-technica.com' },
        { name: 'JBL', domain: 'jbl.com' }
    ];

    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async () => {
        try {
            // Fetch featured products
            const productsRes = await fetch('http://localhost:8000/products/featured?limit=6');
            if (productsRes.ok) {
                const products = await productsRes.json();
                setFeaturedProducts(products);
            }

            // Fetch testimonials
            const testimonialsRes = await fetch('http://localhost:8000/testimonials/?limit=6&verified_only=true');
            if (testimonialsRes.ok) {
                const testimonialsData = await testimonialsRes.json();
                setTestimonials(testimonialsData);
            }
        } catch (error) {
            console.error('Failed to fetch home data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get 3 products for the orbit display
    const orbitProducts = featuredProducts.slice(0, 3);

    return (
        <div className="bg-white">
            <SEO
                title="Premium Audio Gear Store"
                description="Shop the best in premium audio gear. Headphones, speakers, microphones, and more at Prime Audio."
                keywords="audio, headphones, speakers, sound gear, nairobi audio store"
            />
            {/* Quantum Hero Section */}
            <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-slate-950">
                {/* Animated Background - Orbits & Rotations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border border-slate-700/50 rounded-full"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-[100px] border border-slate-600/40 rounded-full border-dashed"
                        />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-[200px] border border-blue-500/20 rounded-full"
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full blur-[2px] shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
                        </motion.div>
                    </div>

                    <div className="absolute inset-0">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    x: Math.random() * 1000 - 500,
                                    y: Math.random() * 1000 - 500,
                                    opacity: 0
                                }}
                                animate={{
                                    y: [null, Math.random() * -100],
                                    opacity: [0, 0.5, 0]
                                }}
                                transition={{
                                    duration: Math.random() * 5 + 5,
                                    repeat: Infinity,
                                    ease: "linear",
                                    delay: Math.random() * 5
                                }}
                                className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full"
                            />
                        ))}
                    </div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center gap-2 bg-slate-900/50 backdrop-blur-md border border-slate-700 px-4 py-1.5 rounded-full mb-6"
                                >
                                    <Award className="w-4 h-4 text-prime-red" />
                                    <span className="text-slate-300 text-sm font-medium tracking-wide uppercase">Authorized Yamaha Dealer Since 2010</span>
                                </motion.div>

                                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-8">
                                    East Africa's <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-prime-red to-orange-500">
                                        Premier Music
                                    </span> <br />
                                    Equipment Store
                                </h1>

                                <p className="text-xl text-slate-400 max-w-xl leading-relaxed mb-10">
                                    Professional instruments, expert guidance, and unmatched service.
                                    Join 5,000+ musicians who trust Prime Audio for their sound.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-5">
                                    <Link
                                        to="/shop"
                                        className="group relative px-8 py-4 bg-prime-red hover:bg-red-600 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] overflow-hidden"
                                    >
                                        <span className="relative flex items-center gap-2">
                                            Browse Products <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Link>
                                    <button className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-600 rounded-full font-bold text-lg transition-all backdrop-blur-sm flex items-center gap-2">
                                        <Play className="w-5 h-5 fill-current" />
                                        Watch Story
                                    </button>
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-800/50">
                                {[
                                    { value: '14+', label: 'Years Experience' },
                                    { value: '5k+', label: 'Happy Musicians' },
                                    { value: '100%', label: 'Authentic Gear' }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + i * 0.1 }}
                                    >
                                        <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                        <div className="text-slate-500 text-xs uppercase tracking-wider">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Orbit with Featured Products */}
                        <div className="relative hidden lg:block h-[600px] perspective-1000 flex items-center justify-center">
                            <div className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[80px] animate-pulse" />

                            {orbitProducts.length >= 3 ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                                    className="relative w-[500px] h-[500px] rounded-full border border-white/5"
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <HeroProductCard product={orbitProducts[0]} rotateDuration={50} />
                                    </div>
                                    <div className="absolute bottom-10 -right-5">
                                        <HeroProductCard product={orbitProducts[1]} rotateDuration={50} />
                                    </div>
                                    <div className="absolute bottom-10 -left-5">
                                        <HeroProductCard product={orbitProducts[2]} rotateDuration={50} />
                                    </div>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full blur-[2px] shadow-[0_0_20px_rgba(59,130,246,1)]" />
                                </motion.div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                                </div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="relative w-64 h-64 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-3xl" />
                                <div className="relative z-10 w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center backdrop-blur-sm">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-prime-red to-orange-500 opacity-80 blur-xl absolute" />
                                    <Play className="w-12 h-12 text-white/80 fill-white/80" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted Brands Marquee */}
            <div className="py-12 border-y border-gray-200 bg-gray-50 overflow-hidden">
                <div className="container mx-auto px-4">
                    <p className="text-center text-sm font-bold text-gray-500 mb-8 uppercase tracking-[0.2em]">
                        Official Brand Partners
                    </p>
                    <div className="relative flex overflow-hidden">
                        <div className="flex animate-marquee whitespace-nowrap gap-16 items-center">
                            {[...brands, ...brands, ...brands].map((brand, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 px-6 group min-w-[140px]"
                                >
                                    <img
                                        src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64`}
                                        alt={brand.name}
                                        className="w-8 h-8 object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <span className="text-base font-bold text-gray-400 group-hover:text-gray-900 transition-colors whitespace-nowrap">
                                        {brand.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
                        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10" />
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Why Choose Prime Audio?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Everything you need for your musical journey, backed by expert service
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: <Award className="w-12 h-12" />,
                                title: 'Authorized Dealer',
                                desc: 'Official Yamaha partner with warranty support'
                            },
                            {
                                icon: <Shield className="w-12 h-12" />,
                                title: 'Genuine Products',
                                desc: '100% authentic equipment, no counterfeits'
                            },
                            {
                                icon: <Truck className="w-12 h-12" />,
                                title: 'Free Delivery',
                                desc: 'Complimentary delivery within Nairobi'
                            },
                            {
                                icon: <Headphones className="w-12 h-12" />,
                                title: 'Expert Support',
                                desc: '24/7 assistance from professional musicians'
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:border-prime-red hover:shadow-xl transition-all"
                            >
                                <div className="text-prime-red mb-4 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials from API */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            What Musicians Say
                        </h2>
                        <p className="text-xl text-gray-600">
                            Trusted by professionals across East Africa
                        </p>
                    </motion.div>

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 text-prime-red animate-spin" />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {testimonials.slice(0, 3).map((testimonial, i) => (
                                <motion.div
                                    key={testimonial.id || i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15 }}
                                    className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all"
                                >
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-prime-red to-orange-500 flex items-center justify-center text-white font-bold">
                                            {testimonial.customer_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{testimonial.customer_name}</div>
                                            <div className="text-sm text-gray-600">
                                                {testimonial.is_verified ? '✓ Verified Buyer' : 'Customer'}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&h=1080&fit=crop')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-600/90 backdrop-blur-sm" />

                <div className="container relative z-10 mx-auto px-4 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl md:text-6xl font-bold mb-6">
                            Visit Our Showroom Today
                        </h2>
                        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
                            Experience our instruments in person. Let our expert team help you find your perfect sound.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/contact"
                                className="px-10 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:scale-105"
                            >
                                Get Directions
                            </Link>
                            <Link
                                to="/shop"
                                className="px-10 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2"
                            >
                                Browse Products <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
