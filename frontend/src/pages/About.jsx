import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const IMAGES = {
    hero: '/about/hero.png',
    consultation: '/about/consultation.png',
    operations: '/about/operations.png',
    installations: '/about/installations.png',
};

const METRICS = [
    { value: '15+', label: 'Years operating in East Africa' },
    { value: '5,000+', label: 'Clients across Kenya' },
    { value: '50+', label: 'Authorised brand lines' },
    { value: '98%', label: 'On-time fulfilment rate' },
];

const SERVICES = [
    {
        title: 'Equipment supply',
        description:
            'Authorised distribution of instruments, pro-audio, DJ, and studio gear with manufacturer warranty and genuine product sourcing.',
    },
    {
        title: 'Technical advisory',
        description:
            'Specification support for studios, venues, schools, and corporate installations — from room acoustics to system design.',
    },
    {
        title: 'Logistics & fulfilment',
        description:
            'Same-day dispatch in Nairobi, tracked nationwide delivery, and structured handling for bulk and institutional orders.',
    },
    {
        title: 'After-sales service',
        description:
            'Warranty registration, repair coordination, and ongoing account management for retail and B2B partners.',
    },
];

const MILESTONES = [
    {
        year: '2010',
        title: 'Nairobi showroom established',
        detail: 'Opened on Luthuli Avenue as a specialist instrument and audio retailer serving local musicians.',
    },
    {
        year: '2014',
        title: 'Catalogue expansion',
        detail: 'Added studio, live sound, and DJ lines from international manufacturers through official channels.',
    },
    {
        year: '2018',
        title: 'Events & corporate division',
        detail: 'Launched PA and backline supply for festivals, conferences, and venue installations.',
    },
    {
        year: '2022',
        title: 'E-commerce platform',
        detail: 'Introduced online ordering with inventory visibility, order tracking, and showroom pickup.',
    },
    {
        year: '2025',
        title: 'Regional B2B growth',
        detail: 'Expanded corporate accounts, institutional procurement, and cross-border client support.',
    },
];

const CAPABILITIES = [
    'Studio and broadcast equipment procurement',
    'Live event PA and backline coordination',
    'Retail display and in-store demo programmes',
    'Bulk supply for schools and institutions',
    'Warranty and repair management',
    'Corporate account quoting and invoicing',
];

const PARTNERS = [
    'Yamaha',
    'Shure',
    'Pioneer',
    'Roland',
    'Focusrite',
    'JBL',
    'Fender',
    'Audio-Technica',
    'Pearl',
    'Sennheiser',
];

const About = () => {
    return (
        <div className="bg-white min-h-screen text-slate-900">
            <SEO
                title="About Prime Audio"
                description="Prime Audio Solutions Ltd. — East Africa's professional audio distributor since 2010. Authorised gear, technical expertise, and reliable fulfilment from Nairobi."
                keywords="about prime audio, pro audio distributor kenya, music equipment nairobi, audio solutions east africa"
            />

            {/* Hero */}
            <section className="border-b border-slate-200">
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-10 md:py-12">
                        <div className="max-w-lg">
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 mb-3">
                                About Prime Audio Solutions
                            </p>
                            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 leading-snug mb-4">
                                Professional audio distribution for East Africa
                            </h1>
                            <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                Since 2010, we have supplied musicians, studios, venues, and retailers with
                                authenticated equipment, technical guidance, and dependable fulfilment from our
                                Nairobi headquarters.
                            </p>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                                <Link
                                    to="/shop"
                                    className="font-medium text-blue-700 hover:text-blue-800 underline underline-offset-4 decoration-blue-700/30 hover:decoration-blue-800"
                                >
                                    View catalogue
                                </Link>
                                <span className="text-slate-300 hidden sm:inline">|</span>
                                <Link
                                    to="/contact"
                                    className="font-medium text-slate-700 hover:text-slate-900 underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500"
                                >
                                    Contact sales
                                </Link>
                            </div>
                        </div>
                        <div className="relative aspect-[4/3] lg:aspect-[16/11] overflow-hidden border border-slate-200 bg-slate-100">
                            <img
                                src={IMAGES.hero}
                                alt="Prime Audio professional equipment showroom"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Metrics */}
            <section className="border-b border-slate-200 bg-slate-50/80">
                <div className="container mx-auto px-4 lg:px-6 py-7">
                    <dl className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
                        {METRICS.map((item) => (
                            <div key={item.label}>
                                <dt className="text-lg font-semibold text-slate-900 tabular-nums">{item.value}</dt>
                                <dd className="text-xs text-slate-500 mt-1 leading-relaxed">{item.label}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* Company profile */}
            <section className="border-b border-slate-200">
                <div className="container mx-auto px-4 lg:px-6 py-12 md:py-14">
                    <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                        <div className="lg:col-span-5">
                            <div className="aspect-[4/5] overflow-hidden border border-slate-200 bg-slate-100">
                                <img
                                    src={IMAGES.consultation}
                                    alt="Technical consultation at Prime Audio"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                        <div className="lg:col-span-7">
                            <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
                                Who we are
                            </h2>
                            <div className="space-y-4 text-sm text-slate-600 leading-relaxed max-w-2xl">
                                <p>
                                    Prime Audio Solutions Ltd. began as a specialist instrument retailer in Nairobi
                                    and has grown into a full-service partner for professional audio across Kenya
                                    and the wider region.
                                </p>
                                <p>
                                    We work with artists, production companies, houses of worship, educational
                                    institutions, and retail chains — combining curated inventory with the technical
                                    depth required for serious deployments.
                                </p>
                            </div>

                            <div className="mt-10 grid sm:grid-cols-2 gap-8 pt-8 border-t border-slate-200">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Mission</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Deliver authentic pro-audio and musical instruments with expert guidance and
                                        dependable after-sales support at every stage of the client relationship.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Vision</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        To be East Africa's most trusted name in professional audio — recognised for
                                        product integrity, technical competence, and long-term partnerships.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="border-b border-slate-200 bg-white">
                <div className="container mx-auto px-4 lg:px-6 py-12 md:py-14">
                    <div className="max-w-2xl mb-10">
                        <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3">
                            What we deliver
                        </h2>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            End-to-end support from product selection through deployment and ongoing maintenance.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
                        {SERVICES.map((service) => (
                            <div key={service.title} className="bg-white p-5 md:p-6">
                                <h3 className="text-sm font-semibold text-slate-900 mb-2">{service.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">{service.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div className="aspect-[16/10] overflow-hidden border border-slate-200 bg-slate-100">
                            <img
                                src={IMAGES.operations}
                                alt="Prime Audio warehouse and fulfilment operations"
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">
                                Operations & fulfilment
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                Our Nairobi facility handles receiving, quality checks, and dispatch for retail,
                                e-commerce, and B2B orders. Inventory is managed against live stock levels with
                                structured packing for fragile and high-value equipment.
                            </p>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Regional delivery is coordinated through trusted carriers with tracking provided
                                for every shipment leaving our warehouse.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Installations */}
            <section className="border-b border-slate-200 bg-slate-50/50">
                <div className="container mx-auto px-4 lg:px-6 py-12 md:py-14">
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                        <div className="order-2 lg:order-1">
                            <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3">
                                Installations & live events
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                Beyond retail supply, we support corporate launches, festivals, and venue
                                installations with PA systems, backline, and on-site technical coordination.
                            </p>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Our team works to specification, load-in schedules, and post-event breakdown
                                requirements — ensuring equipment is tested, tuned, and ready before doors open.
                            </p>
                            <Link
                                to="/showcase"
                                className="inline-block mt-5 text-sm font-medium text-blue-700 hover:text-blue-800 underline underline-offset-4 decoration-blue-700/30"
                            >
                                See project portfolio
                            </Link>
                        </div>
                        <div className="order-1 lg:order-2 aspect-[16/10] overflow-hidden border border-slate-200 bg-slate-100">
                            <img
                                src={IMAGES.installations}
                                alt="Corporate event audio installation by Prime Audio"
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline & capabilities */}
            <section className="border-b border-slate-200">
                <div className="container mx-auto px-4 lg:px-6 py-12 md:py-14">
                    <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
                        <div className="lg:col-span-7">
                            <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-8">
                                Company history
                            </h2>
                            <div className="space-y-6">
                                {MILESTONES.map((item) => (
                                    <div
                                        key={item.year}
                                        className="grid grid-cols-[3.5rem_1fr] gap-4 pb-6 border-b border-slate-100 last:border-0 last:pb-0"
                                    >
                                        <span className="text-xs font-medium text-slate-400 pt-0.5 tabular-nums">
                                            {item.year}
                                        </span>
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-6">
                                Core capabilities
                            </h2>
                            <ul className="divide-y divide-slate-200 border border-slate-200 bg-white">
                                {CAPABILITIES.map((item) => (
                                    <li
                                        key={item}
                                        className="px-4 py-3 text-xs text-slate-600 leading-relaxed"
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="border-b border-slate-200 bg-slate-50/80">
                <div className="container mx-auto px-4 lg:px-6 py-8">
                    <p className="text-xs text-slate-500 mb-5">
                        Authorised distribution and partner lines include
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {PARTNERS.map((brand) => (
                            <span key={brand} className="text-xs font-medium text-slate-400">
                                {brand}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section>
                <div className="container mx-auto px-4 lg:px-6 py-12 md:py-14">
                    <div className="border border-slate-200 px-6 py-8 md:px-10 md:py-9 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-base font-semibold text-slate-900 mb-2">
                                Discuss your next project
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Contact our sales desk for quotations, bulk procurement, or technical recommendations
                                tailored to your requirements.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 shrink-0">
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                            >
                                Contact us
                            </Link>
                            <Link
                                to="/shop"
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-slate-300 hover:border-slate-400 text-slate-700 transition-colors"
                            >
                                Browse shop
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
