import { motion } from 'framer-motion';
import { Award, Users, Music, History } from 'lucide-react';
import { AppIcon } from '../components/ui/app-icon';

const About = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative py-20 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-white mb-6"
                    >
                        Our Story
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-300 max-w-2xl mx-auto"
                    >
                        East Africa's premier destination for professional audio equipment, empowering musicians since 2010.
                    </motion.p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="py-16 container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Empowering Sound Creators</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            At Prime Audio, we believe that every artist deserves the best tools to express their creativity.
                            What started as a small shop in Nairobi has grown into the region's most trusted supplier of
                            professional musical instruments and audio gear.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Our mission is simple: to provide authentic, high-quality equipment backed by expert knowledge
                            and exceptional support. Whether you're a beginner strumming your first chord or a professional
                            producer equipping a studio, we are here to support your journey.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <img src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&fit=crop" alt="Studio" className="rounded-2xl shadow-lg" />
                        <img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&fit=crop" alt="Music Store" className="rounded-2xl shadow-lg mt-8" />
                    </div>
                </div>
            </div>

            {/* Stats / Values */}
            <div className="bg-slate-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { icon: History, value: "14+", label: "Years Experience" },
                            { icon: Users, value: "5000+", label: "Happy Musicians" },
                            { icon: Award, value: "100%", label: "Authentic Gear" },
                            { icon: Music, value: "50+", label: "Global Brands" }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
                                <AppIcon icon={stat.icon} size="xl" className="mx-auto mb-4" />
                                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-500 uppercase tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
