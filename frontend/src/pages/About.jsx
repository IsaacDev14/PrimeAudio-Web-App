import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Award,
    Building2,
    CheckCircle2,
    Globe2,
    Headphones,
    ShieldCheck,
    Truck,
    Users,
    Wrench,
} from 'lucide-react';
import SEO from '../components/SEO';

const STATS = [
    { value: '15+', label: 'Years in operation' },
    { value: '5,000+', label: 'Artists & venues served' },
    { value: '50+', label: 'Authorised brand partners' },
    { value: '98%', label: 'On-time delivery rate' },
];

const PILLARS = [
    {
        icon: ShieldCheck,
        title: 'Authorised distribution',
        description: 'Official channels for leading global audio brands with full manufacturer warranty coverage.',
    },
    {
        icon: Wrench,
        title: 'Technical expertise',
        description: 'In-house specialists for studio design, live sound, and instrument setup across East Africa.',
    },
    {
        icon: Truck,
        title: 'Regional logistics',
        description: 'Same-day dispatch in Nairobi and structured delivery to studios, retailers, and event sites.',
    },
    {
        icon: Headphones,
        title: 'After-sales support',
        description: 'Dedicated service desk for repairs, returns, and ongoing equipment guidance.',
    },
];

const MILESTONES = [
    { year: '2010', title: 'Founded in Nairobi CBD', detail: 'Opened our first showroom on Luthuli Avenue serving local musicians.' },
    { year: '2014', title: 'Expanded product catalogue', detail: 'Added pro audio, DJ, and studio lines from international manufacturers.' },
    { year: '2018', title: 'Corporate & events division', detail: 'Began supplying PA systems and backline for festivals and corporate launches.' },
    { year: '2022', title: 'Digital commerce launch', detail: 'Rolled out nationwide ordering with tracked fulfilment and showroom pickup.' },
    { year: '2025', title: 'Regional growth', detail: 'Serving clients across Kenya with dedicated B2B accounts and install projects.' },
];

const CAPABILITIES = [
    'Studio & broadcast equipment sourcing',
    'Live event PA and backline rental support',
    'Retail display and in-store demo setups',
    'Bulk procurement for schools and institutions',
    'Warranty registration and repair coordination',
    'Custom quotes for corporate accounts',
];

const BRANDS = ['Yamaha', 'Shure', 'Pioneer', 'Roland', 'Focusrite', 'JBL', 'Fender', 'Audio-Technica'];

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
};

const About = () => {
    return (
        <div className="bg-white min-h-screen">
            <SEO
                title="About Prime Audio"
                description="Prime Audio Solutions — East Africa's trusted partner for professional musical instruments, pro audio, and technical support since 2010."
                keywords="about prime audio, pro audio kenya, music equipment nairobi, audio distributor east africa"
            />

            {/* Hero */}
            <section className="relative border-b border-slate-200 bg-[#0A1628]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.12),_transparent_55%)]" />
                <div className="container mx-auto px-4 lg:px-6 py-12 md:py-14 relative">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        transition={{ duration: 0.4 }}
                        className="max-w-3xl"
                    >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400 mb-3">
                            Company Overview
                        </p>
                        <h1 className="text-2xl md:text-[1.75rem] font-semibold text-white leading-snug mb-3">
                            Professional audio solutions built for East Africa
                        </h1>
                        <p className="text-sm md:text-[15px] text-slate-400 leading-relaxed max-w-2xl">
                            Prime Audio Solutions Ltd. supplies musicians, studios, venues, and retailers with
                            authenticated gear, technical guidance, and reliable fulfilment — from our Nairobi
                            headquarters since 2010.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-6">
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Browse catalogue
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-600 hover:border-slate-500 text-slate-200 rounded-lg transition-colors"
                            >
                                Contact our team
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats bar */}
            <section className="border-b border-slate-200 bg-slate-50">
                <div className="container mx-auto px-4 lg:px-6 py-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="text-center lg:text-left">
                                <p className="text-xl md:text-2xl font-semibold text-slate-900">{stat.value}</p>
                                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & vision */}
            <section className="py-12 md:py-14">
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 mb-2">
                                Who we are
                            </p>
                            <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
                                Empowering sound creators across the region
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                What began as a specialist instrument shop in Nairobi has evolved into a full-service
                                audio partner trusted by artists, production houses, houses of worship, and retail chains.
                            </p>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                We combine curated inventory with hands-on expertise — helping clients select, deploy,
                                and maintain equipment that meets professional standards.
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                <Building2 className="w-5 h-5 text-blue-600 mb-3" />
                                <h3 className="text-sm font-semibold text-slate-900 mb-2">Our mission</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Deliver authentic pro-audio and musical instruments with expert advice and
                                    dependable after-sales care at every stage.
                                </p>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:mt-6">
                                <Globe2 className="w-5 h-5 text-blue-600 mb-3" />
                                <h3 className="text-sm font-semibold text-slate-900 mb-2">Our vision</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    To be East Africa's most trusted name in professional audio — known for quality,
                                    integrity, and long-term client partnerships.
                                </p>
                            </div>
                            <div className="sm:col-span-2 relative rounded-xl overflow-hidden border border-slate-200 aspect-[16/7]">
                                <img
                                    src="/showcase/portfolio-retail.png"
                                    alt="Prime Audio retail setup"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pillars */}
            <section className="py-12 md:py-14 bg-slate-50 border-y border-slate-200">
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="text-center max-w-xl mx-auto mb-10">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 mb-2">
                            Why Prime Audio
                        </p>
                        <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                            Built on four operational pillars
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {PILLARS.map((pillar, idx) => (
                            <motion.div
                                key={pillar.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-40px' }}
                                variants={fadeUp}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all"
                            >
                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                                    <pillar.icon className="w-4 h-4 text-blue-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{pillar.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline + capabilities */}
            <section className="py-12 md:py-14">
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
                        <div className="lg:col-span-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 mb-2">
                                Our journey
                            </p>
                            <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-8">
                                Milestones that shaped our growth
                            </h2>
                            <div className="space-y-0">
                                {MILESTONES.map((item, idx) => (
                                    <div key={item.year} className="flex gap-5 pb-8 last:pb-0 relative">
                                        {idx < MILESTONES.length - 1 && (
                                            <div className="absolute left-[2.125rem] top-8 bottom-0 w-px bg-slate-200" />
                                        )}
                                        <div className="shrink-0 w-[4.25rem] text-right">
                                            <span className="text-xs font-semibold text-blue-600">{item.year}</span>
                                        </div>
                                        <div className="relative shrink-0 mt-1">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-50" />
                                        </div>
                                        <div className="pb-1">
                                            <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="bg-[#0A1628] rounded-xl p-6 text-white h-full">
                                <Award className="w-5 h-5 text-blue-400 mb-3" />
                                <h3 className="text-sm font-semibold mb-4">Core capabilities</h3>
                                <ul className="space-y-3">
                                    {CAPABILITIES.map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-xs text-slate-300">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/showcase"
                                    className="inline-flex items-center gap-1.5 mt-6 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    View our work
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brand partners */}
            <section className="py-10 border-t border-slate-200 bg-slate-50">
                <div className="container mx-auto px-4 lg:px-6">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-center mb-6">
                        Authorised partners include
                    </p>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                        {BRANDS.map((brand) => (
                            <span
                                key={brand}
                                className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {brand}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 md:py-14">
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-1">
                                    Ready to equip your next project?
                                </h2>
                                <p className="text-sm text-slate-600 max-w-md">
                                    Speak with our sales team for quotes, bulk orders, or technical recommendations.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 shrink-0">
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Get in touch
                            </Link>
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
                            >
                                Shop now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
