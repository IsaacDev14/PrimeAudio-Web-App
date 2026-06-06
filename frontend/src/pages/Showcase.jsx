import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    Star,
    ChevronDown,
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
            'Full in-store audio showcase for a flagship retailer on Luthuli Avenue — speakers, amps, and demo stations ready for opening day.',
        category: 'Client Setup',
        image: IMAGES.retail,
        tall: true,
    },
    {
        title: 'Doorstep Delivery',
        description:
            'Careful handoff of a premium DJ controller to a happy customer at their doorstep in Westlands, Nairobi.',
        category: 'Delivery',
        image: IMAGES.delivery,
        tall: false,
    },
    {
        title: 'Warehouse Operations',
        description:
            'Our Nairobi CBD warehouse — every order logged, sorted, and prepped for same-day dispatch across the city.',
        category: 'Logistics',
        image: IMAGES.warehouse,
        tall: false,
    },
    {
        title: 'Branded Packaging',
        description:
            'Every item wrapped in protective materials and sealed in Prime Audio boxes before it leaves our Nairobi facility.',
        category: 'Packaging',
        image: IMAGES.packaging,
        tall: true,
    },
    {
        title: 'Corporate Event Install',
        description:
            'Full PA system deployed for a 500-guest corporate launch at a Nairobi hotel — tested, tuned, and show-ready.',
        category: 'Client Setup',
        image: IMAGES.event,
        tall: false,
    },
    {
        title: 'Last-Mile Dispatch',
        description:
            'Motorbike delivery fleet navigating Nairobi traffic — urgent orders to studios and venues across the city.',
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
        company: 'Soundwave Events Ltd, Nairobi',
        initials: 'JO',
        quote:
            'Prime Audio handled our entire festival gear delivery — 40+ items, zero damage, on time. They are now our go-to partner for every major event in Kenya.',
    },
    {
        name: 'Amina Hassan',
        company: 'BeatBox Studios, Westlands',
        initials: 'AH',
        quote:
            'From studio monitors to cables, every delivery arrives perfectly packed. Their team even helped us set up on-site. Unmatched service in Nairobi.',
    },
    {
        name: 'David Njoroge',
        company: 'Harmony Retail Group',
        initials: 'DN',
        quote:
            'We trusted them with a 300-order weekend push and they delivered flawlessly. Our customers across Nairobi noticed — satisfaction hit an all-time high.',
    },
];

const CATEGORY_STYLES = {
    'Client Setup': 'bg-blue-600 text-white',
    Delivery: 'bg-[#FF5C00] text-white',
    Logistics: 'bg-violet-600 text-white',
    Packaging: 'bg-emerald-600 text-white',
};

const fadeUp = {
    hidden: { opacity: 0, y: 32 },
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
            {!loaded && <div className="absolute inset-0 bg-slate-100 animate-pulse" />}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={priority ? 'high' : 'auto'}
                onLoad={() => setLoaded(true)}
                className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
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
            {showDivider && <div className="hidden lg:block w-px h-16 bg-slate-200 mx-10" />}
            <div className="flex-1 text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-[#0A1628] leading-none">
                    <AnimatedCounter end={value} suffix={suffix} />
                </div>
                <p className="mt-2 text-slate-500 text-sm font-medium">{label}</p>
            </div>
        </div>
    );
}

const PROCESS_STEP_THEMES = [
    {
        gradient: 'from-[#FF5C00] via-[#FF7A33] to-[#FFB347]',
        orb: 'bg-[#FF5C00]/30',
        iconBg: 'from-orange-400/20 to-amber-500/10',
        ring: 'ring-orange-400/40',
    },
    {
        gradient: 'from-[#4F46E5] via-[#6366F1] to-[#818CF8]',
        orb: 'bg-indigo-500/25',
        iconBg: 'from-indigo-400/20 to-violet-500/10',
        ring: 'ring-indigo-400/40',
    },
    {
        gradient: 'from-[#0284C7] via-[#0EA5E9] to-[#38BDF8]',
        orb: 'bg-sky-500/25',
        iconBg: 'from-sky-400/20 to-cyan-500/10',
        ring: 'ring-sky-400/40',
    },
    {
        gradient: 'from-[#059669] via-[#10B981] to-[#34D399]',
        orb: 'bg-emerald-500/25',
        iconBg: 'from-emerald-400/20 to-teal-500/10',
        ring: 'ring-emerald-400/40',
    },
];

const STEP_HOLD_MS = 2800;
const STEP_TRANSITION = 0.85;

function ProcessFlow() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: '-60px' });
    const [activeStep, setActiveStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [cycleKey, setCycleKey] = useState(0);
    const jumpStepRef = useRef(null);

    useEffect(() => {
        if (!isInView) return;

        let stepIndex = jumpStepRef.current ?? 0;
        jumpStepRef.current = null;
        setActiveStep(stepIndex);
        setProgress(0);

        let frame;
        let start = performance.now();

        const tick = (now) => {
            const elapsed = now - start;
            const stepProgress = Math.min(elapsed / STEP_HOLD_MS, 1);
            setProgress(stepProgress);

            if (elapsed >= STEP_HOLD_MS) {
                stepIndex = (stepIndex + 1) % PROCESS_STEPS.length;
                setActiveStep(stepIndex);
                start = now;
                setProgress(0);
            }

            frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [isInView, cycleKey]);

    const theme = PROCESS_STEP_THEMES[activeStep];
    const step = PROCESS_STEPS[activeStep];
    const StepIcon = step.icon;

    return (
        <div ref={ref} className="max-w-5xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden bg-[#0A1628] shadow-2xl shadow-[#0A1628]/20 border border-white/10">
                {/* Animated gradient backdrop */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: STEP_TRANSITION }}
                        className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`}
                    />
                </AnimatePresence>

                {/* Soft blend orbs */}
                <motion.div
                    animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute -top-20 -left-16 w-72 h-72 rounded-full blur-3xl ${theme.orb}`}
                />
                <motion.div
                    animate={{ x: [0, -25, 0], y: [0, 25, 0], scale: [1.1, 1, 1.1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full blur-3xl bg-[#0A1628]/50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/90 via-[#0A1628]/40 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,22,40,0.35)_100%)]" />

                {/* Film strip top bar */}
                <div className="relative z-10 flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/20 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                            Delivery workflow
                        </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/50 tabular-nums">
                        {String(activeStep + 1).padStart(2, '0')} / {String(PROCESS_STEPS.length).padStart(2, '0')}
                    </span>
                </div>

                {/* Main scene */}
                <div className="relative z-10 px-6 py-10 md:py-14 min-h-[280px] md:min-h-[320px] flex flex-col items-center justify-center text-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, y: 24, scale: 0.96, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -20, scale: 1.02, filter: 'blur(6px)' }}
                            transition={{ duration: STEP_TRANSITION, ease: [0.22, 1, 0.36, 1] }}
                            className="flex flex-col items-center max-w-md"
                        >
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                className={`relative mb-6 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${theme.iconBg} backdrop-blur-md ring-2 ${theme.ring} flex items-center justify-center shadow-lg shadow-black/20`}
                            >
                                <StepIcon className="w-9 h-9 md:w-10 md:h-10 text-white" strokeWidth={1.5} />
                                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-[#0A1628] text-xs font-bold flex items-center justify-center shadow-md">
                                    {activeStep + 1}
                                </span>
                            </motion.div>

                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                                {step.title}
                            </h3>
                            <p className="text-white/75 text-sm md:text-base leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Timeline + progress */}
                <div className="relative z-10 px-5 pb-5 pt-2 bg-black/25 backdrop-blur-md border-t border-white/10">
                    <div className="flex gap-2 mb-4">
                        {PROCESS_STEPS.map((s, i) => {
                            const isActive = i === activeStep;
                            const isDone = i < activeStep;
                            const Icon = s.icon;

                            return (
                                <button
                                    key={s.title}
                                    type="button"
                                    onClick={() => {
                                        jumpStepRef.current = i;
                                        setCycleKey((k) => k + 1);
                                    }}
                                    className={`flex-1 relative rounded-xl p-2.5 md:p-3 text-left transition-all duration-500 border ${
                                        isActive
                                            ? 'bg-white/15 border-white/30 shadow-lg shadow-black/20'
                                            : isDone
                                              ? 'bg-white/8 border-white/15'
                                              : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Icon
                                            className={`w-3.5 h-3.5 shrink-0 ${
                                                isActive ? 'text-white' : isDone ? 'text-white/70' : 'text-white/40'
                                            }`}
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`text-[11px] md:text-xs font-semibold truncate ${
                                                isActive ? 'text-white' : 'text-white/50'
                                            }`}
                                        >
                                            {s.title}
                                        </span>
                                    </div>
                                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full bg-gradient-to-r ${PROCESS_STEP_THEMES[i].gradient}`}
                                            animate={{
                                                width: isDone ? '100%' : isActive ? `${progress * 100}%` : '0%',
                                            }}
                                            transition={{ duration: 0.15, ease: 'linear' }}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <p className="text-center text-[11px] text-white/40 font-medium">
                        From order to doorstep — automated, tracked, and on time
                    </p>
                </div>
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
            transition={{ duration: 0.5, delay: index * 0.06 }}
            className={`group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 ${
                item.tall ? 'lg:row-span-2' : ''
            }`}
        >
            <div className={`relative overflow-hidden ${item.tall ? 'h-72 lg:min-h-[420px]' : 'h-56'}`}>
                <ShowcaseImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                        CATEGORY_STYLES[item.category]
                    }`}
                >
                    {item.category}
                </span>
            </div>
            <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#FF5C00] transition-colors">
                    {item.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
            </div>
        </motion.article>
    );
}

const Showcase = () => {
    const scrollToWork = () => {
        document.getElementById('our-work')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-white text-slate-900 overflow-x-hidden">
            <SEO
                title="Our Work"
                description="See how Prime Audio delivers across Nairobi and Kenya — client setups, logistics, packaging, and happy customers."
                keywords="prime audio portfolio, nairobi audio shop, delivery logistics, client setups, kenya"
            />

            {/* Hero */}
            <section className="relative -mt-20 pt-20 min-h-[70vh] flex items-center">
                <ShowcaseImage
                    src={IMAGES.hero}
                    alt="Kenyan delivery team loading packages in Nairobi"
                    priority
                    wrapperClassName="absolute inset-0 overflow-hidden"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/55 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />

                <div className="relative z-10 container mx-auto px-4 py-10 lg:py-14">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="max-w-xl"
                        >
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A1628] leading-tight mb-5">
                                We Deliver.
                                <br />
                                <span className="text-[#FF5C00]">You Shine.</span>
                            </h1>
                            <p className="text-slate-600 text-base lg:text-lg mb-8 leading-relaxed">
                                From our Nairobi shop to your door — we handle every order, setup, and delivery across Kenya.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={scrollToWork}
                                    className="px-6 py-3 bg-[#FF5C00] hover:bg-[#e65200] text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    See Our Work
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                <Link
                                    to="/contact"
                                    className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    Get a Quote
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.15 }}
                            className="hidden lg:grid grid-cols-2 gap-3"
                        >
                            {PORTFOLIO_ITEMS.slice(0, 4).map((item, i) => (
                                <div
                                    key={item.title}
                                    className={`relative rounded-xl overflow-hidden border border-slate-200 shadow-sm ${
                                        i === 0 ? 'col-span-2 h-40' : 'h-28'
                                    }`}
                                >
                                    <ShowcaseImage
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-8 bg-slate-50 border-y border-slate-200">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
                        <StatItem value={500} suffix="+" label="Deliveries Completed" />
                        <StatItem value={120} suffix="+" label="Happy Clients" showDivider />
                        <StatItem value={15} suffix="+" label="Towns Across Kenya" showDivider />
                        <StatItem value={98} suffix="%" label="Satisfaction Rate" showDivider />
                    </div>
                </div>
            </section>

            {/* Portfolio */}
            <section id="our-work" className="py-10 md:py-14">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="mb-6"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-[#0A1628] mb-2">
                            Our Work in Action
                        </h2>
                        <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">
                            Real projects across Nairobi and beyond — setups, deliveries, and logistics for clients who trust us with their gear.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PORTFOLIO_ITEMS.map((item, i) => (
                            <PortfolioCard key={item.title} item={item} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Project */}
            <section className="py-10 md:py-14 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-[4/3] lg:aspect-auto lg:h-[480px]"
                        >
                            <ShowcaseImage
                                src={IMAGES.featured}
                                alt="Weekend bulk order fulfillment at Nairobi warehouse"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 className="text-xl md:text-2xl font-bold text-[#0A1628] mb-3 leading-tight">
                                How We Delivered 300 Orders in One Weekend
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-5">
                                Harmony Retail Group launched a flash sale on premium audio gear — and 300 orders hit
                                their system in 48 hours. We mobilised our full Nairobi warehouse team, extended dispatch
                                hours, and coordinated 12 delivery routes across the city. Every item was
                                quality-checked, packed, and delivered before Monday morning.
                            </p>

                            <div className="grid grid-cols-3 gap-3 mb-5">
                                {[
                                    { stat: '300', label: 'Orders Fulfilled' },
                                    { stat: '0', label: 'Returns' },
                                    { stat: '2-Day', label: 'Turnaround' },
                                ].map((s) => (
                                    <div key={s.label} className="bg-white rounded-xl p-4 text-center border border-slate-200">
                                        <div className="text-xl md:text-2xl font-bold text-[#FF5C00]">{s.stat}</div>
                                        <div className="text-[11px] text-slate-500 mt-1 font-medium">{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            <blockquote className="border-l-4 border-[#FF5C00] pl-5">
                                <p className="text-slate-600 italic leading-relaxed mb-3 text-sm">
                                    &ldquo;Prime Audio turned what could have been a logistics nightmare into our smoothest
                                    product launch ever. 300 orders, zero issues — our Nairobi customers were blown away.&rdquo;
                                </p>
                                <footer className="text-sm">
                                    <span className="font-semibold text-slate-900">David Njoroge</span>
                                    <span className="text-slate-500"> — Harmony Retail Group</span>
                                </footer>
                            </blockquote>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Process */}
            <section id="process" className="py-10 md:py-14">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="text-center mb-5"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-[#0A1628]">
                            Four Steps to Flawless Delivery
                        </h2>
                        <p className="text-slate-500 text-sm mt-1.5">
                            Watch how every order moves from click to doorstep
                        </p>
                    </motion.div>

                    <ProcessFlow />
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-10 md:py-14 bg-slate-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="text-center mb-6"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-[#0A1628]">
                            Clients Who Trust Us
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div
                                key={t.name}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                transition={{ delay: i * 0.08 }}
                                className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex gap-0.5 mb-4">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-[#FF5C00] text-[#FF5C00]" />
                                    ))}
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                                    <div className="w-10 h-10 rounded-full bg-[#FF5C00] flex items-center justify-center text-white font-semibold text-xs">
                                        {t.initials}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                                        <div className="text-xs text-slate-500">{t.company}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 md:py-16 bg-[#FF5C00]">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="max-w-2xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to Work With Us?
                        </h2>
                        <p className="text-white/90 mb-8 text-base">
                            Let&apos;s handle your next delivery like it&apos;s our own — from Nairobi to anywhere in Kenya.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0A1628] hover:bg-[#0F1D32] text-white rounded-lg font-semibold transition-colors"
                        >
                            Contact Us Today
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Showcase;
