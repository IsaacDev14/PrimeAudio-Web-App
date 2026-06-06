import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
    ArrowRight,
    Star,
    ChevronDown,
    Package,
    Warehouse,
    Truck,
    CheckCircle2,
    ShoppingCart,
} from 'lucide-react';
import SEO from '../components/SEO';

const IMAGES = {
    hero: '/showcase/hero.png',
    retail: '/showcase/portfolio-retail.png',
    delivery: '/showcase/portfolio-delivery.png',
    warehouse: '/showcase/portfolio-warehouse.png',
    packaging: '/showcase/portfolio-packaging.png',
    event: '/showcase/portfolio-event.png',
    lastmile: '/showcase/portfolio-lastmile.png',
    featured: '/showcase/featured-weekend.png',
};

const PORTFOLIO_ITEMS = [
    {
        title: 'Retail Display Setup',
        description:
            'Full in-store audio showcase for a flagship electronics retailer — speakers, amps, and demo stations ready for opening day.',
        category: 'Client Setup',
        image: IMAGES.retail,
        tall: true,
    },
    {
        title: 'Doorstep Delivery',
        description:
            'White-glove handoff of a premium DJ controller to a thrilled customer right at their front door.',
        category: 'Delivery',
        image: IMAGES.delivery,
        tall: false,
    },
    {
        title: 'Warehouse Operations',
        description:
            'Organized staging zone where every order is logged, sorted, and prepped for same-day dispatch.',
        category: 'Logistics',
        image: IMAGES.warehouse,
        tall: false,
    },
    {
        title: 'Branded Packaging',
        description:
            'Every item wrapped in protective materials and sealed in Prime Audio branded boxes before it leaves our facility.',
        category: 'Packaging',
        image: IMAGES.packaging,
        tall: true,
    },
    {
        title: 'Corporate Event Install',
        description:
            'Full PA system and lighting rig deployed for a 500-guest corporate launch — tested, tuned, and show-ready.',
        category: 'Client Setup',
        image: IMAGES.event,
        tall: false,
    },
    {
        title: 'Last-Mile Dispatch',
        description:
            'Rapid city delivery via our motorbike fleet — getting urgent orders to studios and venues across Nairobi.',
        category: 'Delivery',
        image: IMAGES.lastmile,
        tall: false,
    },
];

const PROCESS_STEPS = [
    { icon: ShoppingCart, title: 'You Order', description: 'We receive and confirm your request' },
    { icon: Warehouse, title: 'We Prepare', description: 'Items packed and quality-checked' },
    { icon: Truck, title: 'We Dispatch', description: 'Out for delivery on schedule' },
    { icon: CheckCircle2, title: 'You Receive', description: 'Delivered with care, every time' },
];

const TESTIMONIALS = [
    {
        name: 'James Ochieng',
        company: 'Soundwave Events Ltd',
        initials: 'JO',
        quote:
            'Prime Audio handled our entire festival gear delivery — 40+ items, zero damage, on time. They are now our go-to logistics partner for every major event.',
    },
    {
        name: 'Amina Hassan',
        company: 'BeatBox Studios Nairobi',
        initials: 'AH',
        quote:
            'From studio monitors to cables, every delivery arrives perfectly packed. Their team even helped us set up on-site. Unmatched service in this city.',
    },
    {
        name: 'David Njoroge',
        company: 'Harmony Retail Group',
        initials: 'DN',
        quote:
            'We trusted them with a 300-order weekend push and they delivered flawlessly. Our customers noticed — satisfaction scores hit an all-time high.',
    },
];

const CATEGORY_STYLES = {
    'Client Setup': 'bg-blue-500/90 text-white',
    Delivery: 'bg-[#FF5C00] text-white',
    Logistics: 'bg-violet-500/90 text-white',
    Packaging: 'bg-emerald-500/90 text-white',
};

const fadeUp = {
    hidden: { opacity: 0, y: 48 },
    visible: { opacity: 1, y: 0 },
};

function ShowcaseImage({ src, alt, className, wrapperClassName = 'relative w-full h-full overflow-hidden', priority = false }) {
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
            setLoaded(true);
        }
    }, [src]);

    return (
        <div className={wrapperClassName}>
            {!loaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#0F1D32] to-[#0A1628] animate-pulse" />
            )}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={priority ? 'high' : 'auto'}
                onLoad={() => setLoaded(true)}
                className={`${className} transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
}

function AnimatedCounter({ end, suffix = '+', duration = 2000 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [isInView, end, duration]);

    return (
        <span ref={ref}>
            {count}
            {suffix}
        </span>
    );
}

function StatItem({ value, suffix, label, showDivider }) {
    return (
        <div className="flex items-center flex-1">
            {showDivider && <div className="hidden lg:block w-px h-20 bg-white/10 mx-10" />}
            <div className="flex-1 text-center lg:text-left">
                <div
                    className="font-black text-white leading-none"
                    style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)' }}
                >
                    <AnimatedCounter end={value} suffix={suffix} />
                </div>
                <p className="mt-3 text-white/50 text-sm font-medium tracking-wide uppercase">
                    {label}
                </p>
            </div>
        </div>
    );
}

function PortfolioCard({ item, index }) {
    return (
        <motion.article
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: index * 0.07 }}
            className={`group relative overflow-hidden rounded-3xl bg-[#0F1D32] ${
                item.tall ? 'lg:row-span-2' : ''
            }`}
        >
            <div
                className={`relative overflow-hidden ${
                    item.tall ? 'h-80 lg:h-[calc(100%-5.5rem)] lg:min-h-[480px]' : 'h-64'
                }`}
            >
                <ShowcaseImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/30 to-transparent" />
                <span
                    className={`absolute top-5 left-5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg ${
                        CATEGORY_STYLES[item.category]
                    }`}
                >
                    {item.category}
                </span>
                <div className="absolute inset-0 bg-[#FF5C00]/0 group-hover:bg-[#FF5C00]/10 transition-colors duration-500" />
            </div>
            <div className="p-6 lg:p-7">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FF5C00] transition-colors">
                    {item.title}
                </h3>
                <p className="text-white/55 text-sm leading-relaxed">{item.description}</p>
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

            {/* Hero */}
            <section className="relative -mt-20 min-h-screen flex items-end lg:items-center pt-20">
                <ShowcaseImage
                    src={IMAGES.hero}
                    alt="Delivery team loading packages into van at golden hour"
                    priority
                    wrapperClassName="absolute inset-0 overflow-hidden"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/95 via-[#0A1628]/70 to-[#0A1628]/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-[#0A1628]/50" />
                <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#FF5C00]/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 container mx-auto px-4 pb-20 lg:pb-0 py-16 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="inline-flex items-center gap-2 bg-[#FF5C00]/15 border border-[#FF5C00]/30 rounded-full px-4 py-1.5 mb-8">
                                <Package className="w-4 h-4 text-[#FF5C00]" />
                                <span className="text-[#FF5C00] text-xs font-bold uppercase tracking-[0.2em]">
                                    Prime Audio Solutions
                                </span>
                            </div>
                            <h1
                                className="font-black leading-[1.02] mb-6"
                                style={{ fontSize: 'clamp(3rem, 7.5vw, 5.75rem)' }}
                            >
                                We Deliver.
                                <br />
                                <span className="text-[#FF5C00]">You Shine.</span>
                            </h1>
                            <p
                                className="text-white/65 max-w-lg mb-10 leading-relaxed"
                                style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
                            >
                                From first order to final handoff — we handle it all.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={scrollToWork}
                                    className="group px-8 py-4 bg-[#FF5C00] hover:bg-[#e65200] text-white rounded-full font-bold text-base transition-all shadow-[0_0_40px_rgba(255,92,0,0.35)] hover:shadow-[0_0_60px_rgba(255,92,0,0.55)] flex items-center justify-center gap-2"
                                >
                                    See Our Work
                                    <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                                </button>
                                <Link
                                    to="/contact"
                                    className="px-8 py-4 bg-white/8 hover:bg-white/15 text-white border border-white/20 hover:border-white/35 rounded-full font-bold text-base transition-all backdrop-blur-md flex items-center justify-center gap-2"
                                >
                                    Get a Quote
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="hidden lg:grid grid-cols-2 gap-4"
                        >
                            {PORTFOLIO_ITEMS.slice(0, 4).map((item, i) => (
                                <div
                                    key={item.title}
                                    className={`relative rounded-2xl overflow-hidden border border-white/10 ${
                                        i === 0 ? 'col-span-2 h-48' : 'h-36'
                                    }`}
                                >
                                    <ShowcaseImage
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-[#0A1628]/30" />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="relative py-20 bg-[#060E1A] border-y border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,92,0,0.06)_0%,transparent_70%)]" />
                <div className="container mx-auto px-4 relative">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0">
                        <StatItem value={500} suffix="+" label="Deliveries Completed" />
                        <StatItem value={120} suffix="+" label="Happy Clients" showDivider />
                        <StatItem value={15} suffix="" label="Cities Covered" showDivider />
                        <StatItem value={98} suffix="%" label="Satisfaction Rate" showDivider />
                    </div>
                </div>
            </section>

            {/* Portfolio */}
            <section id="our-work" className="py-28 md:py-36">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16"
                    >
                        <div>
                            <p className="text-[#FF5C00] font-bold uppercase tracking-[0.25em] text-xs mb-4">
                                Portfolio
                            </p>
                            <h2
                                className="font-black leading-tight"
                                style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}
                            >
                                Our Work in Action
                            </h2>
                        </div>
                        <p className="text-white/50 max-w-md text-base lg:text-right leading-relaxed">
                            Real projects. Real deliveries. Real results for clients who trust us with their most
                            important orders.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
                        {PORTFOLIO_ITEMS.map((item, i) => (
                            <PortfolioCard key={item.title} item={item} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Project */}
            <section className="py-28 md:py-36 bg-[#060E1A]">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            transition={{ duration: 0.7 }}
                            className="relative"
                        >
                            <div className="absolute -inset-4 bg-[#FF5C00]/10 rounded-3xl blur-2xl" />
                            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[540px] border border-white/10">
                                <ShowcaseImage
                                    src={IMAGES.featured}
                                    alt="Weekend bulk order fulfillment operation"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#0A1628]/50 to-transparent" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            transition={{ duration: 0.7, delay: 0.12 }}
                        >
                            <p className="text-[#FF5C00] font-bold uppercase tracking-[0.25em] text-xs mb-5">
                                Featured Project
                            </p>
                            <h2
                                className="font-black leading-tight mb-7"
                                style={{ fontSize: 'clamp(1.85rem, 4vw, 2.85rem)' }}
                            >
                                How We Delivered 300 Orders in One Weekend
                            </h2>
                            <p className="text-white/60 leading-relaxed mb-10 text-lg">
                                Harmony Retail Group launched a flash sale on premium audio gear — and 300 orders hit
                                their system in 48 hours. We mobilized our full warehouse team, extended dispatch
                                hours, and coordinated 12 delivery routes across Nairobi. Every item was
                                quality-checked, branded-packed, and delivered before Monday morning.
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-10">
                                {[
                                    { stat: '300', label: 'Orders Fulfilled' },
                                    { stat: '0', label: 'Returns' },
                                    { stat: '2-Day', label: 'Turnaround' },
                                ].map((s) => (
                                    <div
                                        key={s.label}
                                        className="bg-[#0A1628] rounded-2xl p-5 text-center border border-white/8"
                                    >
                                        <div className="text-2xl lg:text-3xl font-black text-[#FF5C00]">
                                            {s.stat}
                                        </div>
                                        <div className="text-[11px] text-white/45 mt-1.5 font-semibold uppercase tracking-wide">
                                            {s.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <blockquote className="relative pl-6 border-l-2 border-[#FF5C00]">
                                <p className="text-white/75 italic leading-relaxed mb-4 text-base">
                                    &ldquo;Prime Audio turned what could have been a logistics nightmare into our
                                    smoothest product launch ever. 300 orders, zero issues — our customers were blown
                                    away.&rdquo;
                                </p>
                                <footer>
                                    <span className="font-bold text-white">David Njoroge</span>
                                    <span className="text-white/45 text-sm">
                                        {' '}
                                        — Operations Director, Harmony Retail Group
                                    </span>
                                </footer>
                            </blockquote>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Process */}
            <section className="py-28 md:py-36">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="text-center mb-20"
                    >
                        <p className="text-[#FF5C00] font-bold uppercase tracking-[0.25em] text-xs mb-4">
                            How We Work
                        </p>
                        <h2
                            className="font-black"
                            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}
                        >
                            Four Steps to Flawless Delivery
                        </h2>
                    </motion.div>

                    <div className="relative max-w-5xl mx-auto">
                        <div className="hidden lg:block absolute top-[3.25rem] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#FF5C00]/50 to-transparent" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                            {PROCESS_STEPS.map((step, i) => {
                                const Icon = step.icon;
                                return (
                                    <motion.div
                                        key={step.title}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        variants={fadeUp}
                                        transition={{ delay: i * 0.1 }}
                                        className="relative text-center"
                                    >
                                        <div className="relative inline-block mb-7">
                                            <div className="w-[4.5rem] h-[4.5rem] rounded-2xl bg-[#0F1D32] border border-[#FF5C00]/25 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(255,92,0,0.08)]">
                                                <Icon className="w-7 h-7 text-[#FF5C00]" strokeWidth={1.5} />
                                            </div>
                                            <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#FF5C00] text-white text-xs font-black flex items-center justify-center shadow-lg">
                                                {i + 1}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                                        <p className="text-white/50 text-sm leading-relaxed max-w-[180px] mx-auto">
                                            {step.description}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-28 md:py-36 bg-[#060E1A]">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="text-center mb-16"
                    >
                        <p className="text-[#FF5C00] font-bold uppercase tracking-[0.25em] text-xs mb-4">
                            Testimonials
                        </p>
                        <h2
                            className="font-black"
                            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}
                        >
                            Clients Who Trust Us
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-7">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div
                                key={t.name}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#0A1628] rounded-3xl p-8 border border-white/6 hover:border-[#FF5C00]/25 transition-all duration-500 hover:-translate-y-1"
                            >
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, j) => (
                                        <Star
                                            key={j}
                                            className="w-4 h-4 fill-[#FF5C00] text-[#FF5C00]"
                                        />
                                    ))}
                                </div>
                                <p className="text-white/65 leading-relaxed mb-8 text-[15px]">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <div className="flex items-center gap-4 pt-6 border-t border-white/6">
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FF5C00] to-[#e65200] flex items-center justify-center text-white font-bold text-sm">
                                        {t.initials}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{t.name}</div>
                                        <div className="text-xs text-white/40">{t.company}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative py-28 md:py-36 overflow-hidden">
                <div className="absolute inset-0 bg-[#FF5C00]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12)_0%,transparent_60%)]" />
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="max-w-3xl mx-auto"
                    >
                        <h2
                            className="font-black text-white mb-5"
                            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.25rem)' }}
                        >
                            Ready to Work With Us?
                        </h2>
                        <p
                            className="text-white/90 mb-10"
                            style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)' }}
                        >
                            Let&apos;s handle your next delivery like it&apos;s our own.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-[#0A1628] hover:bg-[#0F1D32] text-white rounded-full font-bold text-lg transition-all shadow-[0_12px_40px_rgba(10,22,40,0.45)] hover:scale-105"
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
