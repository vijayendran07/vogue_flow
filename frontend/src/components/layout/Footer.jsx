import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiMail,
  FiPhone,
  FiMapPin,
  FiHeart,
  FiShield,
  FiRefreshCcw,
  FiTruck,
  FiAward,
  FiLock
} from 'react-icons/fi';

const Footer = () => {
  const footerLinks = {
    shop: [
      { name: 'All Products', path: '/products' },
      { name: 'Categories', path: '/categories' },
      { name: 'New Arrivals', path: '/products?sort=newest' },
      { name: 'Sale', path: '/products?sort=lowest' },
    ],
    account: [
      { name: 'My Account', path: '/profile' },
      { name: 'My Orders', path: '/orders/me' },
      { name: 'Wishlist', path: '/wishlist' },
      { name: 'Settings', path: '/settings' },
    ],
    support: [
      { name: 'Contact Us', path: '/contact' },
      { name: 'Shipping Info', path: '/shipping' },
      { name: 'Returns', path: '/returns' },
      { name: 'FAQ', path: '/faq' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
    ],
  };

  const socialLinks = [
    { icon: FiInstagram, href: 'https://www.instagram.com/', label: 'Instagram' },
    { icon: FiFacebook, href: 'https://www.facebook.com/', label: 'Facebook' },
    { icon: FiMail, href: 'https://www.gmail.com', label: 'Mail' },
    { icon: FiPhone, href: 'https://www.whatsapp.com', label: 'Phone' }
  ];

  return (
    <footer className="bg-slate-950 text-gray-300 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer Content */}
        <div className="py-6 lg:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-8">

            {/* Brand Section */}
             
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Link to="/" className="inline-block group">
                  <span className="text-3xl font-black text-blue-500 group-hover:scale-105 transition-transform duration-200">
                    VogueFlow
                  </span>
                </Link>
                <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-sm">
                  Discover premium fashion with curated collections, exceptional quality, and unparalleled style.
                  Elevate your wardrobe with VogueFlow.
                </p>
                
                


                {/* Contact Info */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-400 hover:text-bluetransition-colors duration-200">
                    <FiMail className="w-4 h-4 mr-3 text-blue-500" />
                    hello@vogueflow.com
                  </div>
                  <div className="flex items-center text-sm text-gray-400 hover:text-blue transition-colors duration-200">
                    <FiPhone className="w-4 h-4 mr-3 text-blue-500" />
                    +1 (555) 123-4567
                  </div>
                  <div className="flex items-center text-sm text-gray-400 hover:text-blue transition-colors duration-200">
                    <FiMapPin className="w-4 h-4 mr-3 text-blue-500" />
                   Tamil Nadu, India
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-4 flex space-x-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={social.label}
                        href={social.href}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30 border border-white/5 transition-all duration-200"
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Cell 1: Shop & Account */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-8"
              >
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-4">Shop</h3>
                  <ul className="space-y-3">
                    {footerLinks.shop.map((link) => (
                      <li key={link.name}>
                        <Link to={link.path} className="text-sm text-gray-400 hover:text-blue-500 transition-colors duration-200">{link.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-4">Account</h3>
                  <ul className="space-y-3">
                    {footerLinks.account.map((link) => (
                      <li key={link.name}>
                        <Link to={link.path} className="text-sm text-gray-400 hover:text-blue-500 transition-colors duration-200">{link.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Cell 2: Support & Legal */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-8"
              >
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-4">Support</h3>
                  <ul className="space-y-3">
                    {footerLinks.support.map((link) => (
                      <li key={link.name}>
                        <Link to={link.path} className="text-sm text-gray-400 hover:text-blue-500 transition-colors duration-200">{link.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-4">Legal</h3>
                  <ul className="space-y-3">
                    {footerLinks.legal.map((link) => (
                      <li key={link.name}>
                        <Link to={link.path} className="text-sm text-gray-400 hover:text-blue-500 transition-colors duration-200">{link.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

             

            
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="py-4 border-t border-white/5"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center text-sm text-gray-400">
              <span>© {new Date().getFullYear()} VogueFlow. Made with</span>
              <FiHeart className="w-4 h-4 mx-1 text-blue-500 animate-pulse" />
              <span>for fashion lovers.</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span></span>
              <span> Secured payment way</span>
              <span>Free Shipping Over rs.1000</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
