import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Company Info */}
                    <div>
                        <img src="/logo.png" alt="Prime Audio" className="h-12 mb-6" />
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            East Africa's premier destination for professional musical instruments and audio equipment since 2010.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-prime-red rounded-full flex items-center justify-center transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-prime-red rounded-full flex items-center justify-center transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-prime-red rounded-full flex items-center justify-center transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-prime-red rounded-full flex items-center justify-center transition-colors">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/shop" className="text-gray-400 hover:text-white transition-colors">Shop</Link></li>
                            <li><Link to="/showcase" className="text-gray-400 hover:text-white transition-colors">Our Work</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/brands" className="text-gray-400 hover:text-white transition-colors">Brands</Link></li>
                            <li><Link to="/deals" className="text-gray-400 hover:text-white transition-colors">Hot Deals</Link></li>
                            <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                            <li><Link to="/track-order" className="text-gray-400 hover:text-white transition-colors">Track Order</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Support</h3>
                        <ul className="space-y-3">
                            <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link to="/shipping" className="text-gray-400 hover:text-white transition-colors">Shipping Info</Link></li>
                            <li><Link to="/returns" className="text-gray-400 hover:text-white transition-colors">Returns</Link></li>
                            <li><Link to="/warranty" className="text-gray-400 hover:text-white transition-colors">Warranty</Link></li>
                            <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Contact Info</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-prime-red flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-gray-400">Luthuli Avenue</p>
                                    <p className="text-gray-400">Nairobi CBD, Kenya</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-prime-red flex-shrink-0" />
                                <a href="tel:+254712345678" className="text-gray-400 hover:text-white transition-colors">
                                    +254 712 345 678
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-prime-red flex-shrink-0" />
                                <a href="mailto:info@primeaudio.co.ke" className="text-gray-400 hover:text-white transition-colors">
                                    info@primeaudio.co.ke
                                </a>
                            </li>
                        </ul>
                        <div className="mt-6 p-4 bg-white/5 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Business Hours:</p>
                            <p className="text-white font-semibold">Mon - Sat: 9AM - 7PM</p>
                            <p className="text-gray-400 text-sm">Sunday: Closed</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} Prime Audio Solutions. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
                            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
                            <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
