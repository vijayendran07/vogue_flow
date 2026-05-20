import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiMail,
  FiPhone,
  FiMapPin,
  FiHeart
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
      { name: 'Size Guide', path: '/size-guide' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
    ],
  };

  const socialLinks = [
    { icon: FiInstagram, href: '#', label: 'Instagram' },
    { icon: FiTwitter, href: '#', label: 'Twitter' },
    { icon: FiFacebook, href: '#', label: 'Facebook' },
  ];

  return (
    <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">

            {/* Brand Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Link to="/" className="inline-block group">
                  <span className="text-3xl font-black bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
                    VogueFlow
                  </span>
                </Link>
                <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-sm">
                  Discover premium fashion with curated collections, exceptional quality, and unparalleled style.
                  Elevate your wardrobe with VogueFlow.
                </p>

                {/* Contact Info */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FiMail className="w-4 h-4 mr-3 text-primary-500" />
                    hello@vogueflow.com
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FiPhone className="w-4 h-4 mr-3 text-primary-500" />
                    +1 (555) 123-4567
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FiMapPin className="w-4 h-4 mr-3 text-primary-500" />
                    New York, NY 10001
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-6 flex space-x-4">
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
                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Shop Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Shop
              </h3>
              <ul className="space-y-3">
                {footerLinks.shop.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Account Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Account
              </h3>
              <ul className="space-y-3">
                {footerLinks.account.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Support Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="py-6 border-t border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span>© {new Date().getFullYear()} VogueFlow. Made with</span>
              <FiHeart className="w-4 h-4 mx-1 text-red-500" />
              <span>for fashion lovers.</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <span>🇺🇸 English</span>
              <span>💳 SSL Secured</span>
              <span>🚚 Free Shipping Over $100</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
