import { motion } from 'framer-motion';

// Page transition wrapper
const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            {children}
        </motion.div>
    );
};

// Fade transition
export const FadeTransition = ({ children }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
    >
        {children}
    </motion.div>
);

// Slide from right transition
export const SlideRightTransition = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
    >
        {children}
    </motion.div>
);

// Scale transition
export const ScaleTransition = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
    >
        {children}
    </motion.div>
);

// Scroll reveal animation
export const ScrollReveal = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay }}
    >
        {children}
    </motion.div>
);

// Stagger children animation
export const StaggerContainer = ({ children, staggerDelay = 0.1 }) => (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={{
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: staggerDelay
                }
            }
        }}
    >
        {children}
    </motion.div>
);

export const StaggerItem = ({ children }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}
    >
        {children}
    </motion.div>
);

export default PageTransition;
