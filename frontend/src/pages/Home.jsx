import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Music, Speaker, Radio } from 'lucide-react';

const Home = () => {
    return (
        <div className="pt-0">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-surface/80 to-dark-bg z-10"></div>
                    {/* Abstract Background - user requested images, using generic music bg for now or gradient */}
                    <img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop"
                        alt="Music Studio"
                        className="w-full h-full object-cover" />
                </div>

                <div className="container mx-auto px-4 z-20 relative text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Play It <span className="text-prime-red">Loud</span>, <br />
                            Play It <span className="text-prime-blue">Proud</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                            Your premier destination for professional musical instruments and audio equipment in Nairobi. Experience quality like never before.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/shop" className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-3">
                                Shop Now <ArrowRight size={20} />
                            </Link>
                            <Link to="/contact" className="px-8 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-lg font-medium">
                                Visit Showroom
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="py-20 bg-dark-bg">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">Explore Categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Instruments", icon: <Music size={40} />, desc: "Guitars, Keyboards, Drums & more", img: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=2052&auto=format&fit=crop" },
                            { title: "Live Sound", icon: <Speaker size={40} />, desc: "Speakers, Mixers, PA Systems", img: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=2070&auto=format&fit=crop" },
                            { title: "Studio Gear", icon: <Radio size={40} />, desc: "Microphones, Interfaces, Monitors", img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" }
                        ].map((cat, i) => (
                            <motion.div
                                key={i}
                                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <img src={cat.img} alt={cat.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 flex flex-col justify-end">
                                    <div className="text-prime-blue mb-2">{cat.icon}</div>
                                    <h3 className="text-2xl font-bold mb-1">{cat.title}</h3>
                                    <p className="text-gray-400">{cat.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Teaser */}
            <section className="py-20 bg-dark-surface">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-8">Professional Services</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-12">
                        We don't just sell instruments; we provide complete audio solutions including installation, repair, and event hiring.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {["Installation", "Maintenance", "Hiring", "Consultancy"].map((service, i) => (
                            <div key={i} className="bg-dark-card p-6 rounded-xl border border-white/5 hover:border-prime-red/50 transition-colors">
                                <h3 className="text-xl font-bold text-white">{service}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
