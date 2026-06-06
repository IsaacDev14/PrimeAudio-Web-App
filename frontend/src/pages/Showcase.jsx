import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Star, ChevronDown } from 'lucide-react';
import SEO from '../components/SEO';

const NAVY = '#0A1628';

const pollinationsUrl = (prompt) =>
    `https://image.pollinations.ai/prompt/${encodeURIComponent(
        `${prompt}, realistic photo, cinematic lighting, professional photography`
    )}`;

const HERO_IMAGE =
    'https://image.pollinations.ai/prompt/professional%20delivery%20team%20loading%20packages%20into%20van%20golden%20hour%20cinematic%20lighting%20realistic%20photo';

const PORTFOLIO_ITEMS = [
    {
        title: 'Retail Display Setup',
        description: 'Full in-store audio showcase for a flagship electronics retailer — speakers, amps, and demo stations ready for opening day.',
        category: 'Client Setup',
        prompt: 'team setting up product display for client at retail store professional photo',
        tall: true,
    },
    {
        title: 'Doorstep Delivery',
        description: 'White-glove handoff of a premium DJ controller to a thrilled customer right at their front door.',
        category: 'Delivery',
        prompt: 'delivery driver handing package to smiling customer doorstep realistic',
        tall: false,
    },
    {
        title: 'Warehouse Operations',
        description: 'Organized staging zone where every order is logged, sorted, and prepped for same-day dispatch.',
        category: 'Logistics',
        prompt: 'warehouse workers organizing packages logistics professional photography',
        tall: false,
    },
    {
        title: 'Branded Packaging',
        description: 'Every item wrapped in protective materials and sealed in Prime Audio branded boxes before it leaves our facility.',
        category: 'Packaging',
        prompt: 'products being carefully packed in branded boxes close up photo',
        tall: true,
    },
    {
        title: 'Corporate Event Install',
        description: 'Full PA system and lighting rig deployed for a 500-guest corporate launch — tested, tuned, and show-ready.',
        category: 'Client Setup',
        prompt: 'corporate event setup team arranging items for client professional',
        tall: false,
    },
    {
        title: 'Last-Mile Dispatch',
        description: 'Rapid city delivery via our motorbike fleet — getting urgent orders to studios and venues across Nairobi.',
        category: 'Delivery',
        prompt: 'last mile delivery motorbike rider city street cinematic photo',
        tall: false,
    },
];

const PROCESS_STEPS = [
    {
        emoji: '📦',
        title: 'You Order',
        description: 'We receive and confirm your request',
    },
    {
        emoji: '🏭',
        title: 'We Prepare',
        description: 'Items packed and quality-checked',
    },
    {
        emoji: '🚚',
        title: 'We Dispatch',
        description: 'Out for delivery on schedule',
    },
    {
        emoji: '✅',
        title: 'You Receive',
        description: 'Delivered with care, every time',
    },
];

const TESTIMONIALS = [
    {
        name: 'James Ochieng',
        company: 'Soundwave Events Ltd',
        initials: 'JO',
        quote: 'Prime Audio handled our entire festival gear delivery — 40+ items, zero damage, on time. They are now our go-to logistics partner for every major event.',
    },
    {
        name: 'Amina Hassan',
        company: 'BeatBox Studios Nairobi',
        initials: 'AH',
        quote: 'From studio monitors to cables, every delivery arrives perfectly packed. Their team even helped us set up on-site. Unmatched service in this city.',
    },
    {
        name: 'David Njoroge',
        company: 'Harmony Retail Group',
        initials: 'DN',
        quote: 'We trusted them with a 300-order weekend push and they delivered flawlessly. Our customers noticed — satisfaction scores hit an all-time high.',
    },
];

const CATEGORY_COLORS = {
    'Client Setup': 'bg-blue-500/20 text-blue-300',
    Delivery: 'bg-[#FF5C00]/20 text-[#FF5C00]',
    Logistics: 'bg-purple-500/20 text-purple-300',
    Packaging: 'bg-emerald-500/20 text-emerald-300',
};

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
};

function LazyImage({ src, alt, className }) {
    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={className}
        />
    );
}

function AnimatedCounter({ end, suffix = '+', duration = 2000, isPercent = false }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;

        const target = end;
        const start = performance.now();

        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = isPercent
                ? Math.round(eased * target)
                : Math.floor(eased * target);
            setCount(current);
            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }, [isInView, end, duration, isPercent]);

    return (
        <span ref={ref}>
            {count}
            {suffix}
        </span>
    );
}

function StatItem({ value, suffix, label, isPercent = false, showDivider }) {
    return (
        <div className="flex items-center flex-1 min-w-[140px]">
            {showDivider && (
                <div className="hidden md:block w-px h-16 bg-white/10 mr-8 lg:mr-12" />
            )}
            <div className="text-center md:text-left flex-1 px-4 md:px-0">
                <div className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    <AnimatedCounter end={value} suffix={suffix} isPercent={isPercent} />
                </div>
                <p className="mt-2 text-sm md:text-base text-white/60 font-medium">{label}</p>
            </div>
        </div>
    );
}

function PortfolioCard({ item, index }) {
    return (
        <motion.article
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className={`group relative overflow-hidden rounded-2xl bg-[#0F1D32] border border-white/5 hover:border-[#FF5C00]/40 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(255,92,0,0.15)] ${
                item.tall ? 'md:row-span-2' : ''
            }`}
        >
            <div className={`relative overflow-hidden ${item.tall ? 'h-72 md:h-full md:min-h-[420px]' : 'h-56'}`}>
                <LazyImage
                    src={pollinationsUrl(item.prompt)}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/20 to-transparent" />
                <span
                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        CATEGORY_COLORS[item.category]
                    }`}
                >
                    {item.category}
                </span>
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FF5C00] transition-colors">
                    {item.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
            </div>
        </motion.article>
    );
}

const Showcase = () => {
    const scrollToWork = () => {
        document.getElementById('our-work')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-[#0A1628] text-white overflow-x-hidden">
            <SEO
                title="Our Work"
                description="See how Prime Audio delivers — client setups, logistics, packaging, and happy customers across East Africa."
                keywords="prime audio portfolio, delivery logistics, client setups, professional audio delivery, nairobi"
            />

            {/* ── 1. Hero ── */}
            <section className="relative -mt-20 min-h-screen flex items-center justify-center pt-20">
                <img
                    src={HERO_IMAGE}
                    alt="Delivery team loading packages into van at golden hour"
                    fetchPriority="high"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#0A1628]/75" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-[#0A1628]/40" />

                <div className="relative z-10 container mx-auto px-4 py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className="max-w-4xl mx-auto"
                    >
                        <p className="text-[#FF5C00] font-bold uppercase tracking-[0.25em] text-sm mb-6">
                            Prime Audio Solutions
                        </p>
                        <h1
                            className="font-black text-white leading-[1.05] mb-6"
                            style={{ fontSize: 'clamp(2.75rem, 7vw, 5.5rem)' }}
                        >
                            We Deliver.
                            <br />
                            <span className="text-[#FF5C00]">You Shine.</span>
                        </h1>
                        <p
                            className="text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
                            style={{ fontSize: 'clamp(1.05rem, 2vw, 1.35rem)' }}
                        >
                            From first order to final handoff — we handle it all.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={scrollToWork}
                                className="group px-8 py-4 bg-[#FF5C00] hover:bg-[#e65200] text-white rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(255,92,0,0.4)] hover:shadow-[0_0_50px_rgba(255,92,0,0.6)] flex items-center justify-center gap-2"
                            >
                                See Our Work
                                <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                            </button>
                            <Link
                                to="/contact"
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 rounded-full font-bold text-lg transition-all backdrop-blur-sm flex items-center justify-center gap-2"
                            >
                                Get a Quote
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── 2. Stats Bar ── */}
            <section className="py-16 md:py-20 border-y border-white/5" style={{ backgroundColor: NAVY }}>
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-stretch justify-between gap-10 md:gap-0">
                        <StatItem value={500} suffix="+" label="Deliveries Completed" />
                        <StatItem value={120} suffix="+" label="Happy Clients" showDivider />
                        <StatItem value={15} suffix="" label="Cities Covered" showDivider />
                        <StatItem value={98} suffix="%" label="Satisfaction Rate" isPercent showDivider />
                    </div>
                </div>
            </section>

            {/* ── 3. Portfolio Grid ── */}
            <section id="our-work" className="py-24 md:py-32">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <p className="text-[#FF5C00] font-bold uppercase tracking-[0.2em] text-sm mb-4">
                            Portfolio
                        </p>
                        <h2
                            className="font-black text-white mb-5"
                            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
                        >
                            Our Work in Action
                        </h2>
                        <p className="text-white/60 max-w-2xl mx-auto text-lg">
                            Real projects. Real deliveries. Real results for clients who trust us with their most important orders.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                        {PORTFOLIO_ITEMS.map((item, i) => (
                            <PortfolioCard key={item.title} item={item} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 4. Featured Project ── */}
            <section className="py-24 md:py-32 bg-[#0F1D32]">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            transition={{ duration: 0.7 }}
                            className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[520px]"
                        >
                            <LazyImage
                                src={pollinationsUrl(
                                    'busy warehouse team processing hundreds of audio equipment orders weekend rush professional photography'
                                )}
                                alt="Weekend bulk order fulfillment operation"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/40 to-transparent" />
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            transition={{ duration: 0.7, delay: 0.15 }}
                        >
                            <p className="text-[#FF5C00] font-bold uppercase tracking-[0.2em] text-sm mb-4">
                                Featured Project
                            </p>
                            <h2
                                className="font-black text-white mb-6 leading-tight"
                                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
                            >
                                How We Delivered 300 Orders in One Weekend
                            </h2>
                            <p className="text-white/65 leading-relaxed mb-8 text-lg">
                                Harmony Retail Group launched a flash sale on premium audio gear — and 300 orders
                                hit their system in 48 hours. We mobilized our full warehouse team, extended dispatch
                                hours, and coordinated 12 delivery routes across Nairobi. Every item was
                                quality-checked, branded-packed, and delivered before Monday morning. Zero returns.
                                Zero complaints.
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-10">
                                {[
                                    { stat: '300', label: 'Orders Fulfilled' },
                                    { stat: '0', label: 'Returns' },
                                    { stat: '2-Day', label: 'Turnaround' },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="bg-[#0A1628] rounded-xl p-4 text-center border border-white/5"
                                    >
                                        <div className="text-2xl md:text-3xl font-black text-[#FF5C00]">
                                            {item.stat}
                                        </div>
                                        <div className="text-xs text-white/50 mt-1 font-medium">{item.label}</div>
                                    </div>
                                ))}
                            </div>

                            <blockquote className="border-l-4 border-[#FF5C00] pl-6">
                                <p className="text-white/80 italic leading-relaxed mb-4">
                                    "Prime Audio turned what could have been a logistics nightmare into our smoothest
                                    product launch ever. 300 orders, zero issues — our customers were blown away."
                                </p>
                                <footer className="text-sm">
                                    <span className="font-bold text-white">David Njoroge</span>
                                    <span className="text-white/50"> — Operations Director, Harmony Retail Group</span>
                                </footer>
                            </blockquote>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── 5. Process ── */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <p className="text-[#FF5C00] font-bold uppercase tracking-[0.2em] text-sm mb-4">
                            How We Work
                        </p>
                        <h2
                            className="font-black text-white"
                            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
                        >
                            Four Steps to Flawless Delivery
                        </h2>
                    </motion.div>

                    <div className="relative">
                        <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-transparent via-[#FF5C00]/40 to-transparent" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                            {PROCESS_STEPS.map((step, i) => (
                                <motion.div
                                    key={step.title}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeUp}
                                    transition={{ duration: 0.5, delay: i * 0.12 }}
                                    className="relative text-center"
                                >
                                    <div className="relative inline-flex flex-col items-center">
                                        <div className="w-24 h-24 rounded-full bg-[#0F1D32] border-2 border-[#FF5C00]/30 flex items-center justify-center text-4xl mb-6 relative z-10 shadow-[0_0_30px_rgba(255,92,0,0.1)]">
                                            {step.emoji}
                                        </div>
                                        <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#FF5C00] text-white text-xs font-black flex items-center justify-center z-20">
                                            {i + 1}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-white/55 text-sm leading-relaxed max-w-[200px] mx-auto">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 6. Testimonials ── */}
            <section className="py-24 md:py-32 bg-[#0F1D32]">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <p className="text-[#FF5C00] font-bold uppercase tracking-[0.2em] text-sm mb-4">
                            Testimonials
                        </p>
                        <h2
                            className="font-black text-white"
                            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
                        >
                            Clients Who Trust Us
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div
                                key={t.name}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="bg-[#0A1628] rounded-2xl p-8 border border-white/5 hover:border-[#FF5C00]/30 transition-all duration-400 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]"
                            >
                                <div className="flex gap-1 mb-5">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-[#FF5C00] text-[#FF5C00]" />
                                    ))}
                                </div>
                                <p className="text-white/70 leading-relaxed mb-8 text-sm">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#FF5C00] flex items-center justify-center text-white font-bold text-sm">
                                        {t.initials}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{t.name}</div>
                                        <div className="text-sm text-white/45">{t.company}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 7. CTA Banner ── */}
            <section className="py-24 md:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#FF5C00]" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        transition={{ duration: 0.7 }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2
                            className="font-black text-white mb-5"
                            style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}
                        >
                            Ready to Work With Us?
                        </h2>
                        <p
                            className="text-white/85 mb-10 leading-relaxed"
                            style={{ fontSize: 'clamp(1.05rem, 2vw, 1.3rem)' }}
                        >
                            Let&apos;s handle your next delivery like it&apos;s our own.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-[#0A1628] hover:bg-[#0F1D32] text-white rounded-full font-bold text-lg transition-all shadow-[0_8px_30px_rgba(10,22,40,0.4)] hover:shadow-[0_12px_40px_rgba(10,22,40,0.6)] hover:scale-105"
                        >
                            Contact Us Today
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Showcase;
